"use client"

import { useEffect, useRef } from "react"
import { trackPortfolioView } from "@/lib/portfolio/analytics-utils"

interface PortfolioAnalyticsTrackerProps {
  portfolioId?: number
}

export function PortfolioAnalyticsTracker({ portfolioId }: PortfolioAnalyticsTrackerProps) {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (!portfolioId || trackedRef.current || typeof window === "undefined") return

    trackedRef.current = true
    const clientReferrer = document.referrer || "direct"

    trackPortfolioView({ portfolioId, clientReferrer }).catch((error) => {
      console.error("Failed to track view:", error)
    })
  }, [portfolioId])

  return null
}
