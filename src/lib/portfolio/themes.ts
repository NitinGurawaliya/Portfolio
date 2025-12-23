export const THEMES = {
  dark: {
    name: "Dark",
    colors: {
      background: "#000000",
      text: "#ffffff",
      accent: "#f97316",
      cardBg: "#1f2937",
      border: "#374151",
    },
    layout: "LayoutDark",
    previewImage: "/themes/dark-preview.png",
    description: "Professional dark theme with orange accents",
  },
  light: {
    name: "Light",
    colors: {
      background: "#ffffff",
      text: "#1f2937",
      accent: "#2563eb",
      cardBg: "#f9fafb",
      border: "#e5e7eb",
    },
    layout: "LayoutLight",
    previewImage: "/themes/light-preview.png",
    description: "Clean light theme with blue accents",
  },
  modern: {
    name: "Modern",
    colors: {
      background: "#ffffff",
      text: "#0f172a",
      accent: "#111111",
      cardBg: "#f5f5f5",
      border: "#d1d5db",
    },
    layout: "LayoutModern",
    previewImage: "/themes/modern-preview.png",
    description: "Minimal monochrome layout with bold sections",
  },
  acernity: {
    name: "Acernity",
    colors: {
      background: "#ffffff",
      text: "#0f172a",
      accent: "#6366f1",
      cardBg: "#f9fafb",
      border: "#e5e7eb",
    },
    layout: "PortfolioLayout",
    previewImage: "/themes/modern-preview.png",
    description: "Beautiful minimal portfolio with smooth animations and modern design",
  },
} as const

export type ThemeKey = keyof typeof THEMES

export function isThemeKey(theme: unknown): theme is ThemeKey {
  return typeof theme === "string" && Object.prototype.hasOwnProperty.call(THEMES, theme)
}

