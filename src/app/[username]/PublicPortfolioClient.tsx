"use client"

import { useEffect, useRef } from "react"
import { Portfolio } from "@/interface"
import { PortfolioShareButton } from "@/components/portfolio/PortfolioShareButton"
import { useParams } from "next/navigation"

interface PublicPortfolioClientProps {
  portfolio: Portfolio
}

export function PublicPortfolioClient({ portfolio }: PublicPortfolioClientProps) {
  const params = useParams()
  const username = params.username as string
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  
  // Track if favicon has been updated to prevent multiple calls
  const faviconUpdatedRef = useRef<string | null>(null)
  const analyticsTrackedRef = useRef<boolean>(false)

  // Update favicon once when portfolio data is available
  useEffect(() => {
    if (portfolio?.profilePic && typeof window !== 'undefined') {
      // Prevent duplicate updates for the same profile picture
      if (faviconUpdatedRef.current === portfolio.profilePic) {
        return
      }

      if (!portfolio.profilePic.startsWith('http')) {
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
      const cacheBuster = generateCacheBuster(portfolio.profilePic)
      const timestamp = Date.now()
      const faviconUrl = `${baseUrl}/api/favicon?url=${encodeURIComponent(portfolio.profilePic)}&username=${encodeURIComponent(username)}&hash=${cacheBuster}&t=${timestamp}`

      // Mark as updated
      faviconUpdatedRef.current = portfolio.profilePic

      // Remove existing favicon links
      const existingIcons = document.querySelectorAll("link[rel*='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']")
      existingIcons.forEach(icon => icon.remove())

      // Create new favicon link
      const createFaviconLink = (rel: string, type?: string) => {
        const link = document.createElement('link')
        link.rel = rel
        if (type) link.type = type
        link.href = faviconUrl
        const firstChild = document.head.firstChild
        if (firstChild) {
          document.head.insertBefore(link, firstChild)
        } else {
          document.head.appendChild(link)
        }
        return link
      }

      // Create icon links
      createFaviconLink('icon', 'image/png')
      createFaviconLink('shortcut icon', 'image/png')
      createFaviconLink('apple-touch-icon')

      // Simple browser refresh trick
      const originalTitle = document.title
      document.title = ' '
      setTimeout(() => {
        document.title = originalTitle
      }, 10)
    }
  }, [portfolio?.profilePic, username])

  // Track portfolio view (only once)
  useEffect(() => {
    if (portfolio?.id && !analyticsTrackedRef.current && typeof window !== 'undefined') {
      analyticsTrackedRef.current = true
      
      // Capture referrer on client side
      const clientReferrer = document.referrer || 'direct'
      
      // Track view asynchronously (non-blocking)
      fetch('/api/analytics/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: portfolio.id,
          userId: null,
          clientReferrer
        })
      }).catch(err => console.error('Failed to track view:', err))
    }
  }, [portfolio?.id])

  return <PortfolioShareButton url={shareUrl} portfolioName={portfolio.displayName ?? undefined} />
}

