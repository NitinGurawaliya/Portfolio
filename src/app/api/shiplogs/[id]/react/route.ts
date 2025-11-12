import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { resolveCurrentUserId } from "@/app/api/feed/utils"
import { SHIPLOG_REACTION_TYPES, createEmptyReactionCounts } from "@/app/api/shiplogs/helpers"
import type { ShiplogReactionType } from "@prisma/client"

function parseShiplogId(rawId: string) {
  const parsed = Number(rawId)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}

function isValidReactionType(value: unknown): value is ShiplogReactionType {
  return typeof value === "string" && SHIPLOG_REACTION_TYPES.includes(value as ShiplogReactionType)
}

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const userId = await resolveCurrentUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const shiplogId = parseShiplogId(id)
    if (!shiplogId) {
      return NextResponse.json({ error: "Invalid shiplog" }, { status: 400 })
    }

    const payload = await req.json().catch(() => null)
    const typeValue = payload?.type
    if (!isValidReactionType(typeValue)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 })
    }

    const shiplog = await prisma.shiplog.findUnique({
      where: { id: shiplogId },
      select: { id: true },
    })

    if (!shiplog) {
      return NextResponse.json({ error: "Shiplog not found" }, { status: 404 })
    }

    const existing = await prisma.shiplogReaction.findUnique({
      where: {
        shiplogId_userId: {
          shiplogId,
          userId,
        },
      },
    })

    let viewerReaction: ShiplogReactionType | null = null

    if (existing && existing.type === typeValue) {
      await prisma.shiplogReaction.delete({
        where: { id: existing.id },
      })
      viewerReaction = null
    } else if (existing) {
      await prisma.shiplogReaction.update({
        where: { id: existing.id },
        data: { type: typeValue },
      })
      viewerReaction = typeValue
    } else {
      await prisma.shiplogReaction.create({
        data: {
          shiplogId,
          userId,
          type: typeValue,
        },
      })
      viewerReaction = typeValue
    }

    const aggregated = await prisma.shiplogReaction.groupBy({
      by: ["type"],
      where: { shiplogId },
      _count: { _all: true },
    })

    const counts = createEmptyReactionCounts()
    aggregated.forEach((row) => {
      counts[row.type] = row._count._all
    })

    return NextResponse.json({
      shiplogId,
      viewerReaction,
      reactions: {
        shipped: counts.SHIPPED,
        fixed: counts.FIXED,
        support: counts.SUPPORT,
      },
    })
  } catch (error) {
    console.error("❌ Shiplogs: Failed to update reaction", error)
    return NextResponse.json({ error: "Failed to update reaction" }, { status: 500 })
  }
}
