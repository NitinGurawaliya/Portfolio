/**
 * Custom Domain Status API
 * GET - Get domain status for a portfolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { generateDNSRecords } from '@/lib/dns-config';

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

    // Get portfolioId from query params
    const { searchParams } = new URL(req.url);
    const portfolioId = searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    // Verify portfolio belongs to user
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: parseInt(portfolioId),
        userId: userIdInt,
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found or access denied' },
        { status: 404 }
      );
    }

    // Get custom domain for this portfolio
    const portfolioIdInt = parseInt(portfolioId);

    let customDomain;
    try {
      customDomain = await prisma.customDomain.findUnique({
        where: {
          portfolioId: portfolioIdInt,
        },
      });
    } catch (error: any) {
      // Handle case where Prisma client hasn't been regenerated
      if (error?.message?.includes('customDomain') || error?.message?.includes('Cannot read properties of undefined')) {
        console.error('CustomDomain model not found in Prisma client. Please stop the dev server and run: npx prisma generate');
        return NextResponse.json({
          success: true,
          hasDomain: false,
          domain: null,
          verified: false,
          dnsRecords: null,
        });
      }
      throw error;
    }

      if (!customDomain) {
        return NextResponse.json({
          success: true,
          hasDomain: false,
          domain: null,
          verified: false,
          dnsRecords: null,
        });
      }

      // Use stored Vercel IP if available, otherwise fallback
      const dnsRecords = await generateDNSRecords(
        customDomain.domain,
        customDomain.verificationToken,
        customDomain.vercelIPAddress || null
      );

      return NextResponse.json({
        success: true,
        hasDomain: true,
        domain: customDomain.domain,
        verified: customDomain.verified,
        id: customDomain.id,
        createdAt: customDomain.createdAt,
        lastCheckedAt: customDomain.lastCheckedAt,
        dnsRecords,
      });
  } catch (error) {
    console.error('Error fetching domain status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

