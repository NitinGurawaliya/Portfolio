import { useEffect, useRef } from "react"
import { loadFeedCache, saveFeedCache } from "@/lib/feed-cache"

interface UseDashboardFeedPrefetchParams {
  loading: boolean
  userId?: number
  isLoadingPortfolio: boolean
  isInitialLoad: boolean
}

export function useDashboardFeedPrefetch({
  loading,
  userId,
  isLoadingPortfolio,
  isInitialLoad,
}: UseDashboardFeedPrefetchParams) {
  const feedPrefetchStartedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (loading || !userId) return
    if (isLoadingPortfolio || isInitialLoad) return
    if (feedPrefetchStartedRef.current) return

    const cached = loadFeedCache<any[]>("newest")
    if (cached && Array.isArray(cached.projects)) {
      feedPrefetchStartedRef.current = true
      return
    }

    feedPrefetchStartedRef.current = true

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/feed/projects?sort=newest`, {
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) return

        const data = await response.json()
        saveFeedCache("newest", data.projects ?? [])
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Feed prefetch failed", error)
        }
      }
    }, 1500)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [loading, userId, isLoadingPortfolio, isInitialLoad])
}
