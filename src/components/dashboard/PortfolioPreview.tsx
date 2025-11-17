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
  previewMode: "mobile"
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
  const themeKey = (portfolio.selectedTheme || 'light') as 'dark' | 'light'
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
          <style jsx global>{`
            div::-webkit-scrollbar {
              display: none;
            }
            
            /* FORCE MOBILE LAYOUT - Use direct targeting of DOM structure */
            /* Since Tailwind classes use media queries, we override the computed styles directly */
            
            /* Step 1: Find and disable the main grid container (lg:grid lg:grid-cols-12) */
            .preview-override[data-force-mobile="true"] > div > div:nth-child(2) > div:first-child,
            .preview-override[data-force-mobile="true"] > div > div:first-child > div:first-child {
              display: block !important;
              grid-template-columns: none !important;
              grid-template-rows: none !important;
            }
            
            /* Step 2: Force all direct children of grid to be full width blocks */
            .preview-override[data-force-mobile="true"] > div > div:nth-child(2) > div:first-child > div,
            .preview-override[data-force-mobile="true"] > div > div:first-child > div:first-child > div {
              width: 100% !important;
              max-width: 100% !important;
              display: block !important;
            }
            
            /* Step 3: Universal override for any element with responsive grid classes */
            /* Using attribute selectors to catch compiled Tailwind classes */
            .preview-override[data-force-mobile="true"] [class*="grid"][class*="lg"] {
              display: block !important;
            }
            .preview-override[data-force-mobile="true"] [class*="col-span"] {
              width: 100% !important;
              display: block !important;
            }
            
            /* Step 4: Force projects grid to single column */
            .preview-override[data-force-mobile="true"] [class*="grid-cols-2"],
            .preview-override[data-force-mobile="true"] [class*="md:grid-cols"] {
              grid-template-columns: 1fr !important;
            }
            
            /* Additional overrides for all screen sizes */
            @media (min-width: 0px) {
              .preview-override[data-force-mobile="true"] * {
                /* Override any computed grid styles */
              }
              .preview-override[data-force-mobile="true"] [style*="grid"] {
                display: block !important;
              }
            }
            
            /* Skills grid override */
            .preview-override .skills-grid {
              display: flex !important;
              flex-wrap: wrap !important;
              justify-content: center !important;
              gap: 8px !important;
            }
            .preview-override .skill-item {
              display: block !important;
              flex-direction: unset !important;
              align-items: unset !important;
            }
            .preview-override .skill-icon-container {
              display: none !important;
            }
            .preview-override .skill-text,
            .preview-override [class*="bg-black"][class*="text-white"] {
              background: black !important;
              color: white !important;
              padding: 6px 12px !important;
              border-radius: 6px !important;
              font-size: 10px !important;
              font-weight: 500 !important;
              margin-bottom: 0 !important;
              border: 1px solid #374151 !important;
            }
            /* Light theme spacing override */
            .preview-override .text-center {
              gap: 8px !important;
            }
            .preview-override .text-center > * {
              margin-bottom: 8px !important;
            }
            /* Reduce overall spacing in preview */
            .preview-override section {
              padding: 1rem 0 !important;
            }
            .preview-override .py-12 {
              padding-top: 1rem !important;
              padding-bottom: 1rem !important;
            }
            .preview-override .py-16 {
              padding-top: 1.5rem !important;
              padding-bottom: 1.5rem !important;
            }
            .preview-override .py-20 {
              padding-top: 2rem !important;
              padding-bottom: 2rem !important;
            }
            /* Force space-y-6 to smaller spacing */
            .preview-override .space-y-6 > * + * {
              margin-top: 1rem !important;
            }
          `}</style>
          <div 
            style={{ 
              transform: 'scale(0.6)',
              transformOrigin: 'top left',
              width: '167%'
            }}
          >
            <div className="preview-override" data-force-mobile="true">
              <LayoutComponent theme={theme} portfolio={portfolio} />
            </div>
          </div>
            </div>
      </Suspense>
    </div>
  )
}