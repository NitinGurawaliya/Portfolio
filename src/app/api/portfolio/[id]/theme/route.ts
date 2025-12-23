import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { THEMES, isThemeKey, type ThemeKey } from '@/lib/portfolio/themes'
import { validateSession } from '@/lib/session-validator'
import { PortfolioCache } from '@/lib/cache/portfolio-cache'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionValidation = await validateSession(request)
    if (!sessionValidation.valid || !sessionValidation.userId) {
      return NextResponse.json(
        { error: sessionValidation.error || "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const portfolioId = parseInt(id)
    const body = await request.json()
    const { theme } = body

    // Validate theme
    if (!isThemeKey(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be one of: ' + Object.keys(THEMES).join(', ') },
        { status: 400 }
      )
    }

    // Authorization: verify portfolio belongs to authenticated user
    const owningPortfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        user: { githubId: sessionValidation.userId },
      },
      select: {
        id: true,
        userId: true,
        customUsername: true,
        user: { select: { githubUsername: true } },
      },
    })

    if (!owningPortfolio) {
      return NextResponse.json(
        { error: "Portfolio not found or access denied" },
        { status: 404 }
      )
    }

    // Update portfolio theme
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        selectedTheme: theme as ThemeKey,
        updatedAt: new Date()
      },
      include: {
        user: true,
        skills: true,
        socials: true,
        repositories: {
          include: {
            repository: true
          }
        }
      }
    })

    PortfolioCache.invalidate({
      githubUsername: owningPortfolio.user?.githubUsername,
      customUsername: owningPortfolio.customUsername,
      userId: owningPortfolio.userId,
    })

    return NextResponse.json({
      success: true,
      portfolio: updatedPortfolio,
      message: `Theme updated to ${THEMES[theme as ThemeKey].name}`
    })

  } catch (error) {
    console.error('Error updating portfolio theme:', error)
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionValidation = await validateSession(request)
    if (!sessionValidation.valid || !sessionValidation.userId) {
      return NextResponse.json(
        { error: sessionValidation.error || "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const portfolioId = parseInt(id)

    // Authorization: verify portfolio belongs to authenticated user
    const owningPortfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        user: { githubId: sessionValidation.userId },
      },
      select: { id: true },
    })

    if (!owningPortfolio) {
      return NextResponse.json(
        { error: "Portfolio not found or access denied" },
        { status: 404 }
      )
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      select: {
        id: true,
        selectedTheme: true,
        themeConfig: true
      }
    })

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      currentTheme: portfolio.selectedTheme,
      themeConfig: portfolio.themeConfig,
      availableThemes: THEMES
    })

  } catch (error) {
    console.error('Error fetching portfolio theme:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    )
  }
}
