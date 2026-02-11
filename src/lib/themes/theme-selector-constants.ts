import type { ThemeKey } from "@/lib/theme-config"

export interface ThemeBackgroundColorOption {
  name: string
  value: string
  preview: string
}

export interface ThemeBackgroundPatternOption {
  name: string
  value: string | null
}

export const SELECTABLE_THEME_KEYS: ThemeKey[] = ["light", "modern", "acernity"]

// Keep "Default" as pure white. Null can fallback to dark gradients in some layouts.
export const BACKGROUND_COLORS: ThemeBackgroundColorOption[] = [
  { name: "Default", value: "#ffffff", preview: "linear-gradient(to bottom right, #ffffff, #f8f8f8)" },
  { name: "Cloud", value: "#f8fafc", preview: "linear-gradient(to bottom right, #f8fafc, #eef2f6)" },
  { name: "Sky Mist", value: "#f1f6ff", preview: "linear-gradient(to bottom right, #f1f6ff, #e0edff)" },
  { name: "Soft Lilac", value: "#f6f1ff", preview: "linear-gradient(to bottom right, #f6f1ff, #ebe2ff)" },
  { name: "Blush", value: "#fff1f5", preview: "linear-gradient(to bottom right, #fff1f5, #ffe4eb)" },
  { name: "Morning Peach", value: "#fff6ec", preview: "linear-gradient(to bottom right, #fff6ec, #ffe8d6)" },
  { name: "Mint Whisper", value: "#f1fdf6", preview: "linear-gradient(to bottom right, #f1fdf6, #dcfce7)" },
  { name: "Seafoam", value: "#ecfeff", preview: "linear-gradient(to bottom right, #ecfeff, #d7f5f7)" },
  { name: "Lemon Ice", value: "#fffbea", preview: "linear-gradient(to bottom right, #fffbea, #fef3c7)" },
  { name: "Porcelain", value: "#f3f4f6", preview: "linear-gradient(to bottom right, #f3f4f6, #e5e7eb)" },
]

export const BACKGROUND_PATTERNS: ThemeBackgroundPatternOption[] = [
  { name: "None", value: null },
  { name: "Dots", value: "dots" },
  { name: "Grid", value: "grid" },
  { name: "Cross", value: "cross" },
  { name: "Waves", value: "waves" },
  { name: "Stars", value: "stars" },
  { name: "Sprinkles", value: "sprinkles" },
  { name: "Diagonal", value: "diagonal" },
  { name: "Mesh", value: "mesh" },
]
