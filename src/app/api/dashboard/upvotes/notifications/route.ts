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

    const searchParams = req.nextUrl?.searchParams ?? new URL(req.url).searchParams
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 25
    const take = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 25

    const upvotes = await prisma.projectUpvote.findMany({
      where: {
        portfolioRepository: {
          deletedAt: null,
          portfolio: {
            userId,
          },
          isVisible: true,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            githubUsername: true,
            avatarUrl: true,
          },
        },
        portfolioRepository: {
          select: {
            id: true,
            customName: true,
            repository: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (upvotes.length === 0) {
      return NextResponse.json({ notifications: [] })
    }

    const projectIds = Array.from(new Set(upvotes.map((upvote) => upvote.portfolioRepositoryId)))

    const totalUpvotes = await prisma.projectUpvote.groupBy({
      by: ["portfolioRepositoryId"],
      where: {
        portfolioRepositoryId: {
          in: projectIds,
        },
      },
      _count: {
        _all: true,
      },
    })

    const totalMap = new Map<number, number>()
    for (const entry of totalUpvotes) {
      totalMap.set(entry.portfolioRepositoryId, entry._count._all)
    }

    const notifications = upvotes.map((upvote) => {
      const projectName =
        upvote.portfolioRepository.customName ||
        upvote.portfolioRepository.repository?.name ||
        "Project"

      return {
        id: upvote.id.toString(),
        projectId: upvote.portfolioRepositoryId,
        projectName,
        totalUpvotes: totalMap.get(upvote.portfolioRepositoryId) ?? 0,
        createdAt: upvote.createdAt.toISOString(),
        actor: upvote.user
          ? {
              id: upvote.user.id,
              name: upvote.user.name,
              githubUsername: upvote.user.githubUsername,
              avatarUrl: upvote.user.avatarUrl,
            }
          : null,
      }
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("🔔 Failed to load upvote notifications list:", error)
    return NextResponse.json(
      { error: "Failed to load upvote notifications" },
      { status: 500 }
    )
  }
}
