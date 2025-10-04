import { ThemeConfig } from './types'
import { AVAILABLE_THEMES, getThemeById } from './available-themes'

export class ThemeManager {
  static getTheme(id: string): ThemeConfig | null {
    return getThemeById(id)
  }

  static getAllThemes(): ThemeConfig[] {
    return AVAILABLE_THEMES
  }

  static getThemesByCategory(category: string): ThemeConfig[] {
    return AVAILABLE_THEMES.filter(theme => theme.category === category)
  }

  static validateTheme(id: string): boolean {
    return AVAILABLE_THEMES.some(theme => theme.id === id)
  }

  static generateCSSVariables(theme: ThemeConfig): Record<string, string> {
    return {
      '--color-primary': theme.colors.primary,
      '--color-secondary': theme.colors.secondary,
      '--color-accent': theme.colors.accent,
      '--color-background': theme.colors.background,
      '--color-surface': theme.colors.surface,
      '--color-text-primary': theme.colors.text.primary,
      '--color-text-secondary': theme.colors.text.secondary,
      '--color-text-muted': theme.colors.text.muted,
      '--color-border': theme.colors.border,
      '--font-heading': theme.fonts.heading,
      '--font-body': theme.fonts.body,
    }
  }
}
