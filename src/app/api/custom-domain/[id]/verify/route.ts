/**
 * Custom Domain Verification API
 * POST - Verify domain DNS configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyDomainComplete } from '@/lib/domain-verification';
import { cacheDomain, invalidateDomainCache } from '@/lib/domain-cache';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/sendEmail';
import { domainVerifiedEmail } from '@/lib/templates/customDomainEmails';
import { addDomainToVercel } from '@/lib/vercel-api';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: domainId } = await params;
    
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

    // Find the custom domain
      const customDomain = await prisma.customDomain.findUnique({
        where: { id: domainId },
        include: {
          portfolio: {
            include: {
              user: {
                select: {
                  githubUsername: true,
                  email: true,
                  name: true,
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
    console.log(`\n🔍 [Custom Domain] Starting verification for domain: ${customDomain.domain}`);
    console.log(`🔍 [Custom Domain] Domain ID: ${domainId}`);
    console.log(`🔍 [Custom Domain] Verification Token: ${customDomain.verificationToken}\n`);
    
    const verificationResult = await verifyDomainComplete(
      customDomain.domain,
      customDomain.verificationToken
    );
    
    console.log(`\n📊 [Custom Domain] Verification result:`, verificationResult);

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

        // Automatically add domain to Vercel via API (scalable solution)
        console.log(`[Custom Domain] Adding domain to Vercel: ${customDomain.domain}`);
        const vercelResult = await addDomainToVercel(customDomain.domain);
        
        if (vercelResult.success) {
          console.log(`[Custom Domain] Successfully added domain to Vercel: ${customDomain.domain}`);
        } else {
          // Log error but don't fail verification - domain is still verified
          // Vercel might have rate limits or the domain might already exist
          console.warn(`[Custom Domain] Failed to add domain to Vercel: ${vercelResult.error}`);
          console.warn(`[Custom Domain] Domain is verified but may need manual addition to Vercel if not already present`);
        }

        const domainOwner = customDomain.portfolio.user;
        if (domainOwner?.email) {
          try {
            const emailHtml = domainVerifiedEmail({
              userName:
                domainOwner.name ||
                domainOwner.githubUsername ||
                domainOwner.email,
              domain: customDomain.domain,
              portfolioUrl: `https://${process.env.NEXT_PUBLIC_APP_DOMAIN || 'devfolio.cc'}/dashboard`,
            });

            await sendEmail({
              to: domainOwner.email,
              subject: `🎉 ${customDomain.domain} is now live`,
              html: emailHtml,
            });
          } catch (emailError) {
            console.error('[Custom Domain] Failed to send verification email:', emailError);
          }
        }
    } else {
      // Invalidate cache if not verified
      await invalidateDomainCache(customDomain.domain);
    }

    // Provide helpful error message if A record doesn't match
    let errorMessage = '';
    if (!verified) {
      if (!verificationResult.ownershipVerified) {
        errorMessage = 'TXT verification record not found. Please add the TXT record and wait for DNS propagation.';
      } else if (!verificationResult.aRecordPointing) {
        const expectedIP = process.env.APP_IP_ADDRESS || '192.64.119.187';
        errorMessage = `A record does not point to a valid Vercel IP. Please update your A record to point to ${expectedIP}. Note: Both old (76.76.21.21) and new (192.64.119.187) Vercel IPs are accepted, but Vercel recommends using the new IP.`;
      } else {
        errorMessage = 'DNS records not found or incomplete. Please check your DNS configuration and wait for propagation (may take up to 24 hours).';
      }
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
        : errorMessage || 'DNS records not found or incomplete. Please check your DNS configuration and wait for propagation (may take up to 24 hours).',
      domain: updatedDomain,
      // Include IP mismatch info for debugging
      ...(verificationResult.ownershipVerified && !verificationResult.aRecordPointing ? {
        ipMismatch: true,
        recommendedIP: process.env.APP_IP_ADDRESS || '192.64.119.187',
        note: 'Your domain may work, but Vercel validation might show "Invalid Configuration". Update A record to recommended IP for best results.',
      } : {}),
    });
  } catch (error) {
    console.error('Error verifying custom domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

