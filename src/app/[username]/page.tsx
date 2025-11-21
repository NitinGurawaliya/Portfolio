"use client"

import { useEffect, useState, Suspense, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StructuredData } from "@/components/StructuredData"
import { DevFolioLoader } from "@/components/ui/DevFolioLoader"
import { getTheme, ThemeKey } from "@/lib/theme-config"
import { getLayoutComponent } from "@/lib/theme-layouts"
import { Portfolio } from "@/interface"
import { PortfolioShareButton } from "@/components/portfolio/PortfolioShareButton"

export default function PublicPortfolioPage() {
  const params = useParams()
  const username = params.username as string
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState("")
  
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

  // Track if favicon has been updated to prevent multiple calls
  const faviconUpdatedRef = useRef<string | null>(null)

  // Helper function to update favicon - OPTIMIZED: Only updates once per profilePic
  const updateFavicon = useCallback((profilePic: string, username: string) => {
    if (!profilePic || !profilePic.startsWith('http')) {
      return
    }

    // Prevent duplicate updates for the same profile picture
    if (faviconUpdatedRef.current === profilePic) {
      console.log('⏭️ Favicon already updated for this profile picture, skipping')
      return
    }

    const generateCacheBuster = (url: string): string => {
      let hash = 0
      for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return Math.abs(hash).toString(36).slice(0, 8)
    }

    const baseUrl = window.location.origin
    const cacheBuster = generateCacheBuster(profilePic)
    const timestamp = Date.now()
    const faviconUrl = `${baseUrl}/api/favicon?url=${encodeURIComponent(profilePic)}&username=${encodeURIComponent(username)}&hash=${cacheBuster}&t=${timestamp}`

    // Mark as updated
    faviconUpdatedRef.current = profilePic

    // Remove existing favicon links (including from root layout)
    const existingIcons = document.querySelectorAll("link[rel*='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']")
    existingIcons.forEach(icon => icon.remove())

    // Create new favicon link - simple and efficient
    const createFaviconLink = (rel: string, type?: string) => {
      const link = document.createElement('link')
      link.rel = rel
      if (type) link.type = type
      link.href = faviconUrl
      // Add to beginning of head to ensure priority
      const firstChild = document.head.firstChild
      if (firstChild) {
        document.head.insertBefore(link, firstChild)
      } else {
        document.head.appendChild(link)
      }
      return link
    }

    // Create icon links (only once)
    createFaviconLink('icon', 'image/png')
    createFaviconLink('shortcut icon', 'image/png')
    createFaviconLink('apple-touch-icon')

    // Simple browser refresh trick - just touch document title once
    const originalTitle = document.title
    document.title = ' '
    setTimeout(() => {
      document.title = originalTitle
    }, 10)

    console.log('✅ Favicon updated (one-time):', faviconUrl)
  }, [username])

  // Try to update favicon immediately on mount (before portfolio loads)
  // This helps catch favicon early if portfolio data is cached
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Remove default favicon immediately
      const defaultIcons = document.querySelectorAll("link[rel*='icon'][href*='favicon-d'], link[rel='shortcut icon'][href*='favicon-d']")
      defaultIcons.forEach(icon => icon.remove())
    }
  }, [])

  useEffect(() => {
    fetchPortfolio()
  }, [username])

  // Prefetch project slug pages in background
  useEffect(() => {
    if (!portfolio?.repositories || portfolio.repositories.length === 0) return

    const prefetchProjectPages = async () => {
      const visibleRepos = portfolio.repositories.filter((r: any) => r.isVisible)
      
      // Prefetch first 5 project pages in background
      for (const repo of visibleRepos.slice(0, 5)) {
        if (repo.repository?.name && username) {
          try {
            // Prefetch the project page data
            fetch(`/api/projects/public/${username}/${encodeURIComponent(repo.repository.name)}`, {
              method: 'GET',
              priority: 'low' as any
            }).catch(() => {
              // Ignore errors in prefetch
            })
          } catch (e) {
            // Ignore errors
          }
        }
      }
    }

    // Delay prefetch to not block initial load
    const timer = setTimeout(prefetchProjectPages, 2000)
    return () => clearTimeout(timer)
  }, [portfolio, username])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href)
    }
  }, [username])

  // Update favicon once when portfolio data is available - OPTIMIZED: Single update
  useEffect(() => {
    if (portfolio?.profilePic && typeof window !== 'undefined') {
      // Update only once - the ref will prevent duplicate calls
      updateFavicon(portfolio.profilePic, username)
    }
  }, [portfolio?.profilePic, username, updateFavicon])

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
        // Favicon will be updated via useEffect hook
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
        <PortfolioShareButton url={shareUrl} portfolioName={portfolio.displayName ?? undefined} />
    </div>
  )
}
