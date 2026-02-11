import type { ThemeKey } from "@/lib/theme-config"

export interface ThemeSelectorProps {
  currentTheme: ThemeKey
  userId: number
  onThemeChange?: (theme: ThemeKey) => void
  portfolioId?: number
  backgroundColor?: string | null
  backgroundPattern?: string | null
  setBackgroundColor?: (color: string | null) => void
  setBackgroundPattern?: (pattern: string | null) => void
  onboardingMode?: boolean
}
