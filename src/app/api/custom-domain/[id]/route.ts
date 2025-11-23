/**
 * Custom Domain API - Individual Domain
 * DELETE - Remove a custom domain
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invalidateDomainCache } from '@/lib/domain-cache';
import { cookies } from 'next/headers';
import { removeDomainFromVercel } from '@/lib/vercel-api';

export async function DELETE(
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

