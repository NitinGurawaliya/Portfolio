import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PortfolioCache } from '@/lib/cache/portfolio-cache'
import { THEMES, isThemeKey, type ThemeKey } from '@/lib/portfolio/themes'
import { validateSession } from '@/lib/session-validator'

export async function PATCH(request: NextRequest) {
  try {
    const sessionValidation = await validateSession(request)
    if (!sessionValidation.valid || !sessionValidation.userId) {
      return NextResponse.json(
        { error: sessionValidation.error || "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { theme, userId } = body

    // Validate theme
    if (!isThemeKey(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be one of: ' + Object.keys(THEMES).join(', ') },
        { status: 400 }
      )
    }

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Authorization: only allow updating own theme
    if (userId.toString() !== sessionValidation.userId) {
      return NextResponse.json(
        { error: "Unauthorized: You can only modify your own portfolio" },
        { status: 403 }
      )
    }

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { githubId: userId.toString() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update or create portfolio with the new theme
    const updatedPortfolio = await prisma.portfolio.upsert({
      where: { userId: user.id },
      update: {
        selectedTheme: theme as ThemeKey,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        displayName: user.name || user.githubUsername || '',
        bio: user.bio || '',
        profilePic: user.avatarUrl || '',
        customUsername: user.githubUsername || '',
        selectedTheme: theme as ThemeKey,
        isPublished: false
      },
      select: {
        id: true,
        customUsername: true,
        userId: true,
        user: {
          select: {
            githubUsername: true
          }
        }
      }
    })

    PortfolioCache.invalidate({
      githubUsername: updatedPortfolio.user?.githubUsername,
      customUsername: updatedPortfolio.customUsername,
      userId: updatedPortfolio.userId,
    })

    return NextResponse.json({
      success: true,
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

export async function GET(request: NextRequest) {
  try {
    const sessionValidation = await validateSession(request)
    if (!sessionValidation.valid || !sessionValidation.userId) {
      return NextResponse.json(
        { error: sessionValidation.error || "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Authorization: only allow fetching own theme
    if (userId !== sessionValidation.userId) {
      return NextResponse.json(
        { error: "Unauthorized: You can only view your own theme" },
        { status: 403 }
      )
    }

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { githubId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        selectedTheme: true,
        themeConfig: true
      }
    })

    return NextResponse.json({
      currentTheme: portfolio?.selectedTheme || 'light',
      themeConfig: portfolio?.themeConfig,
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
