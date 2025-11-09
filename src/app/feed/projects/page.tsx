"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ProjectFeedCard, FeedProject } from "@/components/feed/ProjectFeedCard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Loader2, RefreshCcw, Sparkles, Flame, ArrowUpRight } from "lucide-react"
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
  const [sort, setSort] = useState<SortOption>("newest")
  const [upvoteLoadingId, setUpvoteLoadingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async (selectedSort: SortOption, options?: { showLoading?: boolean }) => {
    if (options?.showLoading !== false) {
      setLoading(true)
    }
    setError(null)
    try {
      const response = await fetch(`/api/feed/projects?sort=${selectedSort}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || "Project feed could not be loaded.")
      }

      const data = await response.json()
      setProjects(data.projects ?? [])
      saveFeedCache(selectedSort, data.projects ?? [])
    } catch (err) {
      console.error("❌ Feed: Failed to fetch projects:", err)
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = loadFeedCache<FeedProject[]>(sort)
    let showLoading = true

    if (cached && Array.isArray(cached.projects)) {
      setProjects(cached.projects)
      setLoading(false)
      showLoading = false
    }

    fetchProjects(sort, { showLoading })
  }, [fetchProjects, sort])

  const handleSortChange = (selectedSort: SortOption) => {
    if (selectedSort === sort) return
    setSort(selectedSort)
  }

  const handleRetry = useCallback(() => {
    fetchProjects(sort)
  }, [fetchProjects, sort])

  const handleToggleUpvote = useCallback(async (projectId: number) => {
    setUpvoteLoadingId(projectId)
    try {
      const response = await fetch(`/api/feed/projects/${projectId}/upvote`, {
        method: "POST",
      })

      if (response.status === 401) {
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
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Unable to update upvote.",
      })
    } finally {
      setUpvoteLoadingId(null)
    }
  }, [toast])

  const activeSort = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0],
    [sort]
  )

  const handleRefresh = useCallback(() => {
    fetchProjects(sort)
  }, [fetchProjects, sort])

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading project feed…</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
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
      <div className="flex flex-col items-center gap-6">
        {projects.map((project) => (
          <ProjectFeedCard
            key={project.id}
            project={project}
            onToggleUpvote={handleToggleUpvote}
            upvoteLoading={upvoteLoadingId === project.id}
          />
        ))}
      </div>
    )
  }, [error, handleRetry, handleToggleUpvote, loading, projects, upvoteLoadingId])

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_55%)]" />
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-card to-muted/40 p-10 shadow-[0_18px_50px_-38px_rgba(79,70,229,0.65)]">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-16 left-12 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Community Spotlight
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Discover &amp; support standout developer projects
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Browse public portfolios across the DevFolio community. Sort projects by momentum,
              explore live demos, and upvote the builders who inspire you.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Sparkles,
                label: "Live projects",
                value: projects.length.toString().padStart(2, "0"),
              },
              {
                icon: Flame,
                label: activeSort.label,
                value: activeSort.description,
              },
              {
                icon: ArrowUpRight,
                label: "Boost visibility",
                value: "Upvote to elevate fellow makers.",
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/50 bg-background/80 p-4 text-sm text-muted-foreground"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
                    <Icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              )
            })}
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">Project feed</h2>
            <p className="text-sm text-muted-foreground">
              Choose how to explore the community showcase.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="rounded-full border border-border/60 px-3 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              <RefreshCcw className={cn("mr-2 h-3.5 w-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
            {SORT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={sort === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange(option.value)}
                aria-pressed={sort === option.value}
                className={cn(
                  "rounded-full px-4 text-xs font-semibold transition",
                  sort === option.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border-border/60 bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-5 inline-flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="border-border/60 bg-background/70 text-[11px]">
            {activeSort.description}
          </Badge>
          <Badge variant="outline" className="border-border/60 bg-background/70 text-[11px]">
            {projects.length} projects
          </Badge>
        </div>
      </section>

      {content}
    </div>
  )
}
