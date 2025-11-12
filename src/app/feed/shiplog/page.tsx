"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ShiplogCard } from "@/components/shiplog/ShiplogCard"
import { ShiplogComposerDialog } from "@/components/shiplog/ShiplogComposerDialog"
import { FeedBrandMark } from "@/components/feed/FeedBrandMark"
import { FeedTopNav } from "@/components/feed/FeedTopNav"
import type { Shiplog, ShiplogReactionType } from "@/types/shiplog"
import { useSession } from "@/hooks/useSession"
import { PenSquare, FolderOpen } from "lucide-react"

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
  const { user: sessionUser, loading: sessionLoading } = useSession()
  const isAuthenticated = Boolean(sessionUser)

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


  return (
    <>
      <FeedTopNav />
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-8 px-4 pb-12 pt-10 sm:px-6 sm:pt-12 lg:h-[calc(100vh-3rem)] lg:grid-cols-[240px_minmax(0,1fr)_320px] lg:items-start lg:gap-10 lg:overflow-hidden lg:pb-10 lg:pt-6">
        <aside className="sticky top-24 hidden h-fit lg:block lg:w-[240px] lg:top-6 xl:w-[260px]">
         
          <Card className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-background p-6">
          <FeedBrandMark />
            <nav className="space-y-3 text-sm font-semibold text-muted-foreground">
              <Link
                href="/feed/shiplog"
                className="group mt-1 flex items-center gap-3 rounded-2xl border border-border/70 bg-foreground px-4 py-3 text-background"
              >
                <PenSquare className="h-4 w-4" />
                Shiplogs
              </Link>
              <Link
                href="/feed/projects"
                className="group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 hover:border-border/70 hover:bg-muted/40"
              >
                <FolderOpen className="h-4 w-4 text-foreground" />
                <span className="text-foreground">Projects</span>
              </Link>
            </nav>
          </Card>
        </aside>

        <div className="flex flex-col gap-10 lg:col-start-2 lg:mx-auto lg:h-full lg:w-full lg:max-w-3xl lg:overflow-y-auto lg:pr-2 lg:scroll-smooth lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col gap-3 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Shiplog Feed</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Catch the freshest progress updates and cheer on fellow builders.
            </p>
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
            <div className="space-y-6">
              {shiplogs.map((shiplog) => (
                <div key={shiplog.id} className="w-full max-w-3xl self-center">
                  <ShiplogCard
                    shiplog={shiplog}
                    onReact={handleReaction}
                    onToggleFollow={!shiplog.isAuthorSelf && shiplog.author.id ? handleFollowToggle : undefined}
                    reactionPending={Boolean(pendingReactions[shiplog.id])}
                    followPending={shiplog.author.id ? Boolean(pendingFollows[shiplog.author.id]) : false}
                    showFollowButton={!shiplog.isAuthorSelf}
                  />
                </div>
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

        <div className="sticky top-24 hidden space-y-4 lg:col-start-3 lg:block lg:w-[320px] lg:top-6 xl:w-[340px]">
          <Card className="rounded-2xl border border-border/60 bg-muted/20 p-5">
            <h2 className="text-sm font-semibold text-foreground">Share a shiplog update</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Keep everyone in the loop with your latest progress. Post a shiplog to document what you shipped or fixed.
            </p>
            <Button
              className="mt-4 w-full rounded-full"
              onClick={() => setComposerOpen(true)}
            >
              Post an update
            </Button>
          </Card>
        </div>
      </div>
    </>
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
