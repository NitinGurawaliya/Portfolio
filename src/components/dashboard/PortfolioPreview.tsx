"use client"

import { Suspense } from "react"
import { getLayoutComponent } from "@/lib/theme-layouts"
import { getTheme } from "@/lib/theme-config"
import { DevFolioLoader } from "@/components/ui/DevFolioLoader"

interface Portfolio {
  id: number
  displayName: string
  bio: string
  profilePic: string
  selectedTheme?: string
  skills: any[]
  socials: any[]
  repositories: any[]
  user: {
    githubUsername: string
    location: string
    company: string
    websiteUrl: string
  }
}

interface PortfolioPreviewProps {
  username?: string
  previewMode: "desktop" | "tablet" | "mobile"
  portfolio: Portfolio | null
}

export function PortfolioPreview({ username, previewMode, portfolio }: PortfolioPreviewProps) {
  if (!portfolio) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900/60 to-black rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white text-sm">Loading preview...</p>
        </div>
      </div>
    )
  }

  // Get the selected theme or default to dark
  const themeKey = (portfolio.selectedTheme || 'dark') as 'dark' | 'light'
  const theme = getTheme(themeKey)
  const LayoutComponent = getLayoutComponent(theme.layout as any)

  return (
    <div className="w-full h-full overflow-hidden rounded-xl">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900/60 to-black rounded-xl">
          <DevFolioLoader size="lg" />
        </div>
      }>
        <div 
          className="w-full h-full overflow-y-auto overflow-x-hidden"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div 
            style={{
              transform: previewMode === 'mobile' ? 'scale(0.6)' : previewMode === 'tablet' ? 'scale(0.8)' : 'scale(1)',
              transformOrigin: 'top left',
              width: previewMode === 'mobile' ? '167%' : previewMode === 'tablet' ? '125%' : '100%'
            }}
          >
            <LayoutComponent theme={theme} portfolio={portfolio} />
          </div>
        </div>
      </Suspense>
    </div>
  )
}