import { Metadata } from "next"

import {
  availableDifficulties,
  availableStacks,
  openSourceRepos,
  queryOpenSourceRepos,
  type Difficulty,
  type SortOption,
} from "@/lib/open-source-repos"
import { OpenSourceExplorer } from "@/components/open-source/OpenSourceExplorer"

export const metadata: Metadata = {
  title: "Open Source Explorer | DevFolio",
  description:
    "Discover active open-source repositories tailored to your tech stack. Filter by difficulty, stack, and activity to find your next contribution.",
}

function toArray(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : value.split(",")
}

function parseSort(value: string | string[] | undefined): SortOption {
  const input = Array.isArray(value) ? value[0] : value
  if (!input) return "stars"
  const normalized = input.toLowerCase()
  return normalized === "recent" || normalized === "difficulty" ? normalized : "stars"
}

function parseDifficulty(
  value: string | string[] | undefined
): Difficulty | undefined {
  const input = Array.isArray(value) ? value[0] : value
  if (!input) {
    return undefined
  }

  const normalized = input.trim().toLowerCase()
  return availableDifficulties.find(
    (difficulty) => difficulty.toLowerCase() === normalized
  )
}

export default function OpenSourcePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const stacks = toArray(searchParams.stack).map((entry) => entry.toLowerCase())
  const sort = parseSort(searchParams.sort)
  const difficulty = parseDifficulty(searchParams.difficulty)
  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined

  const initialRepos = queryOpenSourceRepos({
    stacks,
    sort,
    difficulty,
    search,
  })

  return (
    <OpenSourceExplorer
      initialRepos={initialRepos}
      availableStacks={availableStacks}
      availableDifficulties={availableDifficulties}
      guideCount={openSourceRepos.filter((repo) => Boolean(repo.guide)).length}
      initialFilters={{
        stacks,
        sort,
        difficulty,
        search,
      }}
    />
  )
}
