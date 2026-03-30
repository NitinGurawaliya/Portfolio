"use client"

import { Suspense } from "react"
import { getTheme, ThemeKey } from "@/lib/theme-config"
import { getLayoutComponent } from "@/lib/theme-layouts"
import { Portfolio } from "@/interface"
import { PortfolioLoading } from "./components/PortfolioLoading"

interface PortfolioLayoutProps {
  portfolio: Portfolio
}

export function PortfolioLayout({ portfolio }: PortfolioLayoutProps) {
  // Dynamic theme rendering (client-side)
  const themeKey = (portfolio.selectedTheme as ThemeKey) || 'light'
  const theme = getTheme(themeKey)
  const Layout = getLayoutComponent(theme.layout)

  return (
    <Suspense fallback={<PortfolioLoading />}>
      <Layout theme={theme} portfolio={portfolio} />
    </Suspense>
  )
}

