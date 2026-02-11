import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { THEMES, type ThemeKey } from "@/lib/theme-config"
import { getVisibleThemeKeys } from "@/lib/themes/theme-selector-utils"
import { ThemePreviewSurface } from "./ThemePreviewSurface"

interface ThemeLayoutSectionProps {
  selectedTheme: ThemeKey
  selectableThemes: ThemeKey[]
  onboardingMode: boolean
  onSelectTheme: (theme: ThemeKey) => void
  onOpenPreview: (imageUrl: string) => void
}

function StandardLayoutGrid({
  selectedTheme,
  selectableThemes,
  onSelectTheme,
  onOpenPreview,
}: Omit<ThemeLayoutSectionProps, "onboardingMode">) {
  const visibleThemeKeys = getVisibleThemeKeys(selectableThemes, selectedTheme)

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visibleThemeKeys.map((themeKey) => {
        const themeConfig = THEMES[themeKey]
        const isSelected = selectedTheme === themeKey
        const isSelectable = selectableThemes.includes(themeKey)

        return (
          <motion.div
            key={themeKey}
            whileHover={{ y: isSelectable ? -3 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <Card
              className={`relative mx-auto w-full max-w-[240px] overflow-hidden rounded-3xl border-0 transition-all ${
                isSelectable ? "cursor-pointer" : "cursor-not-allowed opacity-75"
              }`}
              onClick={() => {
                if (!isSelectable) return
                onSelectTheme(themeKey)
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (!isSelectable) return
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  onSelectTheme(themeKey)
                }
              }}
            >
              <CardContent className="p-0">
                <ThemePreviewSurface themeConfig={themeConfig} onOpenPreview={onOpenPreview} />
              </CardContent>
            </Card>

            <Button
              variant={isSelected ? "default" : "outline"}
              className={`w-full max-w-[240px] rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? "border-2 border-orange-500 bg-orange-500 text-white shadow-md hover:bg-orange-600 hover:shadow-lg"
                  : isSelectable
                    ? "border-1 border-gray-300 text-gray-700 shadow-sm hover:border-orange-400 hover:bg-gray-50 hover:text-orange-600 hover:shadow-md"
                    : "border-1 cursor-not-allowed border-gray-200 text-gray-400 opacity-60"
              }`}
              disabled={!isSelectable || isSelected}
              onClick={() => {
                if (!isSelectable || isSelected) return
                onSelectTheme(themeKey)
              }}
            >
              {isSelected ? (isSelectable ? "Selected" : "Active (Legacy)") : isSelectable ? "Use this layout" : "Not available"}
            </Button>
          </motion.div>
        )
      })}
    </div>
  )
}

function OnboardingLayoutGrid({
  selectedTheme,
  selectableThemes,
  onSelectTheme,
  onOpenPreview,
}: Omit<ThemeLayoutSectionProps, "onboardingMode">) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {selectableThemes.map((themeKey) => {
        const themeConfig = THEMES[themeKey]
        const isSelected = selectedTheme === themeKey

        return (
          <motion.div key={themeKey} whileTap={{ scale: 0.98 }} className="flex flex-col items-center gap-2">
            <Card
              className={`relative w-full cursor-pointer overflow-hidden rounded-xl transition-all ${
                isSelected ? "ring-2 ring-orange-500" : "hover:ring-2 hover:ring-orange-300"
              }`}
              onClick={() => onSelectTheme(themeKey)}
            >
              <CardContent className="p-0">
                <ThemePreviewSurface themeConfig={themeConfig} onOpenPreview={onOpenPreview} />
              </CardContent>
            </Card>

            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={`w-full rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? "border-1 border-orange-500 bg-orange-500 text-white shadow-md hover:bg-orange-600 hover:shadow-lg"
                  : "border-1 border-gray-300 text-gray-700 shadow-sm hover:border-orange-400 hover:bg-gray-50 hover:text-orange-600 hover:shadow-md"
              }`}
              disabled={isSelected}
            >
              {isSelected ? "Selected" : "Use this layout"}
            </Button>
          </motion.div>
        )
      })}
    </div>
  )
}

export function ThemeLayoutSection({
  selectedTheme,
  selectableThemes,
  onboardingMode,
  onSelectTheme,
  onOpenPreview,
}: ThemeLayoutSectionProps) {
  return (
    <div className={onboardingMode ? "space-y-3" : "space-y-4"}>
      <div className="flex items-center gap-2">
        <h3 className={onboardingMode ? "text-sm font-semibold text-gray-900 dark:text-white" : "text-lg font-semibold text-gray-900 dark:text-white"}>
          Choose Your Layout
        </h3>
      </div>

      {onboardingMode ? (
        <OnboardingLayoutGrid
          selectedTheme={selectedTheme}
          selectableThemes={selectableThemes}
          onSelectTheme={onSelectTheme}
          onOpenPreview={onOpenPreview}
        />
      ) : (
        <StandardLayoutGrid
          selectedTheme={selectedTheme}
          selectableThemes={selectableThemes}
          onSelectTheme={onSelectTheme}
          onOpenPreview={onOpenPreview}
        />
      )}
    </div>
  )
}
