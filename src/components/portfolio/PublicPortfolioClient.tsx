"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { PortfolioShareButton } from "@/components/portfolio/PortfolioShareButton"
import { FaviconUpdater } from "@/components/portfolio/FaviconUpdater"
import { PortfolioAnalyticsTracker } from "@/components/portfolio/PortfolioAnalyticsTracker"
import type { Portfolio } from "@/interface"

interface PublicPortfolioClientProps {
  portfolio: Portfolio
}

function getUsernameFromParams(params: ReturnType<typeof useParams>): string {
  const rawUsername = params.username
  if (Array.isArray(rawUsername)) {
    return rawUsername[0] ?? ""
  }
  return rawUsername ?? ""
}

export function PublicPortfolioClient({ portfolio }: PublicPortfolioClientProps) {
  const params = useParams()
  const username = getUsernameFromParams(params)

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return ""
    return window.location.href
  }, [])

  return (
    <>
      <FaviconUpdater profilePic={portfolio.profilePic} username={username} />
      <PortfolioAnalyticsTracker portfolioId={portfolio.id} />
      <PortfolioShareButton url={shareUrl} portfolioName={portfolio.displayName ?? undefined} />
    </>
  )
}
