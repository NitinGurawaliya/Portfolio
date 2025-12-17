import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Define themes directly in API route to avoid client component imports
const THEMES = {
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
  acernity: {
    name: "Acernity",
    colors: {
      background: "#ffffff",
      text: "#0f172a",
      accent: "#6366f1",
      cardBg: "#f9fafb",
      border: "#e5e7eb"
    },
    layout: "PortfolioLayout",
    previewImage: "/themes/modern-preview.png",
    description: "Beautiful minimal portfolio with smooth animations and modern design"
  },
} as const

type ThemeKey = keyof typeof THEMES

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const portfolioId = parseInt(id)

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
