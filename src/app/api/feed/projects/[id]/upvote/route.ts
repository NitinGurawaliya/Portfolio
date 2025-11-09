import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveCurrentUserId } from "@/app/api/feed/utils"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const projectId = Number(id)
    if (!projectId || Number.isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project id" },
        { status: 400 }
      )
    }

    const userId = await resolveCurrentUserId(req)
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const project = await prisma.portfolioRepository.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        isVisible: true,
        portfolio: {
          isPublished: true,
        },
      },
      select: { id: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const existingUpvote = await prisma.projectUpvote.findUnique({
      where: {
        userId_portfolioRepositoryId: {
          userId,
          portfolioRepositoryId: projectId,
        },
      },
    })

    let upvoted = false

    if (existingUpvote) {
      await prisma.projectUpvote.delete({
        where: {
          userId_portfolioRepositoryId: {
            userId,
            portfolioRepositoryId: projectId,
          },
        },
      })
    } else {
      await prisma.projectUpvote.create({
        data: {
          userId,
          portfolioRepositoryId: projectId,
        },
      })
      upvoted = true
    }

    const totalUpvotes = await prisma.projectUpvote.count({
      where: { portfolioRepositoryId: projectId },
    })

    return NextResponse.json({
      upvoted,
      totalUpvotes,
    })
  } catch (error) {
    console.error("❌ Feed: Failed to toggle upvote:", error)
    return NextResponse.json(
      { error: "Failed to update upvote" },
      { status: 500 }
    )
  }
}
