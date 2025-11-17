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

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter required' },
        { status: 400 }
      );
    }

      const normalizedDomain = normalizeDomain(domain);

      // Check cache first
      const cached = await getCachedDomain(normalizedDomain);
    if (cached && cached.verified) {
      return NextResponse.json({
        success: true,
        username: cached.username,
        portfolioId: cached.portfolioId,
      });
    }

    // Query database
      const customDomain = await prisma.customDomain.findFirst({
        where: {
          domain: normalizedDomain,
          verified: true,
        },
      include: {
        portfolio: {
          include: {
            user: {
              select: {
                githubUsername: true,
              },
            },
          },
        },
      },
    });

    if (!customDomain || !customDomain.verified) {
      return NextResponse.json(
        { success: false, username: null },
        { status: 404 }
      );
    }

    // Cache the result
      await cacheDomain(normalizedDomain, {
      portfolioId: customDomain.portfolioId,
      username: customDomain.portfolio.user.githubUsername || '',
      verified: true,
    });

    return NextResponse.json({
      success: true,
        username: customDomain.portfolio.user.githubUsername,
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

