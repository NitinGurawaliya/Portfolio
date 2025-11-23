/**
 * Custom Domain Lookup API (for Middleware)
 * GET - Look up username by domain
 * 
 * This route is called by middleware to avoid Edge Runtime Prisma issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedDomain, cacheDomain } from '@/lib/domain-cache';
import { normalizeDomain } from '@/lib/domain-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
      const domain = searchParams.get('domain');

    console.log(`[Custom Domain Lookup] Request for domain: ${domain}`);

    if (!domain) {
      console.error('[Custom Domain Lookup] No domain parameter provided');
      return NextResponse.json(
        { error: 'Domain parameter required' },
        { status: 400 }
      );
    }

      const normalizedDomain = normalizeDomain(domain);
      console.log(`[Custom Domain Lookup] Normalized domain: ${normalizedDomain}`);

      // Check cache first
      const cached = await getCachedDomain(normalizedDomain);
    if (cached && cached.verified) {
      console.log(`[Custom Domain Lookup] Found in cache: ${cached.username}`);
      return NextResponse.json({
        success: true,
        username: cached.username,
        portfolioId: cached.portfolioId,
      });
    }

    console.log(`[Custom Domain Lookup] Querying database for: ${normalizedDomain}`);
    
    // Query database
      const customDomain = await prisma.customDomain.findFirst({
        where: {
          domain: normalizedDomain,
          verified: true,
        },
      include: {
        portfolio: {
          select: {
            id: true,
            customUsername: true,
            isPublished: true,
            user: {
              select: {
                githubUsername: true,
              },
            },
          },
        },
      },
    });

    console.log(`[Custom Domain Lookup] Database query result:`, {
      found: !!customDomain,
      verified: customDomain?.verified,
      portfolioId: customDomain?.portfolioId,
      portfolioPublished: customDomain?.portfolio?.isPublished,
      customUsername: customDomain?.portfolio?.customUsername,
      githubUsername: customDomain?.portfolio?.user?.githubUsername,
    });

    if (!customDomain || !customDomain.verified) {
      console.log(`[Custom Domain Lookup] Domain not found or not verified: ${normalizedDomain}`);
      return NextResponse.json(
        { success: false, username: null },
        { status: 404 }
      );
    }

    // Check if portfolio is published
    if (!customDomain.portfolio.isPublished) {
      console.log(`[Custom Domain Lookup] Portfolio not published for domain: ${normalizedDomain}`);
      return NextResponse.json(
        { success: false, username: null, error: 'Portfolio is not published' },
        { status: 404 }
      );
    }

    // Use customUsername if available, otherwise use githubUsername
    const username = customDomain.portfolio.customUsername || customDomain.portfolio.user.githubUsername;
    
    if (!username) {
      console.error(`[Custom Domain Lookup] No username found for domain: ${normalizedDomain}`);
      return NextResponse.json(
        { success: false, username: null, error: 'No username associated with portfolio' },
        { status: 404 }
      );
    }

    console.log(`[Custom Domain Lookup] Found username: ${username} for domain: ${normalizedDomain}`);

    // Cache the result
      await cacheDomain(normalizedDomain, {
      portfolioId: customDomain.portfolioId,
      username: username,
      verified: true,
    });

    return NextResponse.json({
      success: true,
        username: username,
      portfolioId: customDomain.portfolioId,
    });
  } catch (error) {
    console.error('Error looking up custom domain:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false, username: null },
      { status: 500 }
    );
  }
}

