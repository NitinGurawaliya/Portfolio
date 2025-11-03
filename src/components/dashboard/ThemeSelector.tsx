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
// Light and subtle colors - visible but not overpowering
const BACKGROUND_COLORS = [
  { name: 'Default', value: '#ffffff', preview: 'linear-gradient(to bottom right, #ffffff, #f8f8f8)' },
  { name: 'Sky Blue', value: '#eff6ff', preview: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' },
  { name: 'Mint Green', value: '#ecfdf5', preview: 'linear-gradient(to bottom right, #ecfdf5, #d1fae5)' },
  { name: 'Peach', value: '#fff7ed', preview: 'linear-gradient(to bottom right, #fff7ed, #fed7aa)' },
  { name: 'Lavender', value: '#f5f3ff', preview: 'linear-gradient(to bottom right, #f5f3ff, #e9d5ff)' },
  { name: 'Rose Pink', value: '#fdf2f8', preview: 'linear-gradient(to bottom right, #fdf2f8, #fce7f3)' },
  { name: 'Canary Yellow', value: '#fffbeb', preview: 'linear-gradient(to bottom right, #fffbeb, #fef3c7)' },
  { name: 'Soft Cyan', value: '#ecfeff', preview: 'linear-gradient(to bottom right, #ecfeff, #cffafe)' },
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
    
    // Subtle patterns - light opacity for gentle visual texture
    switch (pattern) {
      case 'dots':
        return {
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }
      case 'grid':
        return {
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }
      case 'cross':
        return {
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.04) 20px)'
        }
      case 'waves':
        return {
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)'
        }
      case 'stars':
        return {
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.08) 1px, transparent 0)',
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
      {/* Background Customization Section */}
      <div className="space-y-4">
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
