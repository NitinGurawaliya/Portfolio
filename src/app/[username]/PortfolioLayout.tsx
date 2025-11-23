"use client"

import { Suspense } from "react"
import { DevFolioLoader } from "@/components/ui/DevFolioLoader"
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <DevFolioLoader size="lg" />
      </div>
    }>
      <Layout theme={theme} portfolio={portfolio} />
    </Suspense>
  )
}

