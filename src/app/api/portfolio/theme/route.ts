import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withErrorHandling } from '@/lib/middleware'
import { validateRequest } from '@/lib/middleware'
import { themeUpdateSchema } from '@/lib/validators'
import { getThemeByUserId, updateThemeByUserId } from '@/lib/services'

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

export const PATCH = withAuth(
  withErrorHandling(
    validateRequest(themeUpdateSchema)(async (_req: NextRequest, ctx) => {
      const { theme, userId: rawUserId } = ctx.data
      const userId = rawUserId || ctx.user?.id
      if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
      if (!Object.keys(THEMES).includes(theme)) {
        return NextResponse.json({ error: 'Invalid theme. Must be one of: ' + Object.keys(THEMES).join(', ') }, { status: 400 })
      }
      await updateThemeByUserId({ userId, theme })
      return NextResponse.json({ success: true, message: `Theme updated to ${THEMES[theme as ThemeKey].name}` })
    })
  )
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    const portfolio = await getThemeByUserId({ userId })
    return NextResponse.json({ currentTheme: (portfolio as any)?.selectedTheme || 'dark', themeConfig: (portfolio as any)?.themeConfig, availableThemes: THEMES })
  } catch (error) {
    console.error('Error fetching portfolio theme:', error)
    return NextResponse.json({ error: 'Failed to fetch theme' }, { status: 500 })
  }
}
