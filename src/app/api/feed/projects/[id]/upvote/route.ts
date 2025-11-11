import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { resolveCurrentUserId } from "@/app/api/feed/utils"
import { getNotificationHub } from "@/lib/server/notificationHub"

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
      let newUpvoteRecord: { id: number; createdAt: Date } | null = null

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
        newUpvoteRecord = await prisma.projectUpvote.create({
          data: {
            userId,
            portfolioRepositoryId: projectId,
          },
          select: {
            id: true,
            createdAt: true,
          },
        })
        upvoted = true
      }

      const totalUpvotes = await prisma.projectUpvote.count({
        where: { portfolioRepositoryId: projectId },
      })

      if (upvoted) {
        try {
          const [projectOwner, actor] = await Promise.all([
            prisma.portfolioRepository.findUnique({
              where: { id: projectId },
              select: {
                id: true,
                customName: true,
                repository: {
                  select: { name: true },
                },
                portfolio: {
                  select: { userId: true },
                },
              },
            }),
            prisma.user.findUnique({
              where: { id: userId },
              select: {
                id: true,
                name: true,
                githubUsername: true,
                avatarUrl: true,
              },
            }),
          ])

          const recipientId = projectOwner?.portfolio.userId
          if (recipientId && recipientId !== userId) {
            const projectName =
              projectOwner?.customName ||
              projectOwner?.repository?.name ||
              "Your project"

            const hub = getNotificationHub()
            hub.send(recipientId, {
              type: "project-upvote",
              data: {
                notificationId: newUpvoteRecord ? newUpvoteRecord.id.toString() : randomUUID(),
                projectId,
                projectName,
                totalUpvotes,
                actor: actor || undefined,
                createdAt: (newUpvoteRecord?.createdAt ?? new Date()).toISOString(),
              },
            })
          }
        } catch (notificationError) {
          console.error("🔔 Failed to broadcast upvote notification:", notificationError)
        }
      }

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
