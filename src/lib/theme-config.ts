// Theme configuration object (without client component imports)
export const THEMES = {
  light: {
    name: "Light",
    colors: {
      background: "#ffffff",
      text: "#1f2937",
      accent: "#2563eb", // blue-600
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
    name: "Minimal",
    colors: {
      background: "#ffffff",
      text: "#0f172a",
      accent: "#6366f1",
      cardBg: "#f9fafb",
      border: "#e5e7eb"
    },
    layout: "LayoutAcernity", 
    previewImage: "/themes/accernity-preview.png",
    description: "Beautiful minimal portfolio with smooth animations and modern design"
  }
} as const

// Type definitions
export interface ThemeConfig {
  name: string
  colors: {
    background: string
    text: string
    accent: string
    cardBg?: string
    border?: string
  }
  layout: string
  previewImage: string
  description: string
}

export type ThemeKey = keyof typeof THEMES

// Helper function to get theme by key
export function getTheme(themeKey: ThemeKey): ThemeConfig {
  return THEMES[themeKey] || THEMES.light
}

// Default theme
export const DEFAULT_THEME: ThemeKey = 'light'

// Available themes array for easy iteration
export const AVAILABLE_THEMES = ['light', 'modern', 'acernity'] as ThemeKey[]
