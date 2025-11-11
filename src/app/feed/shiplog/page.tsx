"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ShiplogCard } from "@/components/shiplog/ShiplogCard"
import { ShiplogComposerDialog } from "@/components/shiplog/ShiplogComposerDialog"
import type { Shiplog, ShiplogReactionType } from "@/types/shiplog"

interface ShiplogFeedResponse {
  shiplogs: Shiplog[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
  mode: "network" | "global"
}

export default function ShiplogFeedPage() {
  const { toast } = useToast()
  const [shiplogs, setShiplogs] = useState<Shiplog[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [mode, setMode] = useState<"network" | "global">("network")
  const [error, setError] = useState<string | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [pendingReactions, setPendingReactions] = useState<Record<number, boolean>>({})
  const [pendingFollows, setPendingFollows] = useState<Record<number, boolean>>({})

  const fetchShiplogs = useCallback(
    async (targetPage: number, append = false) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }
      try {
        const response = await fetch(`/api/shiplogs/feed?page=${targetPage}&limit=10`, { cache: "no-store" })

        if (response.status === 401) {
          setError("Please sign in to view the shiplog feed.")
          setShiplogs([])
          setHasMore(false)
          return
        }

        if (!response.ok) {
          throw new Error("Unable to load the shiplog feed.")
        }

        const data: ShiplogFeedResponse = await response.json()
        setMode(data.mode)
        setHasMore(data.hasMore)
        setPage(data.page)

        setShiplogs((prev) => {
          if (append) {
            const merged = [...prev]
            data.shiplogs.forEach((incoming) => {
              if (!merged.some((existing) => existing.id === incoming.id)) {
                merged.push(incoming)
              }
            })
            return merged
          }
          return data.shiplogs
        })
      } catch (err) {
        console.error("❌ Shiplog feed fetch failed", err)
        setError(err instanceof Error ? err.message : "Something went wrong.")
      } finally {
        if (append) {
          setLoadingMore(false)
        } else {
          setLoading(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    void fetchShiplogs(1, false)
  }, [fetchShiplogs])

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore) return
    const nextPage = page + 1
    void fetchShiplogs(nextPage, true)
  }, [fetchShiplogs, hasMore, loadingMore, page])

  const handleReaction = useCallback(
    async (shiplogId: number, reactionType: ShiplogReactionType) => {
      if (pendingReactions[shiplogId]) return
      setPendingReactions((prev) => ({ ...prev, [shiplogId]: true }))
      try {
        const response = await fetch(`/api/shiplogs/${shiplogId}/react`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: reactionType }),
        })

        if (response.status === 401) {
          toast({
            title: "Sign in required",
            description: "Log in to leave a reaction.",
          })
          return
        }

        if (!response.ok) {
          throw new Error("Unable to update reaction.")
        }

        const data = await response.json()
        setShiplogs((prev) =>
          prev.map((item) =>
            item.id === shiplogId
              ? {
                  ...item,
                  viewerReaction: data.viewerReaction,
                  reactions: {
                    shipped: data.reactions.shipped,
                    fixed: data.reactions.fixed,
                    support: data.reactions.support,
                  },
                }
              : item
          )
        )
      } catch (err) {
        console.error("❌ Shiplog reaction failed", err)
        toast({
          title: "Something went wrong",
          description: err instanceof Error ? err.message : "Reaction could not be saved.",
        })
      } finally {
        setPendingReactions((prev) => {
          const next = { ...prev }
          delete next[shiplogId]
          return next
        })
      }
    },
    [pendingReactions, toast]
  )

  const handleFollowToggle = useCallback(
    async (authorId: number, shouldFollow: boolean) => {
      if (pendingFollows[authorId]) return
      setPendingFollows((prev) => ({ ...prev, [authorId]: true }))
      try {
        const response = await fetch(`/api/users/${authorId}/follow`, {
          method: shouldFollow ? "POST" : "DELETE",
        })

        if (response.status === 401) {
          toast({
            title: "Sign in required",
            description: "Log in to follow creators.",
          })
          return
        }

        if (!response.ok) {
          throw new Error("Unable to update follow status.")
        }

        setShiplogs((prev) =>
          prev.map((item) =>
            item.author.id === authorId
              ? {
                  ...item,
                  isAuthorFollowed: shouldFollow,
                }
              : item
          )
        )
      } catch (err) {
        console.error("❌ Follow toggle failed", err)
        toast({
          title: "Something went wrong",
          description: err instanceof Error ? err.message : "Follow status could not be updated.",
        })
      } finally {
        setPendingFollows((prev) => {
          const next = { ...prev }
          delete next[authorId]
          return next
        })
      }
    },
    [pendingFollows, toast]
  )

  const handleShiplogCreated = useCallback((shiplog: Shiplog) => {
    setShiplogs((prev) => [shiplog, ...prev])
  }, [])

  const showEmptyState = !loading && shiplogs.length === 0

  const infoBanner = useMemo(() => {
    if (mode !== "global") return null
    return (
      <Card className="rounded-xl border border-dashed border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        You're seeing the global stream. Follow builders to prioritize their updates here.
      </Card>
    )
  }, [mode])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 text-left">
            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">Shiplog Feed</h1>
            <p className="text-sm text-muted-foreground">
              Catch the freshest progress updates and cheer on fellow builders.
            </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="default"
            className="rounded-full px-4 text-xs font-semibold"
          >
            <Link href="/feed/shiplog">Shiplogs</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full px-4 text-xs font-semibold"
          >
            <Link href="/feed/projects">Projects</Link>
          </Button>
          <Button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="ml-auto rounded-full bg-foreground px-4 text-xs font-semibold text-background hover:bg-foreground/90"
          >
            Create shiplog
          </Button>
        </div>
        {infoBanner}
      </div>

      {loading ? (
        <ShiplogFeedSkeleton />
      ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/60 bg-muted/30 p-8 text-center">
            <p className="text-base font-medium text-foreground">{error}</p>
            <Button variant="outline" className="rounded-full px-4 text-sm" onClick={() => fetchShiplogs(1, false)}>
              Try again
            </Button>
        </div>
      ) : showEmptyState ? (
          <Card className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-background/60 p-10 text-center shadow-none">
            <p className="text-lg font-semibold text-foreground">No shiplogs yet.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Share your first update to let the community know what you're building.
            </p>
            <Button onClick={() => setComposerOpen(true)} className="rounded-full px-5 text-sm font-semibold">
              Post an update
            </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {shiplogs.map((shiplog) => (
            <ShiplogCard
              key={shiplog.id}
              shiplog={shiplog}
              onReact={handleReaction}
              onToggleFollow={!shiplog.isAuthorSelf && shiplog.author.id ? handleFollowToggle : undefined}
              reactionPending={Boolean(pendingReactions[shiplog.id])}
              followPending={shiplog.author.id ? Boolean(pendingFollows[shiplog.author.id]) : false}
              showFollowButton={!shiplog.isAuthorSelf}
            />
          ))}
          {loadingMore ? <ShiplogFeedSkeleton count={2} /> : null}
        </div>
      )}

      {hasMore && !loading && !loadingMore && shiplogs.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="rounded-full border border-border/60 px-6 text-sm font-semibold"
            onClick={handleLoadMore}
            disabled={loadingMore}
            >
              Load more
          </Button>
        </div>
      )}

      <ShiplogComposerDialog open={composerOpen} onOpenChange={setComposerOpen} onCreated={handleShiplogCreated} />
    </div>
  )
}

function ShiplogFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="w-full rounded-2xl border border-border/30 bg-background/70 p-5 shadow-none">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-4/5 rounded-full" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}
