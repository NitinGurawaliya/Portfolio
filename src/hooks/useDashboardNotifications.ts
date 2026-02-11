import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import type { UpvoteNotification } from "@/components/dashboard/UpvoteNotificationsBell"
import { playNotificationSound } from "@/lib/portfolio-utils"
import { successToastConfig } from "@/lib/utils"

export interface DashboardSummaryProject {
  projectId: number
  projectName: string
  recentUpvotes: number
  totalUpvotes: number
}

interface UseDashboardNotificationsParams {
  userId?: number
  loading: boolean
}

interface NotificationApiItem {
  id: string | number
  projectId: number
  projectName: string
  totalUpvotes: number
  createdAt: string
  actor?: {
    id: number
    name: string | null
    githubUsername: string | null
    avatarUrl: string | null
  } | null
}

export function useDashboardNotifications({
  userId,
  loading,
}: UseDashboardNotificationsParams) {
  const [notifications, setNotifications] = useState<UpvoteNotification[]>([])
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set())
  const notificationSocketRef = useRef<WebSocket | null>(null)
  const summaryFetchTriggeredRef = useRef(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summaryProjects, setSummaryProjects] = useState<DashboardSummaryProject[]>([])
  const [summarySinceLabel, setSummarySinceLabel] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem("devfolio:readUpvoteNotificationIds")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setReadNotificationIds(new Set(parsed.map(String)))
        }
      }
    } catch (error) {
      console.error("🔔 Failed to restore read upvote notifications:", error)
    }
  }, [])

  const updateReadNotificationIds = useCallback(
    (updater: (prev: Set<string>) => Set<string>) => {
      setReadNotificationIds((prev) => {
        const next = updater(prev)
        if (next === prev) {
          return prev
        }
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              "devfolio:readUpvoteNotificationIds",
              JSON.stringify(Array.from(next))
            )
          } catch (error) {
            console.error("🔔 Failed to persist read upvote notifications:", error)
          }
        }
        return next
      })
    },
    []
  )

  const loadNotificationsFromServer = useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) return
      try {
        const response = await fetch("/api/dashboard/upvotes/notifications", {
          cache: "no-store",
          signal,
        })

        if (!response.ok) {
          if (response.status === 401) {
            return
          }
          throw new Error("Failed to load upvote notifications")
        }

        const data = await response.json()
        if (!Array.isArray(data.notifications)) {
          return
        }

        const mapped: UpvoteNotification[] = (data.notifications as NotificationApiItem[]).map((item) => ({
          id: String(item.id),
          projectId: item.projectId,
          projectName: item.projectName,
          totalUpvotes: item.totalUpvotes,
          createdAt: item.createdAt,
          actor: item.actor
            ? {
                id: item.actor.id,
                name: item.actor.name,
                githubUsername: item.actor.githubUsername,
                avatarUrl: item.actor.avatarUrl,
              }
            : undefined,
        }))

        setNotifications(mapped)

        updateReadNotificationIds((prev) => {
          const availableIds = new Set(mapped.map((item) => item.id))
          const next = new Set([...prev].filter((id) => availableIds.has(id)))
          if (next.size === prev.size) {
            return prev
          }
          return next
        })
      } catch (error) {
        if (signal?.aborted) {
          return
        }
        console.error("🔔 Failed to load upvote notifications:", error)
      }
    },
    [updateReadNotificationIds, userId]
  )

  useEffect(() => {
    summaryFetchTriggeredRef.current = false
  }, [userId])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (loading || !userId) return

    const controller = new AbortController()
    void loadNotificationsFromServer(controller.signal)

    return () => controller.abort()
  }, [loading, userId, loadNotificationsFromServer])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!userId) return

    if (notificationSocketRef.current) {
      try {
        notificationSocketRef.current.close()
      } catch (closeError) {
        console.error("🔔 Failed to close existing notification socket:", closeError)
      }
      notificationSocketRef.current = null
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const socket = new WebSocket(`${protocol}://${window.location.host}/api/notifications/stream`)
    notificationSocketRef.current = socket

    let heartbeat: ReturnType<typeof setInterval> | null = null

    socket.addEventListener("open", () => {
      heartbeat = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("ping")
        }
      }, 30000)
    })

    socket.addEventListener("message", async (event) => {
      try {
        if (event.data === "pong") return
        const payload =
          typeof event.data === "string"
            ? event.data
            : typeof Blob !== "undefined" && event.data instanceof Blob
              ? await event.data.text()
              : null

        if (!payload) return

        const parsed = JSON.parse(payload)
        if (parsed?.type !== "project-upvote" || !parsed.data) return

        const notification: UpvoteNotification = {
          id: String(parsed.data.notificationId),
          projectId: parsed.data.projectId,
          projectName: parsed.data.projectName,
          totalUpvotes: parsed.data.totalUpvotes,
          createdAt: parsed.data.createdAt,
          actor: parsed.data.actor,
        }

        setNotifications((prev) => {
          const filtered = prev.filter((item) => item.id !== notification.id)
          const next = [notification, ...filtered]
          return next.slice(0, 25)
        })

        playNotificationSound()

        const actorDisplay =
          notification.actor?.githubUsername ||
          notification.actor?.name ||
          "Someone"

        toast.success(
          `${actorDisplay} upvoted “${notification.projectName}”!`,
          successToastConfig
        )
      } catch (messageError) {
        console.error("🔔 Failed to process upvote websocket message:", messageError)
      }
    })

    socket.addEventListener("close", () => {
      if (heartbeat) {
        clearInterval(heartbeat)
      }
    })

    socket.addEventListener("error", (event) => {
      console.error("🔔 Upvote websocket error:", event)
    })

    return () => {
      if (heartbeat) {
        clearInterval(heartbeat)
      }
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        try {
          socket.close()
        } catch (closeError) {
          console.error("🔔 Failed to close notification socket:", closeError)
        }
      }
      if (notificationSocketRef.current === socket) {
        notificationSocketRef.current = null
      }
    }
  }, [userId])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (loading || !userId) return
    if (summaryFetchTriggeredRef.current) return

    summaryFetchTriggeredRef.current = true

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
        const response = await fetch(
          `/api/dashboard/upvotes/summary${query ? `?${query}` : ""}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        )
        if (!response.ok) return

        const data = await response.json()
        if (controller.signal.aborted) return

        if (Array.isArray(data.projects) && data.projects.length > 0) {
          setSummaryProjects(data.projects)
          setSummaryOpen(true)

          if (data.since) {
            try {
              const date = new Date(data.since)
              if (!Number.isNaN(date.getTime())) {
                setSummarySinceLabel(
                  date.toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                )
              } else {
                setSummarySinceLabel(null)
              }
            } catch {
              setSummarySinceLabel(null)
            }
          } else {
            setSummarySinceLabel(null)
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("🔔 Failed to load upvote summary:", error)
        }
      }
    }

    void fetchSummary()

    return () => {
      controller.abort()
    }
  }, [loading, userId])

  const handleNotificationsOpenChange = useCallback(
    (open: boolean) => {
      if (!open) return
      void loadNotificationsFromServer()
    },
    [loadNotificationsFromServer]
  )

  const handleMarkAllNotificationsRead = useCallback(() => {
    if (notifications.length === 0) return
    updateReadNotificationIds((prev) => {
      const next = new Set(prev)
      notifications.forEach((notification) => next.add(notification.id))
      return next
    })
    if (typeof window !== "undefined") {
      localStorage.setItem("devfolio:lastUpvoteNotificationSeenAt", new Date().toISOString())
    }
  }, [notifications, updateReadNotificationIds])

  const dismissSummary = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("devfolio:lastUpvoteSummarySeenAt", new Date().toISOString())
    }
    setSummaryOpen(false)
    setSummaryProjects([])
    setSummarySinceLabel(null)
  }, [])

  const unreadNotificationCount = useMemo(() => {
    return notifications.reduce((count, notification) => {
      return count + (readNotificationIds.has(notification.id) ? 0 : 1)
    }, 0)
  }, [notifications, readNotificationIds])

  return {
    notifications,
    unreadNotificationCount,
    readNotificationIds: Array.from(readNotificationIds),
    summaryOpen,
    summaryProjects,
    summarySinceLabel,
    handleNotificationsOpenChange,
    handleMarkAllNotificationsRead,
    dismissSummary,
  }
}
