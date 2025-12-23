/**
 * Custom Domain API - Individual Domain
 * DELETE - Remove a custom domain
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invalidateDomainCache } from '@/lib/domain-cache';
import { removeDomainFromVercel } from '@/lib/vercel-api';
import { validateSession } from '@/lib/session-validator';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: domainId } = await params;
    
    const sessionValidation = await validateSession(req);
    if (!sessionValidation.valid || !sessionValidation.user) {
      return NextResponse.json(
        { error: sessionValidation.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const userIdInt = sessionValidation.user.id;

    // Find the custom domain
    const customDomain = await prisma.customDomain.findUnique({
      where: { id: domainId },
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

    // Delete the domain from database
    await prisma.customDomain.delete({
      where: { id: domainId },
    });

    // Invalidate cache
    await invalidateDomainCache(customDomain.domain);

    // Automatically remove domain from Vercel via API
    console.log(`[Custom Domain] Removing domain from Vercel: ${customDomain.domain}`);
    const vercelResult = await removeDomainFromVercel(customDomain.domain);
    
    if (vercelResult.success) {
      console.log(`[Custom Domain] Successfully removed domain from Vercel: ${customDomain.domain}`);
    } else {
      // Log warning but don't fail - domain is removed from our system
      console.warn(`[Custom Domain] Failed to remove domain from Vercel: ${vercelResult.error}`);
      console.warn(`[Custom Domain] Domain removed from our system but may still exist in Vercel`);
    }

    return NextResponse.json({
      success: true,
      message: 'Domain removed successfully',
    });
  } catch (error) {
    console.error('Error deleting custom domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

