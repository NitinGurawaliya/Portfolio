/**
 * Custom Domain Status API
 * GET - Get domain status for a portfolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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
    const customDomain = await prisma.customDomain.findUnique({
      where: {
        portfolioId: parseInt(portfolioId),
      },
    });

    if (!customDomain) {
      return NextResponse.json({
        success: true,
        hasDomain: false,
        domain: null,
        verified: false,
      });
    }

    return NextResponse.json({
      success: true,
      hasDomain: true,
      domain: customDomain.domain,
      verified: customDomain.verified,
      id: customDomain.id,
      createdAt: customDomain.createdAt,
      lastCheckedAt: customDomain.lastCheckedAt,
    });
  } catch (error) {
    console.error('Error fetching domain status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

