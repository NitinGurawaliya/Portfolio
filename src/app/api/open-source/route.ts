import { NextResponse } from "next/server"

import {
  availableDifficulties,
  availableStacks,
  queryOpenSourceRepos,
  type Difficulty,
  type SortOption,
} from "@/lib/open-source-repos"

const SORT_OPTIONS: SortOption[] = ["stars", "recent", "difficulty"]

function parseStacks(searchParams: URLSearchParams) {
  const rawStacks = searchParams.getAll("stack")
  if (rawStacks.length === 0) {
    const singular = searchParams.get("stacks")
    if (singular) {
      rawStacks.push(singular)
    }
  }

  return rawStacks
    .flatMap((entry) => entry.split(","))
    .map((stack) => stack.trim().toLowerCase())
    .filter(Boolean)
}

function parseSort(searchParams: URLSearchParams): SortOption {
  const input = searchParams.get("sort")?.toLowerCase()
  const match = SORT_OPTIONS.find((option) => option === input)
  return match ?? "stars"
}

function parseDifficulty(searchParams: URLSearchParams): Difficulty | undefined {
  const input = searchParams.get("difficulty")
  if (!input) {
    return undefined
  }

  const normalized = input.trim().toLowerCase()
  const match = availableDifficulties.find(
    (difficulty) => difficulty.toLowerCase() === normalized
  )

  return match
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const stacks = parseStacks(url.searchParams)
  const sort = parseSort(url.searchParams)
  const search = url.searchParams.get("search") ?? undefined
  const difficulty = parseDifficulty(url.searchParams)

  const results = queryOpenSourceRepos({
    stacks,
    search,
    sort,
    difficulty,
  })

  return NextResponse.json({
    data: results,
    meta: {
      total: results.length,
      sort,
      stacks,
      difficulty: difficulty ?? null,
      availableStacks,
      availableDifficulties,
    },
  })
}
