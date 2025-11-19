"use client"

import { useEffect, useState } from "react"
import { WallOfFameClient } from "./wall-of-fame-client"
import { CommunityPortfolio } from "@/lib/services/wall-of-fame"

export function WallOfFame() {
  const [portfolios, setPortfolios] = useState<CommunityPortfolio[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await fetch("/api/landing/wall-of-fame")
        if (res.ok) {
          const data = await res.json()
          setPortfolios(data.portfolios || [])
        } else {
          setError("Failed to load portfolios")
        }
      } catch (err) {
        console.error("WallOfFame: failed to load portfolios", err)
        setError("Failed to load portfolios")
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolios()
  }, [])

  return <WallOfFameClient portfolios={portfolios} loading={loading} error={error} />
}
