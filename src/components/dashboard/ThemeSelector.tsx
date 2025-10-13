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
        className="w-full h-28 rounded-lg border relative overflow-hidden shadow-sm"
        style={{ 
          background: themeConfig.colors.background,
          borderColor: themeConfig.colors.border || themeConfig.colors.accent + '30'
        }}
      >
        {/* Preview content */}
        <div className="absolute inset-0 p-3">
          {/* Profile section */}
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-8 h-8 rounded-full border-2"
              style={{ 
                borderColor: themeConfig.colors.accent,
                backgroundColor: themeConfig.colors.cardBg || themeConfig.colors.background
              }}
            />
            <div className="flex-1">
              <div 
                className="h-2 rounded mb-1"
                style={{ 
                  backgroundColor: themeConfig.colors.text,
                  width: '70%'
                }}
              />
              <div 
                className="h-1.5 rounded"
                style={{ 
                  backgroundColor: themeConfig.colors.accent,
                  width: '50%'
                }}
              />
            </div>
          </div>
          
          {/* Project cards */}
          <div className="space-y-2">
            <div 
              className="h-4 rounded border"
              style={{ 
                backgroundColor: themeConfig.colors.cardBg || themeConfig.colors.background,
                borderColor: themeConfig.colors.border || themeConfig.colors.accent + '40'
              }}
            />
            <div 
              className="h-4 rounded border"
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

      {/* Info Note */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <Palette className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-orange-900">Live Preview</h4>
            <p className="text-sm text-orange-700 mt-1">
              Changes apply instantly to your portfolio preview and public site
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
