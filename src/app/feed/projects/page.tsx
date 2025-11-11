"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ProjectFeedCard, FeedProject } from "@/components/feed/ProjectFeedCard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ArrowUp, RefreshCcw, Sparkles } from "lucide-react"
import { loadFeedCache, saveFeedCache } from "@/lib/feed-cache"

type SortOption = "newest" | "most_upvoted" | "most_viewed"

const SORT_OPTIONS: Array<{ value: SortOption; label: string; description: string }> = [
  {
    value: "newest",
    label: "Newest",
    description: "Freshly published community projects.",
  },
  {
    value: "most_upvoted",
    label: "Most Upvoted",
    description: "Projects the community is buzzing about.",
  },
  {
    value: "most_viewed",
    label: "Most Viewed",
    description: "Portfolio highlights getting the most attention.",
  },
]

export default function ProjectFeedPage() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<FeedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [sort, setSort] = useState<SortOption>("newest")
  const [pendingUpvotes, setPendingUpvotes] = useState<Record<number, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const arrangeProjects = useCallback(
    (list: FeedProject[]) => {
      const keyFor = (project: FeedProject) =>
        project.author.portfolioSlug || project.author.id?.toString() || project.author.githubUsername || project.author.name

      const metricValue = (project: FeedProject) => {
        if (sort === "most_viewed") return project.views
        if (sort === "most_upvoted") return project.upvotes
        return new Date(project.createdAt).getTime()
      }

      const result = [...list]

      for (let i = 1; i < result.length; i += 1) {
        const current = result[i]
        const previous = result[i - 1]
        const currentKey = keyFor(current)
        const prevKey = keyFor(previous)
        const currentMetric = metricValue(current)
        const prevMetric = metricValue(previous)

        const metricsTied = currentMetric === prevMetric

        if (currentKey && prevKey && currentKey === prevKey && metricsTied) {
          let swapIndex = i + 1

          while (swapIndex < result.length) {
            const candidate = result[swapIndex]
            if (keyFor(candidate) !== currentKey && metricValue(candidate) === currentMetric) {
              break
            }
            swapIndex += 1
          }

          if (swapIndex < result.length) {
            const [candidate] = result.splice(swapIndex, 1)
            result.splice(i, 0, candidate)
          }
        }
      }

      return result
    },
    [sort]
  )

  const fetchProjects = useCallback(
    async (
      selectedSort: SortOption,
      options?: { page?: number; append?: boolean; showLoading?: boolean }
    ) => {
      const targetPage = options?.page ?? 1
      const shouldAppend = options?.append ?? false

      if (shouldAppend) {
        setLoadingMore(true)
      } else if (options?.showLoading !== false) {
        setIsSwitching(true)
        setLoading(true)
      }

      setError(null)
      try {
        const response = await fetch(`/api/feed/projects?sort=${selectedSort}&page=${targetPage}&limit=10`, {
          cache: "no-store",
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data?.error || "Project feed could not be loaded.")
        }

        const data = await response.json()
        const incomingProjects: FeedProject[] = data.projects ?? []

        setProjects((prev) => {
          if (shouldAppend) {
            return arrangeProjects([...prev, ...incomingProjects])
          }
          return arrangeProjects(incomingProjects)
        })
        setPage(data.page ?? targetPage)
        setHasMore(Boolean(data.hasMore))

        if (!shouldAppend) {
          saveFeedCache(selectedSort, {
            items: incomingProjects,
            hasMore: Boolean(data.hasMore),
          })
        }
      } catch (err) {
        console.error("❌ Feed: Failed to fetch projects:", err)
        setError(err instanceof Error ? err.message : "Something went wrong.")
      } finally {
        if (shouldAppend) {
          setLoadingMore(false)
        } else {
          setLoading(false)
          setIsSwitching(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    const cached = loadFeedCache<{ items: FeedProject[]; hasMore: boolean }>(sort)
    let showLoading = true

    if (cached && cached.projects && Array.isArray(cached.projects.items)) {
      setProjects(arrangeProjects(cached.projects.items))
      setHasMore(Boolean(cached.projects.hasMore))
      setLoading(false)
      setPage(1)
      showLoading = false
    }

    fetchProjects(sort, { showLoading })
  }, [arrangeProjects, fetchProjects, sort])

  const handleSortChange = (selectedSort: SortOption) => {
    if (selectedSort === sort) return
    setSort(selectedSort)
    setPage(1)
    setHasMore(true)
  }

  const handleRetry = useCallback(() => {
    fetchProjects(sort)
  }, [fetchProjects, sort])

  const handleToggleUpvote = useCallback(async (projectId: number) => {
    if (pendingUpvotes[projectId]) return

    const targetProject = projects.find((project) => project.id === projectId)
    if (!targetProject) return

    const previousHasUpvoted = targetProject.hasUpvoted
    const previousUpvotes = targetProject.upvotes

    setPendingUpvotes((prev) => ({ ...prev, [projectId]: true }))

    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              hasUpvoted: !previousHasUpvoted,
              upvotes: Math.max(0, previousUpvotes + (previousHasUpvoted ? -1 : 1)),
            }
          : project
      )
    )

    try {
      const response = await fetch(`/api/feed/projects/${projectId}/upvote`, {
        method: "POST",
      })

      if (response.status === 401) {
        setProjects((prev) =>
          prev.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  hasUpvoted: previousHasUpvoted,
                  upvotes: previousUpvotes,
                }
              : project
          )
        )
        toast({
          title: "Please log in first",
          description: "You need to be logged in to upvote.",
        })
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to update upvote.")
      }

      const data = await response.json()

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...project,
                hasUpvoted: data.upvoted,
                upvotes: data.totalUpvotes,
              }
            : project
        )
      )
    } catch (err) {
      console.error("❌ Feed: Failed to toggle upvote:", err)
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...project,
                hasUpvoted: previousHasUpvoted,
                upvotes: previousUpvotes,
              }
            : project
        )
      )
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Unable to update upvote.",
      })
    } finally {
      setPendingUpvotes((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [projectId]: _removed, ...rest } = prev
        return rest
      })
    }
  }, [pendingUpvotes, projects, toast])

  const activeSort = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0],
    [sort]
  )

  const feedHeadline = useMemo(() => {
    switch (sort) {
      case "most_upvoted":
        return {
          title: "Most liked projects",
          subtitle: "Community favourites bubbling to the top right now.",
        }
      case "most_viewed":
        return {
          title: "Most popular projects",
          subtitle: "Standout builds getting the most attention across DevFolio.",
        }
      case "newest":
      default:
        return {
          title: "Latest projects",
          subtitle: "Fresh drops from creators you can support right away.",
        }
    }
  }, [sort])

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore) return
    const nextPage = page + 1
    fetchProjects(sort, { page: nextPage, append: true, showLoading: false })
  }, [fetchProjects, hasMore, loadingMore, page, sort])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 320)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const content = useMemo(() => {
    if ((loading && projects.length === 0) || isSwitching) {
      return <FeedSkeletonList />
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <p className="text-base font-medium text-foreground">{error}</p>
          <Button onClick={handleRetry} className="rounded-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      )
    }

    if (projects.length === 0) {
      return (
        <Card className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/60 py-16 text-center">
          <p className="text-lg font-medium text-foreground">No projects yet.</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Publish your portfolio and add projects so the community can discover and upvote them.
          </p>
          <Button asChild className="rounded-full px-6">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </Card>
      )
    }

    return (
      <div className="flex flex-col items-center gap-4">
        {projects.map((project) => (
          <ProjectFeedCard
            key={project.id}
            project={project}
            onToggleUpvote={handleToggleUpvote}
            upvotePending={Boolean(pendingUpvotes[project.id])}
          />
        ))}
        {loadingMore && <FeedSkeletonList count={2} />}
      </div>
    )
  }, [error, handleRetry, handleToggleUpvote, isSwitching, loading, loadingMore, pendingUpvotes, projects])

    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 px-4 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <header className="flex flex-col gap-2 text-left">
            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">Discover DevFolio Projects</h1>
        </header>

          <section className="flex flex-col gap-3 rounded-2xl border border-border/30 bg-background/80 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
            {SORT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={sort === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange(option.value)}
                disabled={isSwitching}
                aria-pressed={sort === option.value}
                className={cn(
                    "w-full rounded-full px-4 text-xs font-semibold transition sm:w-auto",
                  sort === option.value
                    ? "bg-foreground text-background"
                    : "border border-border/40 bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>
            <p className="text-xs text-muted-foreground">
            {isSwitching ? "Updating…" : `${projects.length} shown · Page ${page}`}
          </p>
        </section>

          <div className="flex flex-col gap-1 text-left">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">{feedHeadline.title}</h2>
          <p className="text-sm text-muted-foreground">{feedHeadline.subtitle}</p>
        </div>
      </div>

      {content}

      {hasMore && !error && projects.length > 0 && !isSwitching && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rounded-full border border-border/60 px-6 text-sm font-semibold"
          >
            {loadingMore ? "Loading..." : "Load more projects"}
          </Button>
        </div>
      )}

      {showScrollTop && (
        <button
          type="button"
          onClick={handleScrollTop}
          className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/85 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur transition hover:border-gray-300 hover:text-gray-900"
        >
          <ArrowUp className="h-3.5 w-3.5" />
          Top
        </button>
      )}
    </div>
  )
}

function FeedSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="mx-auto w-full max-w-2xl gap-0 rounded-xl border border-border/25 bg-background/70 p-0 shadow-none">
            <div className="flex items-start justify-between px-4 pb-4 pt-5 sm:px-6">
            <div className="flex flex-1 items-start gap-3.5">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-48 rounded-full" />
                <Skeleton className="h-3 w-64 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-12 rounded-md" />
          </div>
            <div className="space-y-2 px-4 pb-4 sm:px-6">
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-5/6 rounded-full" />
          </div>
            <div className="flex items-center justify-between border-t border-border/25 px-4 py-3 sm:px-6">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}
