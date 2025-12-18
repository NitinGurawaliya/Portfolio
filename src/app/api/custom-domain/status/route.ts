/**
 * Custom Domain Status API
 * GET - Get domain status for a portfolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDNSRecords } from '@/lib/dns-config';
import { validateSession } from '@/lib/session-validator';

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

