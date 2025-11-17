import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveCurrentUserId } from "@/app/api/feed/utils"

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

    const existing = await prisma.portfolioRepository.findUnique({
      where: { id: portfolioRepositoryId },
      select: {
        id: true,
        deletedAt: true,
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

    if (existing.deletedAt) {
      return NextResponse.json({ success: true, projectId: existing.id })
    }

    await prisma.portfolioRepository.update({
      where: { id: portfolioRepositoryId },
      data: {
        deletedAt: new Date(),
        isVisible: false,
      },
    })

    return NextResponse.json({ success: true, projectId: portfolioRepositoryId })
  } catch (error) {
    console.error("❌ Failed to delete portfolio project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
