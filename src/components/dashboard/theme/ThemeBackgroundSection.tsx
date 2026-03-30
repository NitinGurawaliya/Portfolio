import { motion } from "framer-motion"
import { Check, Palette } from "lucide-react"
import { BACKGROUND_COLORS, BACKGROUND_PATTERNS } from "@/lib/themes/theme-selector-constants"
import { getPatternStyle } from "@/lib/themes/theme-selector-utils"

interface ThemeBackgroundSectionProps {
  onboardingMode: boolean
  backgroundColor: string | null
  backgroundPattern: string | null
  onBackgroundColorChange: (color: string | null) => void
  onBackgroundPatternChange: (pattern: string | null) => void
}

export function ThemeBackgroundSection({
  onboardingMode,
  backgroundColor,
  backgroundPattern,
  onBackgroundColorChange,
  onBackgroundPatternChange,
}: ThemeBackgroundSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className={`${onboardingMode ? "text-sm" : "text-lg"} font-semibold text-gray-900 dark:text-white`}>Customize Background</h3>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-700 dark:text-white">Background Colors</p>
        <div className={`grid ${onboardingMode ? "grid-cols-5 gap-2" : "grid-cols-4 gap-x-3 gap-y-6 md:grid-cols-8"}`}>
          {BACKGROUND_COLORS.map((color) => (
            <motion.div key={color.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="group relative">
              <button
                onClick={() => onBackgroundColorChange(color.value)}
                className={`aspect-square w-full rounded-lg border-2 transition-all ${
                  backgroundColor === color.value
                    ? "border-orange-500 shadow-lg ring-2 ring-orange-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                style={{ background: color.preview }}
              >
                {backgroundColor === color.value && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-5 w-5 text-orange-600" />
                  </motion.div>
                )}
              </button>
              <div className="pointer-events-none absolute -bottom-6 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {color.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-700 dark:text-white">Background Patterns</p>
        <div className={`grid ${onboardingMode ? "grid-cols-3 gap-2" : "grid-cols-3 gap-x-3 gap-y-6 md:grid-cols-6"}`}>
          {BACKGROUND_PATTERNS.map((pattern) => (
            <motion.div key={pattern.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="group relative">
              <button
                onClick={() => onBackgroundPatternChange(pattern.value)}
                className={`aspect-video w-full rounded-lg border-2 transition-all ${
                  backgroundPattern === pattern.value
                    ? "border-orange-500 shadow-lg ring-2 ring-orange-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                style={{
                  backgroundColor: backgroundColor || "#ffffff",
                  ...getPatternStyle(pattern.value),
                }}
              >
                {backgroundPattern === pattern.value && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-5 w-5 text-orange-600" />
                  </motion.div>
                )}
              </button>
              <div className="pointer-events-none absolute -bottom-6 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {pattern.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {!onboardingMode && (
        <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500">
              <Palette className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-orange-900">Customization</h4>
              <p className="mt-1 text-sm text-orange-700">Changes will be applied when you click &quot;Publish 🔥&quot;</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
