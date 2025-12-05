import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveCurrentUserId } from "@/app/api/feed/utils"

/**
 * Cleanup endpoint to permanently delete all soft-deleted projects
 * This removes projects that have deletedAt set or isVisible = false
 * and all their related analytics data
 */
export async function POST(req: NextRequest) {
  try {
    const currentUserId = await resolveCurrentUserId(req)
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find all soft-deleted projects for this user
    const softDeletedProjects = await prisma.portfolioRepository.findMany({
      where: {
        portfolio: {
          userId: currentUserId
        },
        OR: [
          { deletedAt: { not: null } },
          { isVisible: false }
        ]
      },
      select: {
        id: true,
        portfolioId: true
      }
    })

    if (softDeletedProjects.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No soft-deleted projects found",
        deletedCount: 0
      })
    }

    let deletedCount = 0
    let analyticsDeletedCount = 0

    // Delete each soft-deleted project and its analytics
    for (const project of softDeletedProjects) {
      const projectIdBigInt = BigInt(project.id)
      
      // Delete all analytics data
      const analyticsResults = await Promise.all([
        prisma.projectClick.deleteMany({
          where: {
            portfolioId: project.portfolioId,
            projectId: projectIdBigInt,
          },
        }),
        prisma.dailyProjectViews.deleteMany({
          where: {
            portfolioId: project.portfolioId,
            projectId: projectIdBigInt,
          },
        }),
        prisma.projectView.deleteMany({
          where: {
            portfolioId: project.portfolioId,
            projectId: projectIdBigInt,
          },
        }),
      ])

      analyticsDeletedCount += analyticsResults.reduce((sum, result) => sum + result.count, 0)

      // Delete the PortfolioRepository itself
      await prisma.portfolioRepository.delete({
        where: { id: project.id },
      })

      deletedCount++
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully deleted ${deletedCount} projects and ${analyticsDeletedCount} analytics records`,
      deletedCount,
      analyticsDeletedCount
    })
  } catch (error) {
    console.error("❌ Failed to cleanup deleted projects:", error)
    return NextResponse.json({ error: "Failed to cleanup deleted projects" }, { status: 500 })
  }
}

