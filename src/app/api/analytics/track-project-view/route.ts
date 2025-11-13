import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid or empty request payload" },
        { status: 400 }
      )
    }

    const payload =
      typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {}

    const rawPortfolioId = payload.portfolioId as string | number | undefined
    const rawProjectId = payload.projectId as string | number | undefined

    if (!rawPortfolioId || !rawProjectId) {
      return NextResponse.json(
        { error: "portfolioId and projectId are required" },
        { status: 400 }
      )
    }

    const numericPortfolioId = Number(rawPortfolioId)
    const numericProjectId = Number(rawProjectId)

    if (!Number.isFinite(numericPortfolioId) || !Number.isFinite(numericProjectId)) {
      return NextResponse.json(
        { error: "Invalid identifiers" },
        { status: 400 }
      )
    }

    const portfolioRepository = await prisma.portfolioRepository.findFirst({
      where: {
        id: numericProjectId,
        portfolioId: numericPortfolioId,
        deletedAt: null,
      },
      select: {
        id: true,
        customName: true,
        portfolioId: true,
        repository: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!portfolioRepository) {
      return NextResponse.json(
        { error: "Project is not available or not published" },
        { status: 404 }
      )
    }

    const projectName =
      portfolioRepository.customName ||
      portfolioRepository.repository?.name ||
      `Project ${portfolioRepository.id}`

    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"
    const referrer = request.headers.get("referer") || "direct"

    await prisma.projectView.create({
      data: {
        portfolioId: numericPortfolioId,
        projectId: BigInt(portfolioRepository.id),
        projectName,
        ipAddress,
        userAgent,
        referrer,
      },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.dailyProjectViews.upsert({
      where: {
        portfolioId_projectId_date: {
          portfolioId: numericPortfolioId,
          projectId: BigInt(portfolioRepository.id),
          date: today,
        },
      },
      update: {
        views: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
      create: {
        portfolioId: numericPortfolioId,
        projectId: BigInt(portfolioRepository.id),
        projectName,
        date: today,
        views: 1,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Project view ट्रैक करते समय त्रुटि:", error)
    return NextResponse.json(
      { error: "Unable to track project view" },
      { status: 500 }
    )
  }
}
