/**
 * Custom Domain API - Add and List
 * POST - Add a new custom domain
 * GET - List user's custom domains
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDNSRecords } from '@/lib/dns-config';
import {
  validateDomain,
  normalizeDomain,
  generateVerificationToken,
  isOwnDomain,
} from '@/lib/domain-utils';
import { sendEmail } from '@/lib/sendEmail';
import { domainAddedEmail } from '@/lib/templates/customDomainEmails';
import { validateSession } from '@/lib/session-validator';

/**
 * Add a new custom domain
 */
export async function POST(req: NextRequest) {
  try {
    const sessionValidation = await validateSession(req);
    if (!sessionValidation.valid || !sessionValidation.user) {
      return NextResponse.json(
        { error: sessionValidation.error || 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    const userIdInt = sessionValidation.user.id;
    const userEmail = sessionValidation.user.email;
    const userNameFromDb = sessionValidation.user.name;

    // Parse request body
    const body = await req.json();
    const { domain, portfolioId } = body;

    console.log('[Custom Domain] Add domain request:', {
      domain,
      portfolioId,
      userId: userIdInt,
      portfolioIdType: typeof portfolioId,
    });

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    // Normalize domain first (strips protocol, trailing slashes, etc.)
    const normalizedDomain = normalizeDomain(domain);

    // Validate domain format using normalized domain
    if (!validateDomain(normalizedDomain)) {
      return NextResponse.json(
        { error: 'Invalid domain format. Please enter just the domain name (e.g., example.com)' },
        { status: 400 }
      );
    }

    // Check if it's our own domain
    if (isOwnDomain(normalizedDomain)) {
      return NextResponse.json(
        { error: 'Cannot use the app\'s own domain' },
        { status: 400 }
      );
    }

    // First, find the actual portfolio for this user
    const userPortfolio = await prisma.portfolio.findUnique({
      where: {
        userId: userIdInt,
      },
    });

    console.log('[Custom Domain] User portfolio lookup:', {
      foundByUserId: !!userPortfolio,
      actualPortfolioId: userPortfolio?.id,
      requestedPortfolioId: portfolioId,
      match: userPortfolio?.id === portfolioId,
    });

    // Check if portfolio exists and belongs to user
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: userIdInt,
      },
    });

    console.log('[Custom Domain] Portfolio lookup result:', {
      found: !!portfolio,
      portfolioId: portfolio?.id,
      portfolioUserId: portfolio?.userId,
      requestedUserId: userIdInt,
    });

    if (!portfolio) {
      // If portfolio with that ID not found, but user has a portfolio, return helpful message
      if (userPortfolio) {
        return NextResponse.json(
          { 
            error: `Portfolio ID mismatch. Your actual portfolio ID is ${userPortfolio.id}, but the app is using ${portfolioId}. Please refresh the page.`,
            actualPortfolioId: userPortfolio.id,
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Portfolio not found or access denied. Please refresh the page and try again.' },
        { status: 404 }
      );
    }

    // Check if portfolio is published
    if (!portfolio.isPublished) {
      return NextResponse.json(
        { error: 'Portfolio must be published before adding a custom domain' },
        { status: 400 }
      );
    }

    // Check if domain already exists
    const existingDomain = await prisma.customDomain.findUnique({
      where: { domain: normalizedDomain },
    });

    if (existingDomain) {
      return NextResponse.json(
        { error: 'Domain is already in use' },
        { status: 409 }
      );
    }

    // Check if portfolio already has a custom domain
    const existingPortfolioDomain = await prisma.customDomain.findUnique({
      where: { portfolioId: portfolioId },
    });

    if (existingPortfolioDomain) {
      return NextResponse.json(
        { error: 'Portfolio already has a custom domain. Remove the existing one first.' },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // IMPORTANT: Add domain to Vercel FIRST to get the correct IP
    // Vercel provides the IP address that should be used for A record
    console.log(`[Custom Domain] Adding domain to Vercel first to get DNS configuration: ${normalizedDomain}`);
    const { addDomainToVercel, getVercelRecommendedIP } = await import('@/lib/vercel-api');
    const vercelResult = await addDomainToVercel(normalizedDomain, portfolioId.toString());

    // Log Vercel API result for debugging
    if (!vercelResult.success) {
      console.warn(`[Custom Domain] Failed to add domain to Vercel: ${vercelResult.error}`);
      
      // Check if domain is in different project
      if ((vercelResult as any).inDifferentProject) {
        console.error(`[Custom Domain] Domain is in a DIFFERENT Vercel project!`);
        console.error(`[Custom Domain] Other project ID: ${(vercelResult as any).otherProjectId}`);
        console.error(`[Custom Domain] Current project ID: ${process.env.VERCEL_PROJECT_ID}`);
        // Don't create domain in database if it's in different project
        return NextResponse.json(
          {
            error: vercelResult.error || 'Domain is already in use by another Vercel project. Please remove it from that project first.',
            inDifferentProject: true,
            otherProjectId: (vercelResult as any).otherProjectId,
          },
          { status: 409 }
        );
      }
      
      console.warn(`[Custom Domain] Domain will be created in database but may need manual addition to Vercel`);
      console.warn(`[Custom Domain] Check VERCEL_API_TOKEN and VERCEL_PROJECT_ID environment variables`);
    } else {
      console.log(`[Custom Domain] Successfully added domain to Vercel: ${normalizedDomain}`);
    }

    // Get recommended IP from Vercel (or fallback to env var)
    const ipResult = await getVercelRecommendedIP(portfolioId.toString());
    const vercelIP = ipResult.ip || null;
    console.log(`[Custom Domain] Vercel IP for domain: ${vercelIP || 'using fallback'}`);

    // Create custom domain record with Vercel IP
    const customDomain = await prisma.customDomain.create({
      data: {
        domain: normalizedDomain,
        portfolioId: portfolioId,
        userId: userIdInt,
        verificationToken: verificationToken,
        verified: false,
        vercelIPAddress: vercelIP, // Store IP from Vercel
      },
    });

    // Generate DNS records using the IP from Vercel (or fallback)
    const dnsRecords = await generateDNSRecords(normalizedDomain, verificationToken, vercelIP);

      if (userEmail) {
        try {
          const emailHtml = domainAddedEmail({
            userName: userNameFromDb || userEmail,
            domain: customDomain.domain,
            verificationToken,
          });

          await sendEmail({
            to: userEmail,
            subject: `Custom domain instructions for ${customDomain.domain}`,
            html: emailHtml,
          });
        } catch (emailError) {
          console.error('[Custom Domain] Failed to send domain added email:', emailError);
        }
      }

    return NextResponse.json({
      success: true,
      domain: customDomain.domain,
      id: customDomain.id,
      verified: customDomain.verified,
      verificationToken: customDomain.verificationToken,
      dnsRecords: dnsRecords,
      // Include Vercel API status for debugging
      vercelAdded: vercelResult.success,
      vercelError: vercelResult.success ? undefined : vercelResult.error,
      warning: !vercelResult.success 
        ? 'Domain added to database but may need manual addition to Vercel. Check Vercel Dashboard → Settings → Domains.'
        : undefined,
    });
  } catch (error) {
    console.error('Error adding custom domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get user's custom domains
 */
export async function GET(req: NextRequest) {
  try {
    const sessionValidation = await validateSession(req);
    if (!sessionValidation.valid || !sessionValidation.user) {
      return NextResponse.json(
        { error: sessionValidation.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const userIdInt = sessionValidation.user.id;

    // Get all custom domains for user
    const customDomains = await prisma.customDomain.findMany({
      where: {
        userId: userIdInt,
      },
      include: {
        portfolio: {
          select: {
            id: true,
            displayName: true,
            customUsername: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      domains: customDomains,
    });
  } catch (error) {
    console.error('Error fetching custom domains:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

