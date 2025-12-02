import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveCurrentUserId } from "@/app/api/feed/utils"
import { invalidateCache, CacheKeys } from "@/lib/cache"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const portfolioRepositoryId = Number(id)

    if (!portfolioRepositoryId || Number.isNaN(portfolioRepositoryId)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    const currentUserId = await resolveCurrentUserId(req)
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the portfolio repository with portfolio info
    const existing = await prisma.portfolioRepository.findUnique({
      where: { id: portfolioRepositoryId },
      select: {
        id: true,
        portfolioId: true,
        portfolio: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (existing.portfolio.userId !== currentUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // HARD DELETE: Delete all related analytics data first, then the project itself
    // This ensures complete removal with no orphaned data
    
    const projectIdBigInt = BigInt(portfolioRepositoryId)
    
    // Delete all analytics data related to this project
    await Promise.all([
      // Delete ProjectClick entries
      prisma.projectClick.deleteMany({
        where: {
          portfolioId: existing.portfolioId,
          projectId: projectIdBigInt,
        },
      }),
      
      // Delete DailyProjectViews entries
      prisma.dailyProjectViews.deleteMany({
        where: {
          portfolioId: existing.portfolioId,
          projectId: projectIdBigInt,
        },
      }),
      
      // Delete ProjectView entries
      prisma.projectView.deleteMany({
        where: {
          portfolioId: existing.portfolioId,
          projectId: projectIdBigInt,
        },
      }),
    ])

    // Delete the PortfolioRepository itself
    // This will automatically:
    // - Delete ProjectUpvote entries (onDelete: Cascade)
    // - Set Shiplog.portfolioRepositoryId to null (onDelete: SetNull)
    await prisma.portfolioRepository.delete({
      where: { id: portfolioRepositoryId },
    })

    // Invalidate cache to ensure fresh data on next request
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { githubUsername: true }
    })
    
    if (user?.githubUsername) {
      invalidateCache(CacheKeys.portfolio(`sections_${currentUserId}`))
      invalidateCache(CacheKeys.portfolio(`basic_${currentUserId}`))
      invalidateCache(CacheKeys.portfolio(user.githubUsername))
      invalidateCache(CacheKeys.portfolio(`public_${user.githubUsername}`))
    }

    return NextResponse.json({ 
      success: true, 
      projectId: portfolioRepositoryId,
      message: "Project and all related data deleted completely"
    })
  } catch (error) {
    console.error("❌ Failed to delete portfolio project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
