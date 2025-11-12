import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { resolveCurrentUserId } from "@/app/api/feed/utils"
import {
  buildReactionCountMap,
  formatShiplog,
  parsePagination,
} from "@/app/api/shiplogs/helpers"
import type { Prisma, ShiplogReactionType } from "@prisma/client"

type FeedMode = "network" | "global"

async function fetchShiplogsBatch(
  where: Prisma.ShiplogWhereInput | undefined,
  skip: number,
  take: number
) {
  const [items, count] = await prisma.$transaction([
    prisma.shiplog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            githubUsername: true,
            avatarUrl: true,
            portfolio: {
              select: {
                customUsername: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            customName: true,
            repositoryId: true,
            deployedUrl: true,
            repository: {
              select: {
                name: true,
                githubUrl: true,
                htmlUrl: true,
              },
            },
          },
        },
      },
    }),
    prisma.shiplog.count({ where }),
  ])

  return { items, count }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const { page, pageSize } = parsePagination(searchParams)
    const skip = (page - 1) * pageSize

    const followees = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })

    const followedAuthorIds = new Set<number>([userId])
    followees.forEach((row) => followedAuthorIds.add(row.followingId))

    const hasNetwork = followedAuthorIds.size > 1
    const networkWhere: Prisma.ShiplogWhereInput | undefined = hasNetwork
      ? { userId: { in: Array.from(followedAuthorIds) } }
      : undefined

    let mode: FeedMode = hasNetwork ? "network" : "global"
    let { items: shiplogs, count: total } = await fetchShiplogsBatch(networkWhere, skip, pageSize)

    if (shiplogs.length === 0 && hasNetwork) {
      const fallback = await fetchShiplogsBatch(undefined, skip, pageSize)
      shiplogs = fallback.items
      total = fallback.count
      mode = "global"
    }

    if (shiplogs.length === 0) {
      return NextResponse.json({
        page,
        pageSize,
        total,
        hasMore: false,
        shiplogs: [],
        mode,
      })
    }

    const shiplogIds = shiplogs.map((shiplog) => shiplog.id)

    const [reactionRows, viewerReactions] = await Promise.all([
      prisma.shiplogReaction.groupBy({
        by: ["shiplogId", "type"],
        where: { shiplogId: { in: shiplogIds } },
        _count: { _all: true },
      }),
      prisma.shiplogReaction.findMany({
        where: {
          shiplogId: { in: shiplogIds },
          userId,
        },
        select: {
          shiplogId: true,
          type: true,
        },
      }),
    ])

    const reactionCounts = buildReactionCountMap(reactionRows)
    const viewerReactionMap = new Map<number, ShiplogReactionType>()
    viewerReactions.forEach((reaction) => {
      viewerReactionMap.set(reaction.shiplogId, reaction.type)
    })

    return NextResponse.json({
      page,
      pageSize,
      total,
      hasMore: page * pageSize < total,
      mode,
      shiplogs: shiplogs.map((shiplog) =>
        formatShiplog(shiplog, reactionCounts, viewerReactionMap, followedAuthorIds, userId)
      ),
    })
  } catch (error) {
    console.error("❌ Shiplogs Feed: Failed to load feed", error)
    return NextResponse.json({ error: "Failed to load shiplog feed" }, { status: 500 })
  }
}
