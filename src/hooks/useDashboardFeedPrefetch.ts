import { useEffect, useRef } from "react"
import { loadFeedCache, saveFeedCache } from "@/lib/feed-cache"

type UseDashboardFeedPrefetchArgs = {
  enabled: boolean
}

export function useDashboardFeedPrefetch({ enabled }: UseDashboardFeedPrefetchArgs): void {
  const startedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!enabled) return
    if (startedRef.current) return

    const cached = loadFeedCache<any[]>("newest")
    if (cached && Array.isArray(cached.projects)) {
      startedRef.current = true
      return
    }

    startedRef.current = true

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
      } catch {
        // ignore
      }
    }, 1500)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [enabled])
}

