"use client"

import { useCallback, useEffect, useState } from "react"
import type { ThemeKey } from "@/lib/theme-config"
import { ThemeBackgroundSection } from "@/components/dashboard/theme/ThemeBackgroundSection"
import { ThemeLayoutSection } from "@/components/dashboard/theme/ThemeLayoutSection"
import { ThemePreviewModal } from "@/components/dashboard/theme/ThemePreviewModal"
import type { ThemeSelectorProps } from "@/components/dashboard/theme/types"
import { SELECTABLE_THEME_KEYS } from "@/lib/themes/theme-selector-constants"

export default function ThemeSelector({
  currentTheme,
  userId: _userId,
  onThemeChange,
  portfolioId: _portfolioId,
  backgroundColor: backgroundColorProp,
  backgroundPattern: backgroundPatternProp,
  setBackgroundColor: setBackgroundColorProp,
  setBackgroundPattern: setBackgroundPatternProp,
  onboardingMode = false,
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(currentTheme)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const backgroundColor = backgroundColorProp ?? null
  const backgroundPattern = backgroundPatternProp ?? null
  const setBackgroundColor = setBackgroundColorProp ?? (() => {})
  const setBackgroundPattern = setBackgroundPatternProp ?? (() => {})

  useEffect(() => {
    setSelectedTheme(currentTheme)
  }, [currentTheme])

  const handleThemeSelect = useCallback(
    (theme: ThemeKey) => {
      if (theme === selectedTheme) return

      setSelectedTheme(theme)
      onThemeChange?.(theme)
    },
    [selectedTheme, onThemeChange]
  )

  return (
    <div className="space-y-6">
      <ThemeLayoutSection
        selectedTheme={selectedTheme}
        selectableThemes={SELECTABLE_THEME_KEYS}
        onboardingMode={onboardingMode}
        onSelectTheme={handleThemeSelect}
        onOpenPreview={setPreviewImage}
      />

      <ThemeBackgroundSection
        onboardingMode={onboardingMode}
        backgroundColor={backgroundColor}
        backgroundPattern={backgroundPattern}
        onBackgroundColorChange={setBackgroundColor}
        onBackgroundPatternChange={setBackgroundPattern}
      />

      <ThemePreviewModal previewImage={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  )
}
