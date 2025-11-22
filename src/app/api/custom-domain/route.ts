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
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/sendEmail';
import { domainAddedEmail } from '@/lib/templates/customDomainEmails';

/**
 * Add a new custom domain
 */
export async function POST(req: NextRequest) {
  try {
    // Get user session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('github-session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const githubId = session?.user?.id;
    if (!githubId) {
      return NextResponse.json(
        { error: 'Unauthorized - No user ID in session' },
        { status: 401 }
      );
    }

    // Find the actual database user ID by GitHub ID
      const dbUser = await prisma.user.findUnique({
        where: { githubId: githubId },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

      const userIdInt = dbUser.id;
      const userEmail = dbUser.email;
      const userNameFromDb = dbUser.name;

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

    // Create custom domain record
    const customDomain = await prisma.customDomain.create({
      data: {
        domain: normalizedDomain,
        portfolioId: portfolioId,
        userId: userIdInt,
        verificationToken: verificationToken,
        verified: false,
      },
    });

    // Generate DNS records
      const dnsRecords = generateDNSRecords(normalizedDomain, verificationToken);

      if (userEmail) {
        try {
          const emailHtml = domainAddedEmail({
            userName: userNameFromDb || session?.user?.name || userEmail,
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
    // Get user session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('github-session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const githubId = session?.user?.id;
    if (!githubId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the actual database user ID by GitHub ID
    const dbUser = await prisma.user.findUnique({
      where: { githubId: githubId },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const userIdInt = dbUser.id;

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

