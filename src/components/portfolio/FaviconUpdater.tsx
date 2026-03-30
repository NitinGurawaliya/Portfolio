"use client"

import { useEffect, useRef } from "react"
import { buildPortfolioFaviconUrl, replaceDocumentFavicons } from "@/lib/portfolio/favicon-utils"

interface FaviconUpdaterProps {
  profilePic?: string | null
  username: string
}

export function FaviconUpdater({ profilePic, username }: FaviconUpdaterProps) {
  const updatedProfilePicRef = useRef<string | null>(null)

  useEffect(() => {
    if (!profilePic || typeof window === "undefined") return
    if (updatedProfilePicRef.current === profilePic) return
    if (!profilePic.startsWith("http")) return

    const faviconUrl = buildPortfolioFaviconUrl({
      baseUrl: window.location.origin,
      profilePic,
      username,
      includeTimestamp: true,
    })

    updatedProfilePicRef.current = profilePic
    replaceDocumentFavicons(faviconUrl)

    const previousTitle = document.title
    document.title = " "
    window.setTimeout(() => {
      document.title = previousTitle
    }, 10)
  }, [profilePic, username])

  return null
}
