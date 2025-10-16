/**
 * Cron Job: Auto-Verify Domains
 * Runs periodically to check unverified domains
 * 
 * Configure in vercel.json or your hosting platform:
 * "crons": [
 *   {
 *     "path": "/api/cron/verify-domains",
 *     "schedule": "0 * * * *" // Every hour
 *   }
 * ]
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyDomainComplete } from '@/lib/domain-verification';
import { cacheDomain, invalidateDomainCache } from '@/lib/domain-cache';
import { sendEmail } from '@/lib/sendEmail';
import { domainVerifiedEmail, domainVerificationFailedEmail } from '@/lib/templates/customDomainEmails';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find all unverified domains
    const unverifiedDomains = await prisma.customDomain.findMany({
      where: {
        verified: false,
      },
      include: {
        portfolio: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                githubUsername: true,
              },
            },
          },
        },
      },
    });

    console.log(`[Cron] Found ${unverifiedDomains.length} unverified domains`);

    const results = {
      total: unverifiedDomains.length,
      verified: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Check each domain
    for (const domain of unverifiedDomains) {
      try {
        console.log(`[Cron] Checking domain: ${domain.domain}`);

        // Perform verification
        const verificationResult = await verifyDomainComplete(
          domain.domain,
          domain.verificationToken
        );

        // Update last checked time
        await prisma.customDomain.update({
          where: { id: domain.id },
          data: {
            lastCheckedAt: new Date(),
          },
        });

        // If verification passed
        if (verificationResult.allChecks) {
          // Update domain as verified
          await prisma.customDomain.update({
            where: { id: domain.id },
            data: {
              verified: true,
            },
          });

          // Cache the domain
          await cacheDomain(domain.domain, {
            portfolioId: domain.portfolioId,
            username: domain.portfolio.user.githubUsername || '',
            verified: true,
          });

          // Send success email
          try {
            const emailHtml = domainVerifiedEmail({
              userName: domain.portfolio.user.name,
              domain: domain.domain,
              portfolioUrl: `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}/dashboard`,
            });

            await sendEmail({
              to: domain.portfolio.user.email,
              subject: `🎉 Your custom domain ${domain.domain} is now live!`,
              html: emailHtml,
            });
          } catch (emailError) {
            console.error('[Cron] Error sending verification email:', emailError);
          }

          results.verified++;
          console.log(`[Cron] ✅ Domain verified: ${domain.domain}`);
        } else {
          // Check if domain has been pending for too long (7 days)
          const daysSinceCreation = Math.floor(
            (Date.now() - new Date(domain.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceCreation >= 7) {
            // Send failure notification
            try {
              const emailHtml = domainVerificationFailedEmail({
                userName: domain.portfolio.user.name,
                domain: domain.domain,
              });

              await sendEmail({
                to: domain.portfolio.user.email,
                subject: `Domain verification needs attention: ${domain.domain}`,
                html: emailHtml,
              });
            } catch (emailError) {
              console.error('[Cron] Error sending failure email:', emailError);
            }

            results.failed++;
            console.log(`[Cron] ⚠️ Domain verification failed (7+ days): ${domain.domain}`);
          } else {
            console.log(
              `[Cron] ⏳ Domain still pending (${daysSinceCreation} days): ${domain.domain}`
            );
          }
        }
      } catch (error) {
        console.error(`[Cron] Error processing domain ${domain.domain}:`, error);
        results.errors.push(`${domain.domain}: ${error}`);
      }
    }

    console.log('[Cron] Verification complete:', results);

    return NextResponse.json({
      success: true,
      message: 'Domain verification cron completed',
      results,
    });
  } catch (error) {
    console.error('[Cron] Fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// Also support POST for manual trigger
export async function POST(req: NextRequest) {
  return GET(req);
}

