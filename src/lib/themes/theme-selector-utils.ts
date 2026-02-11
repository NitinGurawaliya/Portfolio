import type { CSSProperties } from "react"
import { THEMES, type ThemeKey } from "@/lib/theme-config"

export function getVisibleThemeKeys(selectableThemes: ThemeKey[], selectedTheme: ThemeKey): ThemeKey[] {
  return Array.from(new Set([selectedTheme, ...selectableThemes])).filter((themeKey): themeKey is ThemeKey => themeKey in THEMES)
}

export function getPatternStyle(pattern: string | null): CSSProperties {
  if (!pattern) return {}

  const accent = "color-mix(in srgb, var(--foreground) 8%, transparent)"
  const accentStrong = "color-mix(in srgb, var(--foreground) 12%, transparent)"

  if (pattern === "dots") {
    return {
      backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1px)`,
      backgroundSize: "20px 20px",
    }
  }

  if (pattern === "grid") {
    return {
      backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`,
      backgroundSize: "22px 22px",
    }
  }

  if (pattern === "cross") {
    return {
      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 12px, ${accent} 12px, ${accent} 13px)`,
    }
  }

  if (pattern === "waves") {
    return {
      backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${accent} 3px, ${accent} 4px)`,
    }
  }

  if (pattern === "stars") {
    return {
      backgroundImage: `radial-gradient(circle at 2px 2px, ${accentStrong} 1px, transparent 0)`,
      backgroundSize: "28px 28px",
    }
  }

  if (pattern === "sprinkles") {
    return {
      backgroundImage: `
        radial-gradient(circle, ${accentStrong} 0.6px, transparent 0.6px),
        radial-gradient(circle, ${accent} 0.6px, transparent 0.6px)
      `,
      backgroundSize: "24px 24px",
      backgroundPosition: "0 0, 12px 12px",
    }
  }

  if (pattern === "diagonal") {
    return {
      backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 16px, ${accent} 16px, ${accent} 17px)`,
    }
  }

  if (pattern === "mesh") {
    return {
      backgroundImage: `
        radial-gradient(60% 60% at 20% 20%, ${accentStrong} 0%, transparent 60%),
        radial-gradient(50% 50% at 80% 0%, ${accent} 0%, transparent 55%),
        radial-gradient(70% 70% at 30% 80%, ${accent} 0%, transparent 60%)
      `,
      backgroundBlendMode: "screen",
    }
  }

  return {}
}
