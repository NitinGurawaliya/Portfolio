"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Check } from "lucide-react"
import { motion } from "framer-motion"
import { THEMES, ThemeKey, ThemeConfig } from "@/lib/theme-config"
import Image from "next/image"

interface ThemeSelectorPanelProps {
  selectedTheme: ThemeKey
  onThemeChange: (theme: ThemeKey) => void
}

const AVAILABLE_THEMES: ThemeKey[] = ['light', 'modern', 'acernity']

export function ThemeSelectorPanel({ selectedTheme, onThemeChange }: ThemeSelectorPanelProps) {
  return (
    <div className="h-full bg-white flex flex-col border-l border-gray-200 z-50 relative">
      <div className="p-6 space-y-4 flex-1 overflow-y-auto">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Palette className="h-5 w-5 text-orange-500" />
            Choose Theme
          </h2>
          <p className="text-xs text-gray-600">
            Select a theme to preview
          </p>
        </div>

        <div className="space-y-2">
          {AVAILABLE_THEMES.map((themeKey) => {
            const theme = THEMES[themeKey]
            const isSelected = selectedTheme === themeKey

            return (
              <motion.button
                key={themeKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => onThemeChange(themeKey)}
                className={`w-full transition-all rounded-lg p-2 flex items-center gap-3 ${
                  isSelected
                    ? 'bg-orange-50 border-2 border-orange-500'
                    : 'bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                }`}
              >
                {/* Theme Preview Image - Left Side */}
                <div className="relative w-12 h-8 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                  <Image
                    src={theme.previewImage}
                    alt={theme.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Theme Name - Right Side */}
                <div className="flex-1 flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-gray-900">{theme.name}</h3>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Theme changes will be saved when you publish
        </p>
      </div>
    </div>
  )
}

