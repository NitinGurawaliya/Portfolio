"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Palette, Moon, Sun, Sparkles, X } from 'lucide-react'
import { THEMES, ThemeKey, ThemeConfig } from '@/lib/theme-config'

interface ThemeSelectorProps {
  currentTheme: ThemeKey
  userId: number
  onThemeChange?: (theme: ThemeKey) => void
  portfolioId?: number
  backgroundColor?: string | null
  backgroundPattern?: string | null
  setBackgroundColor?: (color: string | null) => void
  setBackgroundPattern?: (pattern: string | null) => void
  onboardingMode?: boolean
}

// Background color options
// NOTE: Keep 'Default' as pure white instead of null to avoid falling back
// to dark gradient backgrounds in dark theme layouts.
// Light and subtle colors - visible but not overpowering
const BACKGROUND_COLORS = [
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

// Background pattern options
const BACKGROUND_PATTERNS = [
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

export default function ThemeSelector({ 
  currentTheme, 
  userId: _userId, 
  onThemeChange,
  portfolioId: _portfolioId,
  backgroundColor: backgroundColorProp,
  backgroundPattern: backgroundPatternProp,
  setBackgroundColor: setBackgroundColorProp,
  setBackgroundPattern: setBackgroundPatternProp,
  onboardingMode = false
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(currentTheme)
  const [fullViewImage, setFullViewImage] = useState<string | null>(null)
  
  // Use props if provided, otherwise use local state as fallback
  const backgroundColor = backgroundColorProp ?? null
  const backgroundPattern = backgroundPatternProp ?? null
  const setBackgroundColor = setBackgroundColorProp ?? (() => {})
  const setBackgroundPattern = setBackgroundPatternProp ?? (() => {})

  // Sync selectedTheme with currentTheme prop
  useEffect(() => {
    setSelectedTheme(currentTheme)
  }, [currentTheme])

  const handleThemeSelect = (theme: ThemeKey) => {
    if (theme === selectedTheme) return

    setSelectedTheme(theme)

    // Update live preview instantly
    if (onThemeChange) {
      onThemeChange(theme)
    }
  }

  const handleBackgroundColorChange = (color: string | null) => {
    setBackgroundColor(color)
  }

  const handleBackgroundPatternChange = (pattern: string | null) => {
    setBackgroundPattern(pattern)
  }

  const selectableThemes: ThemeKey[] = ['light', 'modern', 'acernity']
  const getPatternStyle = (pattern: string | null) => {
    if (!pattern) return {}
    
    const accent = "color-mix(in srgb, var(--foreground) 8%, transparent)"
    const accentStrong = "color-mix(in srgb, var(--foreground) 12%, transparent)"

    // Subtle patterns - light opacity for gentle visual texture
    switch (pattern) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }
      case 'grid':
        return {
          backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`,
          backgroundSize: '22px 22px'
        }
      case 'cross':
        return {
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 12px, ${accent} 12px, ${accent} 13px)`
        }
      case 'waves':
        return {
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${accent} 3px, ${accent} 4px)`
        }
      case 'stars':
        return {
          backgroundImage: `radial-gradient(circle at 2px 2px, ${accentStrong} 1px, transparent 0)`,
          backgroundSize: '28px 28px'
        }
      case 'sprinkles':
        return {
          backgroundImage: `
            radial-gradient(circle, ${accentStrong} 0.6px, transparent 0.6px),
            radial-gradient(circle, ${accent} 0.6px, transparent 0.6px)
          `,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }
      case 'diagonal':
        return {
          backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 16px, ${accent} 16px, ${accent} 17px)`
        }
      case 'mesh':
        return {
          backgroundImage: `
            radial-gradient(60% 60% at 20% 20%, ${accentStrong} 0%, transparent 60%),
            radial-gradient(50% 50% at 80% 0%, ${accent} 0%, transparent 55%),
            radial-gradient(70% 70% at 30% 80%, ${accent} 0%, transparent 60%)
          `,
          backgroundBlendMode: 'screen'
        }
      default:
        return {}
    }
  }

  const getThemePreview = (themeConfig: ThemeConfig) => {
    if (themeConfig.previewImage) {
      return (
        <div className="relative w-full overflow-hidden rounded-2xl bg-white aspect-[16/9]">
          <img
            src={themeConfig.previewImage}
            alt={`${themeConfig.name} preview`}
            className="absolute inset-0 h-full w-full object-cover cursor-zoom-in"
            loading="lazy"
            onClick={(e) => {
              e.stopPropagation()
              setFullViewImage(themeConfig.previewImage)
            }}
          />
          {/* Theme Name Badge */}
          <div className="absolute top-2 right-2">
            <div 
              className="px-2 py-1 rounded-md text-[10px] font-semibold text-white shadow-sm"
              style={{ 
                backgroundColor: themeConfig.colors.accent
              }}
            >
              {themeConfig.name}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div 
        className="w-full h-20 rounded-lg border relative overflow-hidden shadow-sm"
        style={{ 
          background: themeConfig.colors.background,
          borderColor: themeConfig.colors.border || themeConfig.colors.accent + '30'
        }}
      >
        <div className="absolute inset-0 p-2">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-5 h-5 rounded-full border-2"
              style={{ 
                borderColor: themeConfig.colors.accent,
                backgroundColor: themeConfig.colors.cardBg || themeConfig.colors.background
              }}
            />
            <div className="flex-1">
              <div 
                className="h-1.5 rounded mb-1"
                style={{ 
                  backgroundColor: themeConfig.colors.text,
                  width: '70%'
                }}
              />
              <div 
                className="h-1 rounded"
                style={{ 
                  backgroundColor: themeConfig.colors.accent,
                  width: '50%'
                }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div 
              className="h-3 rounded border"
              style={{ 
                backgroundColor: themeConfig.colors.cardBg || themeConfig.colors.background,
                borderColor: themeConfig.colors.border || themeConfig.colors.accent + '40'
              }}
            />
            <div 
              className="h-3 rounded border"
              style={{ 
                backgroundColor: themeConfig.colors.cardBg || themeConfig.colors.background,
                borderColor: themeConfig.colors.border || themeConfig.colors.accent + '40'
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Theme Layout Selection */}
      {!onboardingMode && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose Your Layout</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from(new Set<ThemeKey>([...selectableThemes, selectedTheme].filter((key): key is ThemeKey => key in THEMES))).map((themeKey) => {
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
                    className={`relative mx-auto w-full max-w-[240px] cursor-pointer overflow-hidden rounded-3xl border-0 transition-all ${
                      !isSelectable ? 'cursor-not-allowed opacity-75' : ''
                    }`}
                    onClick={() => {
                      if (!isSelectable) return
                      handleThemeSelect(themeKey)
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (!isSelectable) return
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleThemeSelect(themeKey)
                      }
                    }}
                  >
                    <CardContent className="p-0">
                      {getThemePreview(themeConfig)}
                    </CardContent>
                  </Card>
                  
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full max-w-[240px] rounded-full text-xs font-medium transition-all ${
                      isSelected 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-500 shadow-md hover:shadow-lg' 
                        : isSelectable
                        ? 'border-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-orange-400 hover:text-orange-600 shadow-sm hover:shadow-md'
                        : 'border-1 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                    disabled={!isSelectable || isSelected}
                    onClick={() => {
                      if (!isSelectable || isSelected) return
                      handleThemeSelect(themeKey)
                    }}
                  >
                    {isSelected ? (isSelectable ? "Selected" : "Active (Legacy)") : isSelectable ? "Use this layout" : "Not available"}
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Onboarding Theme Layout Selection - Simplified */}
      {onboardingMode && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Choose Your Layout</h3>
          </div>
          <div className="grid gap-2 grid-cols-2">
            {selectableThemes.map((themeKey) => {
              const themeConfig = THEMES[themeKey]
              const isSelected = selectedTheme === themeKey
              return (
                <motion.div
                  key={themeKey}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center gap-2"
                >
                  <Card
                    className={`relative w-full cursor-pointer overflow-hidden rounded-xl transition-all ${
                      isSelected ? 'ring-2 ring-orange-500' : 'hover:ring-2 hover:ring-orange-300'
                    }`}
                    onClick={() => handleThemeSelect(themeKey)}
                  >
                    <CardContent className="p-0">
                      {getThemePreview(themeConfig)}
                    </CardContent>
                  </Card>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`w-full rounded-lg text-xs font-medium transition-all ${
                      isSelected 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white border-1 border-orange-500 shadow-md hover:shadow-lg' 
                        : 'border-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-orange-400 hover:text-orange-600 shadow-sm hover:shadow-md'
                    }`}
                    disabled={isSelected}
                  >
                    {isSelected ? "Selected" : "Use this layout"}
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Background Customization Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className={`${onboardingMode ? 'text-sm' : 'text-lg'} font-semibold text-gray-900 dark:text-white`}>Customize Background</h3>
        </div>
        
        {/* Background Colors */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3 dark:text-white">Background Colors</p>
          <div className={`grid ${onboardingMode ? 'grid-cols-5 gap-2' : 'grid-cols-4 md:grid-cols-8 gap-x-3 gap-y-6'}`}>
            {BACKGROUND_COLORS.map((color) => (
              <motion.div
                key={color.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <button
                  onClick={() => handleBackgroundColorChange(color.value)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    backgroundColor === color.value
                      ? 'border-orange-500 shadow-lg ring-2 ring-orange-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ background: color.preview }}
                >
                  {backgroundColor === color.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check className="h-5 w-5 text-orange-600" />
                    </motion.div>
                  )}
                </button>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                  {color.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Background Patterns */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3 dark:text-white">Background Patterns</p>
          <div className={`grid ${onboardingMode ? 'grid-cols-3 gap-2' : 'grid-cols-3 md:grid-cols-6 gap-x-3 gap-y-6'}`}>
            {BACKGROUND_PATTERNS.map((pattern) => (
              <motion.div
                key={pattern.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <button
                  onClick={() => handleBackgroundPatternChange(pattern.value)}
                  className={`w-full aspect-video rounded-lg border-2 transition-all ${
                    backgroundPattern === pattern.value
                      ? 'border-orange-500 shadow-lg ring-2 ring-orange-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ 
                    backgroundColor: backgroundColor || '#ffffff',
                    ...getPatternStyle(pattern.value)
                  }}
                >
                  {backgroundPattern === pattern.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check className="h-5 w-5 text-orange-600" />
                    </motion.div>
                  )}
                </button>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                  {pattern.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Note */}
      {!onboardingMode && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Palette className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-orange-900">Customization</h4>
              <p className="text-sm text-orange-700 mt-1">
                Changes will be applied when you click "Publish 🔥"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full View Image Modal */}
      <AnimatePresence>
        {fullViewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setFullViewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setFullViewImage(null)}
                className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={fullViewImage}
                alt="Theme preview"
                className="w-full h-full object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
