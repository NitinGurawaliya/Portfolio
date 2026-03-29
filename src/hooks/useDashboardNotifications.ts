import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import { UpvoteNotification } from "@/components/dashboard/UpvoteNotificationsBell"
import { playNotificationSound } from "@/lib/portfolio-utils"
import { successToastConfig } from "@/lib/utils"

type UseDashboardNotificationsResult = {
  notifications: UpvoteNotification[]
  readNotificationIds: Set<string>
  unreadCount: number
  onOpenChange: (open: boolean) => void
  markAllRead: () => void
  reload: () => Promise<void>
}

export function useDashboardNotifications(userId?: number): UseDashboardNotificationsResult {
  const [notifications, setNotifications] = useState<UpvoteNotification[]>([])
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set())
  const socketRef = useRef<WebSocket | null>(null)

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
    } catch {
      // ignore
    }
  }, [])

  const updateReadNotificationIds = useCallback(
    (updater: (prev: Set<string>) => Set<string>) => {
      setReadNotificationIds((prev) => {
        const next = updater(prev)
        if (next === prev) return prev
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              "devfolio:readUpvoteNotificationIds",
              JSON.stringify(Array.from(next))
            )
          } catch {
            // ignore
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
      const response = await fetch("/api/dashboard/upvotes/notifications", {
        cache: "no-store",
        signal,
      })

      if (!response.ok) {
        if (response.status === 401) return
        throw new Error("Failed to load upvote notifications")
      }

      const data = await response.json()
      if (!Array.isArray(data.notifications)) return

      const mapped: UpvoteNotification[] = data.notifications.map((item: any) => ({
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
        return next.size === prev.size ? prev : next
      })
    },
    [updateReadNotificationIds, userId]
  )

  const reload = useCallback(async () => {
    try {
      await loadNotificationsFromServer()
    } catch {
      // ignore; bell can still function without initial load
    }
  }, [loadNotificationsFromServer])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!userId) return

    const controller = new AbortController()
    loadNotificationsFromServer(controller.signal).catch(() => {
      // ignore
    })
    return () => controller.abort()
  }, [loadNotificationsFromServer, userId])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!userId) return

    if (socketRef.current) {
      try {
        socketRef.current.close()
      } catch {
        // ignore
      }
      socketRef.current = null
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const socket = new WebSocket(`${protocol}://${window.location.host}/api/notifications/stream`)
    socketRef.current = socket

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
          notification.actor?.githubUsername || notification.actor?.name || "Someone"

        toast.success(`${actorDisplay} upvoted “${notification.projectName}”!`, successToastConfig)
      } catch {
        // ignore
      }
    })

    socket.addEventListener("close", () => {
      if (heartbeat) clearInterval(heartbeat)
    })

    socket.addEventListener("error", () => {
      // ignore
    })

    return () => {
      if (heartbeat) clearInterval(heartbeat)
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        try {
          socket.close()
        } catch {
          // ignore
        }
      }
      if (socketRef.current === socket) {
        socketRef.current = null
      }
    }
  }, [userId])

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) return
      void reload()
    },
    [reload]
  )

  const markAllRead = useCallback(() => {
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

  const unreadCount = useMemo(() => {
    return notifications.reduce((count, notification) => {
      return count + (readNotificationIds.has(notification.id) ? 0 : 1)
    }, 0)
  }, [notifications, readNotificationIds])

  return { notifications, readNotificationIds, unreadCount, onOpenChange, markAllRead, reload }
}

