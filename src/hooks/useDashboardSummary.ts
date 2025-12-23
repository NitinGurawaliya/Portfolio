import { useCallback, useEffect, useRef, useState } from "react"

export type DashboardSummaryProject = {
  projectId: number
  projectName: string
  recentUpvotes: number
  totalUpvotes: number
}

type UseDashboardSummaryArgs = {
  enabled: boolean
}

type UseDashboardSummaryResult = {
  open: boolean
  setOpen: (open: boolean) => void
  projects: DashboardSummaryProject[]
  sinceLabel: string | null
  dismiss: () => void
}

export function useDashboardSummary({ enabled }: UseDashboardSummaryArgs): UseDashboardSummaryResult {
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<DashboardSummaryProject[]>([])
  const [sinceLabel, setSinceLabel] = useState<string | null>(null)
  const fetchTriggeredRef = useRef(false)

  useEffect(() => {
    fetchTriggeredRef.current = false
  }, [enabled])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!enabled) return
    if (fetchTriggeredRef.current) return

    fetchTriggeredRef.current = true

    const controller = new AbortController()

    const fetchSummary = async () => {
      try {
        const summarySeen = localStorage.getItem("devfolio:lastUpvoteSummarySeenAt")
        const notificationsSeen = localStorage.getItem("devfolio:lastUpvoteNotificationSeenAt")
        const params = new URLSearchParams()

        let sinceCandidate: string | null = summarySeen || null
        if (notificationsSeen) {
          if (!sinceCandidate) {
            sinceCandidate = notificationsSeen
          } else {
            const notifDate = new Date(notificationsSeen)
            const summaryDate = new Date(sinceCandidate)
            if (!Number.isNaN(notifDate.getTime()) && notifDate > summaryDate) {
              sinceCandidate = notificationsSeen
            }
          }
        }

        if (sinceCandidate) {
          params.set("since", sinceCandidate)
        }
        const query = params.toString()
        const response = await fetch(`/api/dashboard/upvotes/summary${query ? `?${query}` : ""}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) return

        const data = await response.json()
        if (controller.signal.aborted) return

        if (Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects)
          setOpen(true)

          if (data.since) {
            try {
              const date = new Date(data.since)
              if (!Number.isNaN(date.getTime())) {
                setSinceLabel(
                  date.toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                )
              } else {
                setSinceLabel(null)
              }
            } catch {
              setSinceLabel(null)
            }
          } else {
            setSinceLabel(null)
          }
        }
      } catch {
        // ignore
      }
    }

    void fetchSummary()

    return () => controller.abort()
  }, [enabled])

  const dismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("devfolio:lastUpvoteSummarySeenAt", new Date().toISOString())
    }
    setOpen(false)
    setProjects([])
    setSinceLabel(null)
  }, [])

  return {
    open,
    setOpen,
    projects,
    sinceLabel,
    dismiss,
  }
}

