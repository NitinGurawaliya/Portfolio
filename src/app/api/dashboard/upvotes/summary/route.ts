import { NextRequest, NextResponse } from "next/server"
import { resolveCurrentUserId } from "@/app/api/feed/utils"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sinceParam = searchParams.get("since")

    let since = new Date(Date.now() - 1000 * 60 * 60 * 24)
    if (sinceParam) {
      const parsed = new Date(sinceParam)
      if (!Number.isNaN(parsed.getTime())) {
        since = parsed
      }
    }

    const recentUpvoteGroups = await prisma.projectUpvote.groupBy({
      by: ["portfolioRepositoryId"],
      where: {
        createdAt: { gte: since },
        portfolioRepository: {
          portfolio: {
            userId,
          },
          deletedAt: null,
          isVisible: true,
        },
      },
      _count: {
        _all: true,
      },
    })

    if (recentUpvoteGroups.length === 0) {
      return NextResponse.json({
        since: since.toISOString(),
        projects: [],
      })
    }

    const projectIds = recentUpvoteGroups.map((group) => group.portfolioRepositoryId)

    const [projectDetails, totalUpvoteGroups] = await Promise.all([
      prisma.portfolioRepository.findMany({
        where: { id: { in: projectIds } },
        select: {
          id: true,
          customName: true,
          repository: {
            select: { name: true },
          },
        },
      }),
      prisma.projectUpvote.groupBy({
        by: ["portfolioRepositoryId"],
        where: {
          portfolioRepositoryId: { in: projectIds },
        },
        _count: {
          _all: true,
        },
      }),
    ])

    const totalUpvoteMap = new Map<number, number>()
    for (const group of totalUpvoteGroups) {
      totalUpvoteMap.set(group.portfolioRepositoryId, group._count._all)
    }

    const detailMap = new Map(
      projectDetails.map((project) => [
        project.id,
        project.customName || project.repository?.name || "Project",
      ])
    )

    const projects = recentUpvoteGroups
      .map((group) => {
        const projectName = detailMap.get(group.portfolioRepositoryId) || "Project"
        return {
          projectId: group.portfolioRepositoryId,
          projectName,
          recentUpvotes: group._count._all,
          totalUpvotes: totalUpvoteMap.get(group.portfolioRepositoryId) ?? group._count._all,
        }
      })
      .sort((a, b) => b.recentUpvotes - a.recentUpvotes)

    return NextResponse.json({
      since: since.toISOString(),
      projects,
    })
  } catch (error) {
    console.error("🔔 Failed to load dashboard upvote summary:", error)
    return NextResponse.json(
      { error: "Failed to load upvote summary" },
      { status: 500 }
    )
  }
}
