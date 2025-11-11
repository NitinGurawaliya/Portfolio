import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ShiplogCard } from "@/components/shiplog/ShiplogCard"
import { useToast } from "@/hooks/use-toast"
import type { Shiplog, ShiplogReactionType } from "@/types/shiplog"

interface ShiplogTimelineResponse {
  shiplogs: Shiplog[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export function ShiplogSection() {
  const { toast } = useToast()
  const [shiplogs, setShiplogs] = useState<Shiplog[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [pendingReactions, setPendingReactions] = useState<Record<number, boolean>>({})

  const loadShiplogs = useCallback(
    async (targetPage: number, append = false) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }
      try {
        const response = await fetch(`/api/shiplogs?page=${targetPage}&limit=8`, { cache: "no-store" })

        if (response.status === 401) {
          setError("Please sign in to view your shiplog timeline.")
          setShiplogs([])
          setHasMore(false)
          return
        }

        if (!response.ok) {
          throw new Error("Unable to load your shiplog timeline.")
        }

        const data: ShiplogTimelineResponse = await response.json()
        setHasMore(data.hasMore)
        setPage(data.page)
        setShiplogs((prev) => (append ? [...prev, ...data.shiplogs] : data.shiplogs))
      } catch (err) {
        console.error("❌ Shiplog timeline fetch failed", err)
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
    void loadShiplogs(1, false)
  }, [loadShiplogs])

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
          throw new Error("Reaction could not be saved.")
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

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore) return
    const nextPage = page + 1
    void loadShiplogs(nextPage, true)
  }, [hasMore, loadingMore, loadShiplogs, page])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-foreground">My Shiplog Timeline</h2>
        <p className="text-sm text-muted-foreground">
          Review your latest build-in-public moments. To publish a new shiplog, head over to{" "}
          <Button variant="link" className="h-auto px-1 text-sm" asChild>
            <Link href="/feed/shiplog">the shiplog feed</Link>
          </Button>
          .
        </p>
      </div>

      {loading ? (
        <ShiplogTimelineSkeleton />
      ) : error ? (
        <Card className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-8 text-center">
          <p className="text-sm font-medium text-foreground">{error}</p>
          <Button variant="outline" className="rounded-full px-4 text-xs" onClick={() => loadShiplogs(1, false)}>
            Try again
          </Button>
        </Card>
      ) : shiplogs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-background/70 p-8 text-center">
          <p className="text-base font-semibold text-foreground">You haven't shared a shiplog yet.</p>
          <p className="text-sm text-muted-foreground">Visit the feed to publish your first update.</p>
          <Button asChild className="rounded-full px-4 text-xs font-semibold">
            <Link href="/feed/shiplog">Open shiplog feed</Link>
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {shiplogs.map((shiplog) => (
            <ShiplogCard
              key={shiplog.id}
              shiplog={shiplog}
              onReact={handleReaction}
              reactionPending={Boolean(pendingReactions[shiplog.id])}
            />
          ))}
          {loadingMore ? <ShiplogTimelineSkeleton count={2} /> : null}
        </div>
      )}

      {hasMore && !loading && shiplogs.length > 0 ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="rounded-full border border-border/60 px-5 text-xs font-semibold"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "View more"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function ShiplogTimelineSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="rounded-2xl border border-border/30 bg-background/70 p-5 shadow-none">
          <div className="flex items-start gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-36 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-3/4 rounded-full" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}
