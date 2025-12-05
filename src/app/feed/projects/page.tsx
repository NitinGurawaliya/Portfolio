"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ProjectFeedCard, FeedProject } from "@/components/feed/ProjectFeedCard"
import { FeedBrandMark } from "@/components/feed/FeedBrandMark"
import { FeedTopNav } from "@/components/feed/FeedTopNav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "@/hooks/useSession"
import { cn } from "@/lib/utils"
import { ArrowUp, RefreshCcw, Sparkles, PenSquare, FolderOpen, Users as UsersIcon } from "lucide-react"
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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const fetchControllerRef = useRef<AbortController | null>(null)
  const prefetchedSortsRef = useRef<Record<SortOption, boolean>>({ newest: false, most_upvoted: false, most_viewed: false })
  const { user: sessionUser, loading: sessionLoading } = useSession()
  const isAuthenticated = Boolean(sessionUser)
 

  const arrangeProjects = useCallback(
    (list: FeedProject[], modeSort?: SortOption) => {
      const activeSort = modeSort ?? sort
      const keyFor = (project: FeedProject) =>
        project.author.portfolioSlug || project.author.id?.toString() || project.author.githubUsername || project.author.name

      const metricValue = (project: FeedProject) => {
        if (activeSort === "most_viewed") return project.views
        if (activeSort === "most_upvoted") return project.upvotes
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
      options?: { page?: number; append?: boolean; showLoading?: boolean; prefetch?: boolean }
    ) => {
      let wasAborted = false
      const targetPage = options?.page ?? 1
      const shouldAppend = options?.append ?? false
      const isPrefetch = options?.prefetch ?? false

      if (shouldAppend) {
        setLoadingMore(true)
      } else if (!isPrefetch && options?.showLoading !== false) {
        setIsSwitching(true)
        setLoading(true)
      }

      setError(null)
      try {
        if (fetchControllerRef.current && !shouldAppend && !isPrefetch) {
          fetchControllerRef.current.abort()
        }
        const controller = new AbortController()
        fetchControllerRef.current = controller

        const response = await fetch(`/api/feed/projects?sort=${selectedSort}&page=${targetPage}&limit=10`, {
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data?.error || "Project feed could not be loaded.")
        }

        const data = await response.json()
        const incomingProjects: FeedProject[] = data.projects ?? []

        const arranged = arrangeProjects(incomingProjects, selectedSort)

        if (!isPrefetch) {
          setProjects((prev) => {
            if (shouldAppend) {
              return arrangeProjects([...prev, ...incomingProjects], selectedSort)
            }
            return arranged
          })
          setPage(data.page ?? targetPage)
          setHasMore(Boolean(data.hasMore))
        }

        saveFeedCache(selectedSort, {
          items: arranged,
          hasMore: Boolean(data.hasMore),
        })

        if (!isPrefetch) {
          prefetchedSortsRef.current[selectedSort] = true
        }
      } catch (err) {
        const isAbortError =
          (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError") ||
          ((err as { name?: string } | null) && (err as { name?: string }).name === "AbortError")

        if (isAbortError) {
          console.info("ℹ️ Feed: Request aborted due to a newer fetch, ignoring.")
          wasAborted = true
          return
        }

        console.error("❌ Feed: Failed to fetch projects:", err)
        setError(err instanceof Error ? err.message : "Something went wrong.")
      } finally {
        if (wasAborted) {
          return
        }

        if (shouldAppend) {
          setLoadingMore(false)
        } else if (!isPrefetch) {
          setLoading(false)
          setIsSwitching(false)
        }
      }
    },
    [arrangeProjects]
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
        setShowLoginPrompt(true)
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

  // const feedHeadline = useMemo(() => {
  //   switch (sort) {
  //     case "most_upvoted":
  //       return {
  //         title: "Most liked projects",
  //         subtitle: "Community favourites bubbling to the top right now.",
  //       }
  //     case "most_viewed":
  //       return {
  //         title: "Most popular projects",
  //         subtitle: "Standout builds getting the most attention across DevFolio.",
  //       }
  //     case "newest":
  //     default:
  //       return {
  //         title: "Latest projects",
  //         subtitle: "Fresh drops from creators you can support right away.",
  //       }
  //   }
  // }, [sort])

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore) return
    const nextPage = page + 1
    fetchProjects(sort, { page: nextPage, append: true, showLoading: false })
  }, [fetchProjects, hasMore, loadingMore, page, sort])

  useEffect(() => {
    if (projects.length === 0 || isSwitching) return

    SORT_OPTIONS.forEach((option) => {
      if (option.value === sort) return
      if (prefetchedSortsRef.current[option.value]) return
      prefetchedSortsRef.current[option.value] = true
      fetchProjects(option.value, { showLoading: false, prefetch: true }).catch(() => {
        prefetchedSortsRef.current[option.value] = false
      })
    })
  }, [fetchProjects, projects.length, sort, isSwitching])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 320)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isAuthenticated && showLoginPrompt) {
      setShowLoginPrompt(false)
    }
  }, [isAuthenticated, showLoginPrompt])

  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const content = useMemo(() => {
    if (loading && projects.length === 0) {
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
      <div className="relative flex flex-col gap-4 sm:gap-3">
        {projects.map((project) => (
          <div key={project.id} className="w-full self-center">
            <ProjectFeedCard
              project={project}
              onToggleUpvote={handleToggleUpvote}
              upvotePending={Boolean(pendingUpvotes[project.id])}
            />
          </div>
        ))}
        {loadingMore && <FeedSkeletonList count={2} />}
        {isSwitching && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-sm" />
        )}
      </div>
    )
  }, [error, handleRetry, handleToggleUpvote, isSwitching, loading, loadingMore, pendingUpvotes, projects])

  return (
    <>
      <FeedTopNav />
      <div className="mx-auto grid min-h-screen w-full max-w-4xl grid-cols-1 gap-6 px-3 pb-10 pt-8 sm:px-4 sm:pt-10 lg:h-[calc(100vh-3rem)] lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-8 lg:overflow-hidden lg:pb-8 lg:pt-5">
        <aside className="sticky top-24 hidden h-fit lg:block lg:w-[240px] lg:top-6 xl:w-[260px]">
          <Card className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-background p-6">
          <FeedBrandMark />
            <nav className="space-y-3 text-sm font-semibold text-muted-foreground">
            <Link
              href="/feed/shiplog"
              className="group flex items-center mt-2 gap-3 rounded-2xl border border-transparent px-4 py-3 hover:border-border/70 hover:bg-muted/40"
            >
              <PenSquare className="h-4 w-4 text-foreground" />
              <span className="text-foreground">Shiplogs</span>
            </Link>
            <Link
              href="/feed/projects"
              className="group flex mt-1 items-center gap-3 rounded-2xl border border-border/70 bg-foreground px-4 py-3 text-background"
            >
              <FolderOpen className="h-4 w-4" />
              Projects
            </Link>
            <Link
              href="/feed/users"
              className="group flex mt-1 items-center gap-3 rounded-2xl border border-transparent px-4 py-3 hover:border-border/70 hover:bg-muted/40"
            >
              <UsersIcon className="h-4 w-4 text-foreground" />
              <span className="text-foreground">Users</span>
            </Link>
          </nav>
        </Card>
        </aside>

        <div className="flex flex-col gap-5 lg:col-start-2 lg:mx-auto lg:h-full lg:w-full lg:max-w-4xl lg:overflow-y-auto lg:pr-2 lg:scroll-smooth lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col gap-3 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Discover DevFolio Projects</h1>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-6">
            <section className="space-y-3 rounded-2xl border border-border/30 bg-background/80 p-4 sm:p-5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
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
                      "min-w-[80px] flex-shrink-0 rounded-full border border-gray-200 px-4 text-xs font-semibold transition",
                      sort === option.value
                        ? "border-foreground bg-foreground text-background"
                        : "border border-gray-200 bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              {/* <div className="flex flex-col gap-1 text-left">
                <h2 className="text-lg font-semibold text-foreground sm:text-xl">{feedHeadline.title}</h2>
                <p className="text-sm text-muted-foreground">{feedHeadline.subtitle}</p>
              </div> */}
            </section>

            {!isAuthenticated && showLoginPrompt ? (
              <Card className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-semibold">Log in to upvote projects</span>
                </div>
                <p>Sign in to cheer on other builders and save your favourite projects.</p>
                <Button asChild className="mt-2 self-start rounded-full px-4 text-xs font-semibold">
                  <Link href="/auth?redirect=/feed/projects">Log in to upvote</Link>
                </Button>
              </Card>
            ) : null}

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
          </div>
        </div>
        </div>

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
    </>
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
