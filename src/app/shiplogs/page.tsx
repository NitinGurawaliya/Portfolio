"use client"

import { PortfolioLayout } from "@/components/portfolio/PortfolioLayout"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export default function ShiplogsPage() {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  return (
    <PortfolioLayout>
      <div className={cn(
        "min-h-screen p-8",
        isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
      )}>
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className={cn(
              "text-4xl font-bold mb-2",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Shiplogs
            </h1>
            <p className={cn(
              "text-lg",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>
              Share your development journey and updates
            </p>
          </div>

          {/* Content Placeholder */}
          <div className={cn(
            "rounded-lg p-12 text-center border-2 border-dashed",
            isDark 
              ? "border-gray-700 bg-gray-900" 
              : "border-gray-300 bg-white"
          )}>
            <p className={cn(
              "text-lg",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>
              Shiplogs page content coming soon...
            </p>
          </div>
        </div>
      </div>
    </PortfolioLayout>
  )
}

