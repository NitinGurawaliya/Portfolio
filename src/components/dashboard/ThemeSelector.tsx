"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Palette, Moon, Sun } from 'lucide-react'
import { THEMES, ThemeKey, ThemeConfig, getTheme } from '@/lib/theme-config'

interface ThemeSelectorProps {
  currentTheme: ThemeKey
  userId: number
  onThemeChange?: (theme: ThemeKey) => void
}

export default function ThemeSelector({ 
  currentTheme, 
  userId, 
  onThemeChange 
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(currentTheme)
  const [isLoading, setIsLoading] = useState(false)

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

  const getThemePreview = (themeConfig: ThemeConfig) => {
    return (
      <div 
        className="w-full h-24 rounded-lg border-2 border-gray-200 relative overflow-hidden"
        style={{ background: themeConfig.colors.background }}
      >
        {/* Preview content */}
        <div className="absolute inset-0 p-2">
          {/* Profile circle */}
          <div 
            className="w-6 h-6 rounded-full border-2 absolute top-2 left-2"
            style={{ 
              borderColor: themeConfig.colors.accent,
              backgroundColor: themeConfig.colors.cardBg || themeConfig.colors.background
            }}
          />
          
          {/* Name bar */}
          <div 
            className="absolute top-2 left-10 h-2 rounded"
            style={{ 
              backgroundColor: themeConfig.colors.text,
              width: '60%'
            }}
          />
          
          {/* Job title bar */}
          <div 
            className="absolute top-5 left-10 h-1.5 rounded"
            style={{ 
              backgroundColor: themeConfig.colors.accent,
              width: '40%'
            }}
          />
          
          {/* Project cards */}
          <div className="absolute bottom-2 left-2 right-2 space-y-1">
            <div 
              className="h-3 rounded border"
              style={{ 
                backgroundColor: themeConfig.colors.cardBg || themeConfig.colors.background,
                borderColor: themeConfig.colors.border || themeConfig.colors.accent
              }}
            />
            <div 
              className="h-3 rounded border"
              style={{ 
                backgroundColor: themeConfig.colors.cardBg || themeConfig.colors.background,
                borderColor: themeConfig.colors.border || themeConfig.colors.accent
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Choose Your Theme</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(THEMES) as ThemeKey[]).map((themeKey) => {
          const theme = getTheme(themeKey)
          const isSelected = selectedTheme === themeKey
          const isCurrent = currentTheme === themeKey

          return (
            <motion.div
              key={themeKey}
              className="relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleThemeSelect(themeKey)}
              >
                <CardContent className="p-4">
                  {/* Theme Preview */}
                  {getThemePreview(theme)}
                  
                  {/* Theme Info */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ 
                          backgroundColor: theme.colors.accent + '20',
                          color: theme.colors.accent
                        }}
                      >
                        {getThemeIcon(themeKey as ThemeKey)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{theme.name}</h4>
                        <p className="text-sm text-gray-500">{theme.description}</p>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loading overlay */}
              {isLoading && isSelected && (
                <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Theme Preview Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Live Preview</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your portfolio will automatically update with the new theme. 
              Changes are saved instantly and visible on your public portfolio.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
