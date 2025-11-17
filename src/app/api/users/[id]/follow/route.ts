import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { resolveCurrentUserId } from "@/app/api/feed/utils"

type RouteContext = { params: Promise<{ id: string }> }

function parseTargetUserId(rawId: string) {
  const parsed = Number(rawId)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const currentUserId = await resolveCurrentUserId(req)
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const targetUserId = parseTargetUserId(id)
    if (!targetUserId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await prisma.userFollow.upsert({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
      update: {},
      create: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    })

    return NextResponse.json({ following: true })
  } catch (error) {
    console.error("❌ Follow: Failed to follow user", error)
    return NextResponse.json({ error: "Unable to follow user" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const currentUserId = await resolveCurrentUserId(req)
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const targetUserId = parseTargetUserId(id)
    if (!targetUserId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: "You cannot unfollow yourself" }, { status: 400 })
    }

    await prisma.userFollow.deleteMany({
      where: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    })

    return NextResponse.json({ following: false })
  } catch (error) {
    console.error("❌ Follow: Failed to unfollow user", error)
    return NextResponse.json({ error: "Unable to unfollow user" }, { status: 500 })
  }
}
