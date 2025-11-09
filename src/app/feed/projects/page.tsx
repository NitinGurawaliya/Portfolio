"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ProjectFeedCard, FeedProject } from "@/components/feed/ProjectFeedCard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Loader2, RefreshCcw } from "lucide-react"

type SortOption = "newest" | "most_upvoted" | "most_viewed"

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "नवीनतम" },
  { value: "most_upvoted", label: "सबसे ज़्यादा वोट" },
  { value: "most_viewed", label: "सबसे ज़्यादा व्यू" },
]

export default function ProjectFeedPage() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<FeedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortOption>("newest")
  const [upvoteLoadingId, setUpvoteLoadingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async (selectedSort: SortOption) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/feed/projects?sort=${selectedSort}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || "प्रोजेक्ट फ़ीड लोड नहीं हो पाई।")
      }

      const data = await response.json()
      setProjects(data.projects ?? [])
    } catch (err) {
      console.error("❌ Feed: Failed to fetch projects:", err)
      setError(err instanceof Error ? err.message : "कुछ गड़बड़ हो गया।")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects(sort)
  }, [fetchProjects, sort])

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(event.target.value as SortOption)
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
          title: "कृपया पहले लॉगिन करें",
          description: "अपवोट करने के लिए लॉगिन आवश्यक है।",
        })
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || "अपवोट अपडेट नहीं हो पाया।")
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
        title: "कुछ गड़बड़ हो गया",
        description: err instanceof Error ? err.message : "अपवोट नहीं हो पाया।",
      })
    } finally {
      setUpvoteLoadingId(null)
    }
  }, [toast])

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            प्रोजेक्ट फ़ीड लोड हो रही है...
          </p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-base font-medium text-foreground">{error}</p>
          <Button onClick={handleRetry} className="rounded-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            पुनः प्रयास करें
          </Button>
        </div>
      )
    }

    if (projects.length === 0) {
      return (
        <Card className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/60 py-16 text-center">
          <p className="text-lg font-medium text-foreground">
            अभी तक कोई प्रोजेक्ट नहीं जोड़ा गया है।
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            अपना पोर्टफोलियो पब्लिश करें और प्रोजेक्ट जोड़ें, ताकि कम्युनिटी उन्हें देख सके और
            अपवोट कर सके।
          </p>
          <Button asChild className="rounded-full px-6">
            <Link href="/dashboard">डैशबोर्ड पर जाएँ</Link>
          </Button>
        </Card>
      )
    }

    return (
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-gradient-to-br from-muted/80 via-background to-background/90 p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            कम्युनिटी प्रोजेक्ट फ़ीड
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            सभी यूज़र्स द्वारा जोड़े गए प्रोजेक्ट्स को explore करें, अपवोट करें और प्रेरणा लें।
            आप व्यूज़ या अपवोट्स के हिसाब से भी सॉर्ट कर सकते हैं।
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="feed-sort" className="text-sm font-medium text-muted-foreground">
            Sort
          </label>
          <div className="relative">
            <select
              id="feed-sort"
              value={sort}
              onChange={handleSortChange}
              className={cn(
                "appearance-none rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              )}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground">
              ▾
            </span>
          </div>
        </div>
      </header>

      {content}
    </div>
  )
}
