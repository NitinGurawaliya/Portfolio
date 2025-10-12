// Theme configuration object (without client component imports)
export const THEMES = {
  dark: {
    name: "Dark",
    colors: {
      background: "#000000",
      text: "#ffffff",
      accent: "#f97316", // orange-500
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
      accent: "#2563eb", // blue-600
      cardBg: "#f9fafb",
      border: "#e5e7eb"
    },
    layout: "LayoutLight",
    previewImage: "/themes/light-preview.png",
    description: "Clean light theme with blue accents"
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
  return THEMES[themeKey] || THEMES.dark
}

// Default theme
export const DEFAULT_THEME: ThemeKey = 'dark'

// Available themes array for easy iteration
export const AVAILABLE_THEMES = Object.keys(THEMES) as ThemeKey[]
