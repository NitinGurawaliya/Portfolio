import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { portfolioId, projectId } = await request.json()

    if (!portfolioId || !projectId) {
      return NextResponse.json(
        { error: "portfolioId और projectId आवश्यक हैं" },
        { status: 400 }
      )
    }

    const numericPortfolioId = Number(portfolioId)
    const numericProjectId = Number(projectId)

    if (!Number.isFinite(numericPortfolioId) || !Number.isFinite(numericProjectId)) {
      return NextResponse.json(
        { error: "अमान्य पहचानकर्ता" },
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
        { error: "प्रोजेक्ट उपलब्ध नहीं है या प्रकाशित नहीं है" },
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
      { error: "प्रोजेक्ट व्यू ट्रैक नहीं कर पाए" },
      { status: 500 }
    )
  }
}
