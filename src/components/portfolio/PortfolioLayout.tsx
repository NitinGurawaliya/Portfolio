"use client"

import { PortfolioSidebar } from "./PortfolioSidebar"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface PortfolioLayoutProps {
  children: React.ReactNode
}

export function PortfolioLayout({ children }: PortfolioLayoutProps) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen">{children}</div>
  }

  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  return (
    <div className={cn(
      "h-screen flex overflow-hidden",
      isDark ? "bg-gray-950" : "bg-gray-50"
    )}>
      {/* Sidebar */}
      <PortfolioSidebar />

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-colors duration-200 overflow-hidden",
        "lg:ml-64", // Offset for sidebar on desktop
        isDark ? "bg-gray-950" : "bg-gray-50"
      )}>
        <div className="w-full h-full overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}

