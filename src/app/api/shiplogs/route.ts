import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { resolveCurrentUserId } from "@/app/api/feed/utils"
import { invalidateCache, CacheKeys } from "@/lib/cache"
import {
  buildReactionCountMap,
  createEmptyReactionCounts,
  formatShiplog,
  parsePagination,
} from "@/app/api/shiplogs/helpers"
import type { ShiplogReactionType } from "@prisma/client"

const MAX_CONTENT_LENGTH = 1200
const MAX_IMAGE_LENGTH = 1_500_000 // Roughly ~1.5MB when base64 encoded

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const { page, pageSize } = parsePagination(searchParams)

    const [shiplogs, total] = await prisma.$transaction([
      prisma.shiplog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              githubUsername: true,
              avatarUrl: true,
            },
          },
          project: {
            select: {
              id: true,
              customName: true,
              repositoryId: true,
              repository: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.shiplog.count({
        where: { userId },
      }),
    ])

    if (shiplogs.length === 0) {
      return NextResponse.json({
        page,
        pageSize,
        total,
        shiplogs: [],
        hasMore: false,
      })
    }

    const shiplogIds = shiplogs.map((shiplog) => shiplog.id)

    const [reactionRows, viewerReactions] = await Promise.all([
      prisma.shiplogReaction.groupBy({
        by: ["shiplogId", "type"],
        where: {
          shiplogId: { in: shiplogIds },
        },
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

    const followedAuthorIds = new Set<number>([userId])
    shiplogs.forEach((shiplog) => {
      if (shiplog.author?.id === userId) {
        followedAuthorIds.add(shiplog.author.id)
      }
    })

    return NextResponse.json({
      page,
      pageSize,
      total,
      hasMore: page * pageSize < total,
      shiplogs: shiplogs.map((shiplog) =>
        formatShiplog(shiplog, reactionCounts, viewerReactionMap, followedAuthorIds, userId)
      ),
    })
  } catch (error) {
    console.error("❌ Shiplogs: Failed to load timeline", error)
    return NextResponse.json({ error: "Failed to load shiplog timeline" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const rawContent = typeof body.content === "string" ? body.content.trim() : ""
    if (!rawContent) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }
    if (rawContent.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: `Content must be under ${MAX_CONTENT_LENGTH} characters` }, { status: 400 })
    }

    let imageUrl: string | null = null
    if (typeof body.imageUrl === "string") {
      const trimmed = body.imageUrl.trim()
      if (trimmed.length > MAX_IMAGE_LENGTH) {
        return NextResponse.json({ error: "Image is too large. Please upload a smaller image." }, { status: 400 })
      }
      imageUrl = trimmed || null
    }

    let projectId: number | null = null
    if (body.portfolioRepositoryId !== undefined && body.portfolioRepositoryId !== null) {
      const parsedId = Number(body.portfolioRepositoryId)
      if (!Number.isFinite(parsedId) || parsedId <= 0) {
        return NextResponse.json({ error: "Invalid project selection" }, { status: 400 })
      }

      const project = await prisma.portfolioRepository.findFirst({
        where: {
          id: parsedId,
          portfolio: {
            userId,
          },
          deletedAt: null,
        },
        select: { id: true },
      })

      if (!project) {
        return NextResponse.json({ error: "Project not found or not accessible" }, { status: 404 })
      }

      projectId = project.id
    }

    const createdShiplog = await prisma.shiplog.create({
      data: {
        userId,
        content: rawContent,
        imageUrl,
        portfolioRepositoryId: projectId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            githubUsername: true,
            avatarUrl: true,
          },
        },
        project: {
          select: {
            id: true,
            customName: true,
            repositoryId: true,
            repository: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    // Invalidate cached public portfolio pages so shiplog shows up
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { userId },
        select: {
          customUsername: true,
          user: {
            select: {
              githubUsername: true,
            },
          },
        },
      })

      const possibleUsernames = new Set<string>()
      if (portfolio?.user?.githubUsername) {
        possibleUsernames.add(portfolio.user.githubUsername)
      }
      if (portfolio?.customUsername) {
        possibleUsernames.add(portfolio.customUsername)
      }

      possibleUsernames.forEach((username) => {
        invalidateCache(CacheKeys.portfolio(`public_${username}`))
        invalidateCache(CacheKeys.portfolio(username))
      })
    } catch (cacheError) {
      console.warn("⚠️ Shiplogs: Failed to invalidate cache after creation", cacheError)
    }

    const reactionCounts = new Map<number, Record<ShiplogReactionType, number>>([
      [createdShiplog.id, createEmptyReactionCounts()],
    ])
    const viewerReactionMap = new Map<number, ShiplogReactionType>()
    const followedAuthorIds = new Set<number>([userId])

    return NextResponse.json({
      shiplog: formatShiplog(createdShiplog, reactionCounts, viewerReactionMap, followedAuthorIds, userId),
    })
  } catch (error) {
    console.error("❌ Shiplogs: Failed to create entry", error)
    return NextResponse.json({ error: "Failed to create shiplog entry" }, { status: 500 })
  }
}
