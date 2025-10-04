'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ThemeConfig, ThemeContextType } from '@/lib/themes/types'
import { AVAILABLE_THEMES, getThemeById, getDefaultTheme } from '@/lib/themes/available-themes'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<string>('modern-dark')
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(getDefaultTheme())

  const setTheme = (themeId: string) => {
    const theme = getThemeById(themeId)
    if (theme) {
      setCurrentTheme(themeId)
      setThemeConfig(theme)
    }
  }

  const value: ThemeContextType = {
    currentTheme,
    themeConfig,
    setTheme,
    availableThemes: AVAILABLE_THEMES
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
