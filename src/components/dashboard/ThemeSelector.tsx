"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Palette, Moon, Sun, Sparkles } from 'lucide-react'
import { THEMES, ThemeKey, ThemeConfig, getTheme } from '@/lib/theme-config'

interface ThemeSelectorProps {
  currentTheme: ThemeKey
  userId: number
  onThemeChange?: (theme: ThemeKey) => void
  portfolioId?: number
  backgroundColor?: string | null
  backgroundPattern?: string | null
  setBackgroundColor?: (color: string | null) => void
  setBackgroundPattern?: (pattern: string | null) => void
}

// Background color options
// NOTE: Keep 'Default' as pure white instead of null to avoid falling back
// to dark gradient backgrounds in dark theme layouts.
const BACKGROUND_COLORS = [
  { name: 'Default', value: '#ffffff', preview: 'linear-gradient(to bottom right, #ffffff, #f0f0f0)' },
  { name: 'Sky Blue', value: '#dbeafe', preview: 'linear-gradient(to bottom right, #dbeafe, #bfdbfe)' },
  { name: 'Mint Green', value: '#d1fae5', preview: 'linear-gradient(to bottom right, #d1fae5, #a7f3d0)' },
  { name: 'Peach', value: '#fed7aa', preview: 'linear-gradient(to bottom right, #fed7aa, #fdba74)' },
  { name: 'Lavender', value: '#e9d5ff', preview: 'linear-gradient(to bottom right, #e9d5ff, #d8b4fe)' },
  { name: 'Rose Pink', value: '#fce7f3', preview: 'linear-gradient(to bottom right, #fce7f3, #fbcfe8)' },
  { name: 'Canary Yellow', value: '#fef3c7', preview: 'linear-gradient(to bottom right, #fef3c7, #fde68a)' },
  { name: 'Soft Cyan', value: '#cffafe', preview: 'linear-gradient(to bottom right, #cffafe, #a5f3fc)' },
]

// Background pattern options
const BACKGROUND_PATTERNS = [
  { name: 'None', value: null },
  { name: 'Dots', value: 'dots' },
  { name: 'Grid', value: 'grid' },
  { name: 'Cross', value: 'cross' },
  { name: 'Waves', value: 'waves' },
  { name: 'Stars', value: 'stars' },
]

export default function ThemeSelector({ 
  currentTheme, 
  userId, 
  onThemeChange,
  portfolioId,
  backgroundColor: backgroundColorProp,
  backgroundPattern: backgroundPatternProp,
  setBackgroundColor: setBackgroundColorProp,
  setBackgroundPattern: setBackgroundPatternProp
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(currentTheme)
  const [isLoading, setIsLoading] = useState(false)
  
  // Use props if provided, otherwise use local state as fallback
  const backgroundColor = backgroundColorProp ?? null
  const backgroundPattern = backgroundPatternProp ?? null
  const setBackgroundColor = setBackgroundColorProp ?? (() => {})
  const setBackgroundPattern = setBackgroundPatternProp ?? (() => {})

  // Sync selectedTheme with currentTheme prop
  useEffect(() => {
    setSelectedTheme(currentTheme)
  }, [currentTheme])

  const handleThemeSelect = async (theme: ThemeKey) => {
    if (theme === selectedTheme) return

    setIsLoading(true)
    setSelectedTheme(theme)

    // Update live preview instantly
    if (onThemeChange) {
      onThemeChange(theme)
    }

    try {
      const response = await fetch(`/api/portfolio/theme`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme, userId }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Theme updated:', result.message)
      } else {
        console.error('Failed to update theme')
        // Revert selection on error
        setSelectedTheme(currentTheme)
        if (onThemeChange) {
          onThemeChange(currentTheme)
        }
      }
    } catch (error) {
      console.error('Error updating theme:', error)
      // Revert selection on error
      setSelectedTheme(currentTheme)
      if (onThemeChange) {
        onThemeChange(currentTheme)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackgroundColorChange = (color: string | null) => {
    setBackgroundColor(color)
  }

  const handleBackgroundPatternChange = (pattern: string | null) => {
    setBackgroundPattern(pattern)
  }

  const getThemeIcon = (themeKey: ThemeKey) => {
    switch (themeKey) {
      case 'dark':
        return <Moon className="h-6 w-6" />
      case 'light':
        return <Sun className="h-6 w-6" />
      default:
        return <Palette className="h-6 w-6" />
    }
  }

  const getPatternStyle = (pattern: string | null) => {
    if (!pattern) return {}
    
    // Use darker patterns for white background visibility
    switch (pattern) {
      case 'dots':
        return {
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }
      case 'grid':
        return {
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }
      case 'cross':
        return {
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.08) 10px, rgba(0,0,0,0.08) 20px)'
        }
      case 'waves':
        return {
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)'
        }
      case 'stars':
        return {
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.2) 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }
      default:
        return {}
    }
  }

  const getThemePreview = (themeConfig: ThemeConfig) => {
    return (
      <div 
        className="w-full h-20 rounded-lg border relative overflow-hidden shadow-sm"
        style={{ 
          background: themeConfig.colors.background,
          borderColor: themeConfig.colors.border || themeConfig.colors.accent + '30'
        }}
      >
        {/* Preview content */}
        <div className="absolute inset-0 p-2">
          {/* Profile section */}
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
          
          {/* Project cards */}
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
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Theme</h3>
        <p className="text-gray-600">Select a theme that matches your style</p>
      </div>

      {/* Theme Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(THEMES) as ThemeKey[]).map((themeKey) => {
          const theme = getTheme(themeKey)
          const isSelected = selectedTheme === themeKey
          const isCurrent = currentTheme === themeKey

          return (
            <motion.div
              key={themeKey}
              className="relative group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 border-2 ${
                  isSelected 
                    ? 'border-orange-500 shadow-xl' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
                onClick={() => handleThemeSelect(themeKey)}
              >
                <CardContent className="p-6">
                  {/* Theme Preview */}
                  <div className="mb-4">
                    {getThemePreview(theme)}
                  </div>
                  
                  {/* Theme Info */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ 
                          backgroundColor: theme.colors.accent + '20',
                          color: theme.colors.accent
                        }}
                      >
                        {getThemeIcon(themeKey as ThemeKey)}
                      </div>
                      <h4 className="font-semibold text-gray-900">{theme.name}</h4>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{theme.description}</p>

                    {/* Selection Status */}
                    <div className="flex items-center justify-center gap-2">
                      {isCurrent && (
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                          Active
                        </span>
                      )}
                      {isSelected && !isCurrent && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium"
                        >
                          <Check className="h-3 w-3" />
                          Selected
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loading overlay */}
              {isLoading && isSelected && (
                <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-orange-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                    <span className="text-sm font-medium">Updating...</span>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Background Customization Section */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Customize Background</h3>
        </div>
        
        {/* Background Colors */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Background Colors</p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
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
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {color.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Background Patterns */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Background Patterns</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
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
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {pattern.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Note */}
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
    </div>
  )
}
