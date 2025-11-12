import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { resolveCurrentUserId } from "@/app/api/feed/utils"

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveCurrentUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projects = await prisma.portfolioRepository.findMany({
      where: {
        portfolio: { userId },
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        customName: true,
        repository: {
          select: {
            name: true,
          },
        },
      },
    })

    const normalized = projects.map((project) => ({
      id: project.id,
      name: project.customName ?? project.repository?.name ?? "Untitled project",
    }))

    return NextResponse.json({
      projects: normalized,
    })
  } catch (error) {
    console.error("❌ Shiplogs: Failed to load projects", error)
    return NextResponse.json({ error: "Failed to load linked projects" }, { status: 500 })
  }
}
