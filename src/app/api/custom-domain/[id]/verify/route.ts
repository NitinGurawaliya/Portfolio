/**
 * Custom Domain Verification API
 * POST - Verify domain DNS configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyDomainComplete } from '@/lib/domain-verification';
import { cacheDomain, invalidateDomainCache } from '@/lib/domain-cache';
import { cookies } from 'next/headers';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const domainId = params.id;

    // Find the custom domain
    const customDomain = await prisma.customDomain.findUnique({
      where: { id: domainId },
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

    if (!customDomain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    // Check if user owns this domain
    if (customDomain.userId !== userIdInt) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Perform DNS verification
    const verificationResult = await verifyDomainComplete(
      customDomain.domain,
      customDomain.verificationToken
    );

    // Update domain verification status
    const verified = verificationResult.allChecks;
    
    const updatedDomain = await prisma.customDomain.update({
      where: { id: domainId },
      data: {
        verified: verified,
        lastCheckedAt: new Date(),
      },
    });

    // Update cache if verified
    if (verified) {
      await cacheDomain(customDomain.domain, {
        portfolioId: customDomain.portfolioId,
        username: customDomain.portfolio.user.githubUsername || '',
        verified: true,
      });
    } else {
      // Invalidate cache if not verified
      await invalidateDomainCache(customDomain.domain);
    }

    return NextResponse.json({
      success: true,
      verified: verified,
      checks: {
        ownershipVerified: verificationResult.ownershipVerified,
        aRecordPointing: verificationResult.aRecordPointing,
        cnamePointing: verificationResult.cnamePointing,
      },
      message: verified
        ? 'Domain verified successfully! Your portfolio is now live.'
        : 'DNS records not found or incomplete. Please check your DNS configuration and wait for propagation (may take up to 24 hours).',
      domain: updatedDomain,
    });
  } catch (error) {
    console.error('Error verifying custom domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

