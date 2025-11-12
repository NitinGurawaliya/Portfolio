"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  BookOpen,
  Filter,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  Difficulty,
  OpenSourceRepo,
  SortOption,
} from "@/lib/open-source-repos"
import { formatStackLabel } from "@/lib/open-source-format"
import { RepoCard } from "./RepoCard"

type DifficultyWithAll = Difficulty | "all"

const sortOptions: Array<{ value: SortOption; label: string; description: string }> =
  [
    { value: "stars", label: "Most stars", description: "Descending GitHub stars" },
    { value: "recent", label: "Recently active", description: "Latest commit activity" },
    { value: "difficulty", label: "Easiest first", description: "Beginner to advanced" },
  ]

function resettableDifficulty(value: DifficultyWithAll) {
  switch (value) {
    case "Beginner":
      return "Beginner"
    case "Intermediate":
      return "Intermediate"
    case "Advanced":
      return "Advanced"
    default:
      return "All levels"
  }
}

interface OpenSourceExplorerProps {
  initialRepos: OpenSourceRepo[]
  availableStacks: string[]
  availableDifficulties: Difficulty[]
  guideCount: number
  initialFilters?: {
    stacks?: string[]
    sort?: SortOption
    difficulty?: Difficulty
    search?: string
  }
}

export function OpenSourceExplorer({
  initialRepos,
  availableStacks,
  availableDifficulties,
  guideCount,
  initialFilters,
}: OpenSourceExplorerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [repos, setRepos] = useState(initialRepos)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedStacks, setSelectedStacks] = useState<string[]>(
    initialFilters?.stacks ?? []
  )
  const [sort, setSort] = useState<SortOption>(initialFilters?.sort ?? "stars")
  const [difficulty, setDifficulty] = useState<DifficultyWithAll>(
    initialFilters?.difficulty ?? "all"
  )
  const [searchValue, setSearchValue] = useState(initialFilters?.search ?? "")
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue)

  const isFirstRender = useRef(true)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue), 300)
    return () => clearTimeout(timer)
  }, [searchValue])

  const updateUrl = useCallback(
    (nextFilters?: {
      stacks?: string[]
      sort?: SortOption
      difficulty?: DifficultyWithAll
      search?: string
    }) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "")

      const stacksValue =
        nextFilters?.stacks ?? (nextFilters ? selectedStacks : selectedStacks)
      if (stacksValue.length > 0) {
        params.set("stack", stacksValue.join(","))
      } else {
        params.delete("stack")
      }

      const sortValue = nextFilters?.sort ?? sort
      if (sortValue !== "stars") {
        params.set("sort", sortValue)
      } else {
        params.delete("sort")
      }

      const difficultyValue = nextFilters?.difficulty ?? difficulty
      if (difficultyValue !== "all") {
        params.set("difficulty", difficultyValue)
      } else {
        params.delete("difficulty")
      }

      const searchValueNext = nextFilters?.search ?? debouncedSearch
      if (searchValueNext) {
        params.set("search", searchValueNext)
      } else {
        params.delete("search")
      }

      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
    [
      debouncedSearch,
      difficulty,
      pathname,
      router,
      searchParams,
      selectedStacks,
      sort,
    ]
  )

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    updateUrl()
  }, [debouncedSearch, difficulty, selectedStacks, sort, updateUrl])

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    async function fetchRepos() {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (selectedStacks.length > 0) {
        params.set("stack", selectedStacks.join(","))
      }
      if (debouncedSearch) {
        params.set("search", debouncedSearch)
      }
      if (difficulty !== "all") {
        params.set("difficulty", difficulty)
      }
      if (sort !== "stars") {
        params.set("sort", sort)
      }

      try {
        const response = await fetch(`/api/open-source?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("Failed to load repositories")
        }

        const payload = await response.json()
        if (!cancelled) {
          setRepos(payload.data)
        }
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return
        }
        if (!cancelled) {
          setError("Unable to fetch repositories right now. Please try again.")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchRepos()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [debouncedSearch, difficulty, selectedStacks, sort])

  const handleStackToggle = (stack: string) => {
    setSelectedStacks((previous) =>
      previous.includes(stack)
        ? previous.filter((item) => item !== stack)
        : [...previous, stack]
    )
  }

  const handleResetFilters = () => {
    setSelectedStacks([])
    setSort("stars")
    setDifficulty("all")
    setSearchValue("")
    setDebouncedSearch("")
    updateUrl({
      stacks: [],
      sort: "stars",
      difficulty: "all",
      search: "",
    })
  }

  const sortedStacks = useMemo(
    () =>
      availableStacks.map((stack) => ({
        value: stack,
        label: formatStackLabel(stack),
      })),
    [availableStacks]
  )

  const hasActiveFilters =
    selectedStacks.length > 0 ||
    difficulty !== "all" ||
    sort !== "stars" ||
    Boolean(debouncedSearch)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-6 text-center">
        <Badge variant="secondary" className="mx-auto gap-2 px-4 py-1.5 text-sm">
          <Sparkles className="size-4" />
          Discover Open Source Work
        </Badge>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Find the perfect open-source repo for your tech stack
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Filter by your preferred frameworks, difficulty level, and activity.
            Each card links directly to the GitHub repository, and curated guides
            help you contribute with confidence.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Filter className="size-4" />
            {availableStacks.length}+ stacks covered
          </span>
          <span className="inline-flex items-center gap-2">
            <BookOpen className="size-4" />
            {guideCount} guides live
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search repositories, keywords, or stacks..."
              className="pl-10"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="size-4" />
                  Stacks
                  {selectedStacks.length > 0 ? (
                    <Badge
                      variant="secondary"
                      className="ml-2 rounded-full px-2 py-0 text-[11px]"
                    >
                      {selectedStacks.length}
                    </Badge>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60" align="end">
                <DropdownMenuLabel>Filter by stack</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortedStacks.map((stack) => (
                  <DropdownMenuCheckboxItem
                    key={stack.value}
                    checked={selectedStacks.includes(stack.value)}
                    onCheckedChange={() => handleStackToggle(stack.value)}
                  >
                    {stack.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleResetFilters}>
                  Reset filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="size-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Sort repositories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(value) => setSort(value as SortOption)}
                >
                  {sortOptions.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <BookOpen className="size-4" />
                  {resettableDifficulty(difficulty)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuLabel>Difficulty</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={difficulty}
                  onValueChange={(value) => setDifficulty(value as DifficultyWithAll)}
                >
                  <DropdownMenuRadioItem value="all">All levels</DropdownMenuRadioItem>
                  {availableDifficulties.map((level) => (
                    <DropdownMenuRadioItem key={level} value={level}>
                      {level}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
            >
              <RefreshCcw className="size-4" />
              Reset
            </Button>
          </div>
        </div>

        {selectedStacks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedStacks.map((stack) => (
              <Badge
                key={stack}
                variant="secondary"
                className="flex items-center gap-2 rounded-full px-3 py-1 text-xs"
              >
                {formatStackLabel(stack)}
                <button
                  type="button"
                  className="hover:text-destructive transition"
                  onClick={() => handleStackToggle(stack)}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {isLoading
          ? Array.from({ length: Math.max(4, repos.length || 4) }).map((_, index) => (
              <Skeleton key={index} className="h-[22rem] rounded-xl border" />
            ))
          : null}

        {!isLoading && error ? (
          <div className="col-span-full flex flex-col items-center gap-4 rounded-2xl border bg-card/60 p-10 text-center">
            <Sparkles className="size-10 text-primary" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">कुछ गड़बड़ हो गई</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={handleResetFilters}>Retry</Button>
          </div>
        ) : null}

        {!isLoading && !error && repos.length === 0 ? (
          <div className="col-span-full flex flex-col items-center gap-4 rounded-2xl border bg-card/60 p-10 text-center">
            <Sparkles className="size-10 text-primary" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">No matching repositories yet</h2>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or exploring a different stack to discover more
                projects.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {availableStacks.slice(0, 6).map((stack) => (
                <Badge key={stack} variant="outline">
                  {formatStackLabel(stack)}
                </Badge>
              ))}
            </div>
            <Button onClick={handleResetFilters} variant="secondary">
              Reset filters
            </Button>
          </div>
        ) : null}

        {!isLoading && !error
          ? repos.map((repo) => <RepoCard key={repo.slug} repo={repo} />)
          : null}
      </section>
    </div>
  )
}
