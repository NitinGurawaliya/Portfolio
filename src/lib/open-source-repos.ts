export type Difficulty = "Beginner" | "Intermediate" | "Advanced"

export type SortOption = "stars" | "recent" | "difficulty"

export interface GuideResource {
  title: string
  url: string
  description?: string
}

export interface GuideStep {
  title: string
  description: string
  actionItems?: string[]
}

export interface OpenSourceGuide {
  summary: string
  estimatedTime: string
  prerequisites: string[]
  steps: GuideStep[]
  resources: GuideResource[]
  firstIssueUrl?: string
}

export interface OpenSourceRepo {
  slug: string
  name: string
  description: string
  repoUrl: string
  websiteUrl?: string
  stacks: string[]
  tags: string[]
  stars: number
  lastUpdated: string
  difficulty: Difficulty
  highlight?: string
  guide?: OpenSourceGuide
}

const difficultyOrder: Record<Difficulty, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
}

export const openSourceRepos: OpenSourceRepo[] = [
  {
    slug: "facebook-react",
    name: "facebook/react",
    description:
      "Declarative, component-based JavaScript library for building user interfaces.",
    repoUrl: "https://github.com/facebook/react",
    websiteUrl: "https://react.dev",
    stacks: ["react", "typescript", "javascript"],
    tags: ["frontend", "ui", "library"],
    stars: 235000,
    lastUpdated: "2025-10-20",
    difficulty: "Intermediate",
    highlight: "Great for developers who want to learn the internals of React or work on documentation and DevTools.",
    guide: {
      summary:
        "Contribute to React by improving documentation, reproducing issues, or working on DX tooling.",
      estimatedTime: "6-8 hours",
      prerequisites: [
        "Comfortable with React fundamentals and hooks",
        "Node.js and pnpm installed locally",
        "Familiarity with writing accessible documentation",
      ],
      steps: [
        {
          title: "Bootstrap the repository",
          description:
            "Fork the repo, clone it locally, and install dependencies to run React locally.",
          actionItems: [
            "Fork https://github.com/facebook/react",
            "Clone your fork and run `corepack enable && pnpm install`",
            "Start the documentation dev server with `pnpm dev`",
          ],
        },
        {
          title: "Pick an issue",
          description:
            "Filter for `good first issue` or `help wanted` labels that align with your skills.",
          actionItems: [
            "Browse issues: https://github.com/facebook/react/labels/good%20first%20issue",
            "Comment to get assigned before starting work",
            "Sync with maintainers on expected approach",
          ],
        },
        {
          title: "Submit your PR",
          description:
            "Follow the repo contribution checklist and run tests before raising the PR.",
          actionItems: [
            "Run `pnpm test --filter react-dom-server` (or relevant package)",
            "Write clear PR description referencing the issue",
            "Expect a maintainer review within a few days",
          ],
        },
      ],
      resources: [
        {
          title: "React Contributing Guide",
          url: "https://react.dev/learn/how-to-contribute",
        },
        {
          title: "React Issue Tracker",
          url: "https://github.com/facebook/react/issues",
        },
        {
          title: "React Discord Server",
          url: "https://discord.gg/reactiflux",
          description: "Ask maintainers for guidance in #contributing channels.",
        },
      ],
      firstIssueUrl:
        "https://github.com/facebook/react/labels/good%20first%20issue",
    },
  },
  {
    slug: "vercel-nextjs",
    name: "vercel/next.js",
    description:
      "The React framework for production—hybrid static & server rendering, TypeScript, smart bundling, and more.",
    repoUrl: "https://github.com/vercel/next.js",
    websiteUrl: "https://nextjs.org",
    stacks: ["next.js", "react", "typescript"],
    tags: ["frontend", "fullstack", "framework"],
    stars: 124000,
    lastUpdated: "2025-11-01",
    difficulty: "Intermediate",
    highlight:
      "Ideal if you're interested in working on App Router, performance tooling, or documentation.",
    guide: {
      summary:
        "Work on Next.js enhancements, documentation fixes, or integration examples.",
      estimatedTime: "5-7 hours",
      prerequisites: [
        "Experience with Next.js App Router",
        "Understanding of Node.js and pnpm workspace tooling",
        "Ability to write concise documentation",
      ],
      steps: [
        {
          title: "Install dependencies",
          description:
            "Set up the Next.js monorepo and run the integration test suites.",
          actionItems: [
            "Fork https://github.com/vercel/next.js",
            "Clone locally and run `pnpm install`",
            "Run `pnpm dev` to bootstrap playground apps",
          ],
        },
        {
          title: "Identify contribution area",
          description:
            "Use the discussion board and `good first issue` label to find approachable issues.",
          actionItems: [
            "Check https://github.com/vercel/next.js/discussions for roadmap",
            "Search issues by scope: App Router, TurboPack, SWC, Docs",
            "Leave a comment describing your approach before coding",
          ],
        },
        {
          title: "Implement and validate",
          description:
            "Write your fix, add tests or examples, and validate via the examples directory.",
          actionItems: [
            "Add or update tests in `test/` or `packages/next/src`",
            "Run `pnpm lint && pnpm test --filter next`",
            "Record the impact in the PR template",
          ],
        },
      ],
      resources: [
        {
          title: "Next.js Contributing Docs",
          url: "https://github.com/vercel/next.js/blob/canary/contributing.md",
        },
        {
          title: "Next.js RFCs",
          url: "https://github.com/vercel/next.js/discussions/categories/rfcs",
        },
        {
          title: "Good First Issues",
          url: "https://github.com/vercel/next.js/contribute",
        },
      ],
      firstIssueUrl: "https://github.com/vercel/next.js/contribute",
    },
  },
  {
    slug: "tailwindlabs-tailwindcss",
    name: "tailwindlabs/tailwindcss",
    description:
      "Utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.",
    repoUrl: "https://github.com/tailwindlabs/tailwindcss",
    websiteUrl: "https://tailwindcss.com",
    stacks: ["tailwind", "postcss", "javascript"],
    tags: ["frontend", "css", "design-system"],
    stars: 76000,
    lastUpdated: "2025-10-10",
    difficulty: "Beginner",
    highlight:
      "Perfect for developers who enjoy improving documentation, plugins, or core utilities.",
  },
  {
    slug: "prisma-prisma",
    name: "prisma/prisma",
    description:
      "Next-generation Node.js and TypeScript ORM with type safety and migrations.",
    repoUrl: "https://github.com/prisma/prisma",
    websiteUrl: "https://www.prisma.io",
    stacks: ["typescript", "orm", "database"],
    tags: ["backend", "orm", "database"],
    stars: 36000,
    lastUpdated: "2025-09-28",
    difficulty: "Intermediate",
    highlight:
      "Great for TypeScript developers comfortable with database tooling and schema migrations.",
    guide: {
      summary:
        "Contribute to Prisma by improving client features, fixing bug reports, or enhancing documentation.",
      estimatedTime: "4-6 hours",
      prerequisites: [
        "Experience with TypeScript and Node.js",
        "Understanding of relational databases and Prisma schema",
        "Docker installed for database integration tests",
      ],
      steps: [
        {
          title: "Prepare the repository",
          description:
            "Fork, clone, and set up the development containers for integration tests.",
          actionItems: [
            "Fork https://github.com/prisma/prisma",
            "Clone and run `pnpm install`",
            "Start docker services: `pnpm run docker:dev`",
          ],
        },
        {
          title: "Choose a scoped issue",
          description:
            "Look for issues tagged `good first issue` or `topic:client` that align with your interests.",
          actionItems: [
            "Browse `good first issue` label",
            "Comment with your plan and wait for approval",
            "Review CONTRIBUTING.md for coding standards",
          ],
        },
        {
          title: "Develop and validate",
          description:
            "Make the change, add tests, and ensure the Prisma Client builds successfully.",
          actionItems: [
            "Implement your fix in `packages/client` or relevant package",
            "Add regression tests under `packages/client/src/__tests__`",
            "Run `pnpm lint && pnpm test` before pushing",
          ],
        },
      ],
      resources: [
        {
          title: "Prisma Contributing Guide",
          url: "https://github.com/prisma/prisma/blob/main/CONTRIBUTING.md",
        },
        {
          title: "Prisma Issues",
          url: "https://github.com/prisma/prisma/issues",
        },
        {
          title: "Prisma Slack Community",
          url: "https://slack.prisma.io",
        },
      ],
      firstIssueUrl:
        "https://github.com/prisma/prisma/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22",
    },
  },
  {
    slug: "apache-superset",
    name: "apache/superset",
    description:
      "Modern data exploration and visualization platform built on Apache, supporting rich dashboards.",
    repoUrl: "https://github.com/apache/superset",
    websiteUrl: "https://superset.apache.org",
    stacks: ["python", "sql", "react"],
    tags: ["data-viz", "analytics", "dashboard"],
    stars: 60000,
    lastUpdated: "2025-10-29",
    difficulty: "Advanced",
    highlight:
      "Best suited for full-stack engineers comfortable with Python, React, and SQL-based analytics.",
  },
  {
    slug: "denoland-deno",
    name: "denoland/deno",
    description:
      "A modern runtime for JavaScript and TypeScript built on V8, Rust, and Tokio.",
    repoUrl: "https://github.com/denoland/deno",
    websiteUrl: "https://deno.com",
    stacks: ["rust", "typescript", "runtime"],
    tags: ["runtime", "tooling", "cli"],
    stars: 95000,
    lastUpdated: "2025-10-31",
    difficulty: "Advanced",
    highlight:
      "Great for systems programmers wanting to work on runtime features, tooling, or documentation.",
  },
  {
    slug: "withastro-astro",
    name: "withastro/astro",
    description:
      "All-in-one web framework for content-focused sites, featuring a hybrid island architecture.",
    repoUrl: "https://github.com/withastro/astro",
    websiteUrl: "https://astro.build",
    stacks: ["astro", "typescript", "frontend"],
    tags: ["frontend", "static-site", "ssg"],
    stars: 45000,
    lastUpdated: "2025-10-05",
    difficulty: "Beginner",
    highlight:
      "Friendly contributor experience focused on docs, integrations, and content collections.",
  },
  {
    slug: "open-metadata-openmetadata",
    name: "open-metadata/OpenMetadata",
    description:
      "Unified metadata platform with data discovery, quality, and lineage features.",
    repoUrl: "https://github.com/open-metadata/OpenMetadata",
    websiteUrl: "https://open-metadata.org",
    stacks: ["java", "python", "react"],
    tags: ["data", "governance", "metadata"],
    stars: 20000,
    lastUpdated: "2025-09-15",
    difficulty: "Intermediate",
    highlight:
      "Suited for backend or data engineers exploring metadata ingestion connectors.",
  },
]

export const availableStacks = Array.from(
  new Set(openSourceRepos.flatMap((repo) => repo.stacks))
).sort((a, b) => a.localeCompare(b))

export const availableDifficulties: Difficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
]

export interface QueryParams {
  stacks?: string[]
  search?: string
  sort?: SortOption
  difficulty?: Difficulty
}

export function queryOpenSourceRepos({
  stacks = [],
  search,
  sort = "stars",
  difficulty,
}: QueryParams = {}) {
  const normalizedStacks = stacks
    .map((stack) => stack.trim().toLowerCase())
    .filter(Boolean)

  const normalizedSearch = search?.trim().toLowerCase() ?? ""

  let results = openSourceRepos.filter((repo) => {
    const matchesStack =
      normalizedStacks.length === 0 ||
      normalizedStacks.some((stack) => repo.stacks.includes(stack))

    const matchesDifficulty =
      !difficulty || repo.difficulty.toLowerCase() === difficulty.toLowerCase()

    const matchesSearch =
      normalizedSearch.length === 0 ||
      repo.name.toLowerCase().includes(normalizedSearch) ||
      repo.description.toLowerCase().includes(normalizedSearch) ||
      repo.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch)) ||
      repo.stacks.some((stack) => stack.toLowerCase().includes(normalizedSearch))

    return matchesStack && matchesDifficulty && matchesSearch
  })

  results = [...results].sort((a, b) => {
    if (sort === "recent") {
      return (
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      )
    }

    if (sort === "difficulty") {
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
    }

    return b.stars - a.stars
  })

  return results
}

export function getRepoBySlug(slug: string) {
  return openSourceRepos.find((repo) => repo.slug === slug)
}

export function getGuideBySlug(slug: string) {
  const repo = getRepoBySlug(slug)
  if (!repo?.guide) {
    return undefined
  }

  return {
    repo,
    guide: repo.guide,
  }
}
