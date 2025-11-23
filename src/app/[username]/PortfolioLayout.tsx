"use client"

import { Suspense } from "react"
import { getTheme, ThemeKey } from "@/lib/theme-config"
import { getLayoutComponent } from "@/lib/theme-layouts"
import { Portfolio } from "@/interface"

interface PortfolioLayoutProps {
  portfolio: Portfolio
}

export function PortfolioLayout({ portfolio }: PortfolioLayoutProps) {
  // Dynamic theme rendering (client-side)
  const themeKey = (portfolio.selectedTheme as ThemeKey) || 'light'
  const theme = getTheme(themeKey)
  const Layout = getLayoutComponent(theme.layout)

  return (
    <Suspense fallback={
      <div className="fixed top-4 left-4 z-50">
        <p className="text-sm font-medium text-gray-700">loading...</p>
      </div>
    }>
      <Layout theme={theme} portfolio={portfolio} />
    </Suspense>
  )
}

