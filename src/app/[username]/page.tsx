"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StructuredData } from "@/components/StructuredData"
import { DevFolioLoader } from "@/components/ui/DevFolioLoader"
import { getTheme, ThemeKey } from "@/lib/theme-config"
import { getLayoutComponent } from "@/lib/theme-layouts"
import { Portfolio } from "@/interface"

export default function PublicPortfolioPage() {
  const params = useParams()
  const username = params.username as string
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Prevent conflicts with app routes
  const reservedRoutes = ['dashboard', 'auth', 'api', '_next', 'favicon.ico']
  if (reservedRoutes.includes(username)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Portfolio URL</h1>
          <p className="text-gray-400 mb-6">This username is reserved and cannot be used for portfolios.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchPortfolio()
  }, [username])

  // Track portfolio view
  useEffect(() => {
    if (portfolio?.id) {
      // Capture referrer on client side immediately (before any navigation)
      const clientReferrer = typeof window !== 'undefined' ? document.referrer : 'direct'
      
      console.log('📊 Client-side referrer capture:', clientReferrer)
      
      fetch('/api/analytics/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: portfolio.id,
          userId: null, // We don't have user ID in public portfolio view
          clientReferrer // Send client-side captured referrer
        })
      }).catch(err => console.error('Failed to track view:', err))
    }
  }, [portfolio])

  const fetchPortfolio = async () => {
    try {
      // Use optimized public portfolio API
      const response = await fetch(`/api/portfolio/public?username=${username}`)
      const result = await response.json()

      if (response.ok) {
        setPortfolio(result.portfolio)
      } else {
        setError(result.error || "Portfolio not found")
      }
    } catch (err) {
      setError("Failed to load portfolio")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <DevFolioLoader size="lg" />
      </div>
    )
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Portfolio Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error || "This portfolio doesn't exist or hasn't been published yet."}
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.history.back()}
              className="bg-white text-black hover:bg-gray-200 w-full"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => window.open('/dashboard', '_blank')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Dynamic theme rendering
  const themeKey = (portfolio.selectedTheme as ThemeKey) || 'light'
  const theme = getTheme(themeKey)
  const Layout = getLayoutComponent(theme.layout)

  return (
    <div className="scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
      {/* Structured Data for SEO */}
        <StructuredData
          type="Person"
          data={{
            name: portfolio.displayName,
            jobTitle: portfolio.jobTitle,
            bio: portfolio.bio,
            image: portfolio.profilePic,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            sameAs: portfolio.socials?.map(s => s.url).filter(Boolean),
            worksFor: portfolio.user.company ? {
              name: portfolio.user.company,
            } : undefined,
            location: portfolio.user.location,
            skills: portfolio.skills?.map(s => s.name),
          }}
        />
      
      {/* Dynamic Theme Layout */}
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><DevFolioLoader size="lg" /></div>}>
        <Layout theme={theme} portfolio={portfolio} />
      </Suspense>
    </div>
  )
}
