import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { invalidateCache, CacheKeys } from '@/lib/cache'

// Define themes directly in API route to avoid client component imports
const THEMES = {
  dark: {
    name: "Dark",
    colors: {
      background: "#000000",
      text: "#ffffff",
      accent: "#f97316",
      cardBg: "#1f2937",
      border: "#374151"
    },
    layout: "LayoutDark",
    previewImage: "/themes/dark-preview.png",
    description: "Professional dark theme with orange accents"
  },
  light: {
    name: "Light",
    colors: {
      background: "#ffffff",
      text: "#1f2937",
      accent: "#2563eb",
      cardBg: "#f9fafb",
      border: "#e5e7eb"
    },
    layout: "LayoutLight",
    previewImage: "/themes/light-preview.png",
    description: "Clean light theme with blue accents"
  },
  modern: {
    name: "Modern",
    colors: {
      background: "#ffffff",
      text: "#0f172a",
      accent: "#111111",
      cardBg: "#f5f5f5",
      border: "#d1d5db"
    },
    layout: "LayoutModern",
    previewImage: "/themes/modern-preview.png",
    description: "Minimal monochrome layout with bold sections"
  },
} as const

type ThemeKey = keyof typeof THEMES

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { theme, userId } = body

    // Validate theme
    if (!theme || !Object.keys(THEMES).includes(theme)) {
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
        user: {
          select: {
            githubUsername: true
          }
        }
      }
    })

    // Invalidate cache for public portfolio pages
    // This ensures theme changes show up immediately on public pages
    const usernamesToInvalidate: string[] = []
    if (updatedPortfolio.customUsername) {
      usernamesToInvalidate.push(`public_${updatedPortfolio.customUsername}`)
      usernamesToInvalidate.push(CacheKeys.portfolio(updatedPortfolio.customUsername))
    }
    if (updatedPortfolio.user?.githubUsername) {
      usernamesToInvalidate.push(`public_${updatedPortfolio.user.githubUsername}`)
      usernamesToInvalidate.push(CacheKeys.portfolio(updatedPortfolio.user.githubUsername))
    }
    
    // Invalidate all related cache keys
    for (const username of usernamesToInvalidate) {
      invalidateCache(username)
    }

    console.log(`✅ Theme updated and cache invalidated for:`, usernamesToInvalidate)

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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
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
