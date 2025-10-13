import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '@/lib/middleware'
import { getThemeByPortfolioId, updateThemeByPortfolioId } from '@/lib/services'

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
  }
} as const

type ThemeKey = keyof typeof THEMES

export const PATCH = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const portfolioId = parseInt(id)
    const body = await request.json()
    const { theme } = body

    // Validate theme
    if (!theme || !Object.keys(THEMES).includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be one of: ' + Object.keys(THEMES).join(', ') },
        { status: 400 }
      )
    }

    const updatedPortfolio = await updateThemeByPortfolioId({ portfolioId, theme })

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
})

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const portfolioId = parseInt(id)

    const portfolio = await getThemeByPortfolioId({ portfolioId })

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      currentTheme: (portfolio as any).selectedTheme,
      themeConfig: (portfolio as any).themeConfig,
      availableThemes: THEMES
    })

  } catch (error) {
    console.error('Error fetching portfolio theme:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    )
  }
})
