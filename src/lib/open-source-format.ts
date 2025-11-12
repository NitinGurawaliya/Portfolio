import type { Difficulty } from "./open-source-repos"

const stackLabelPresets: Record<string, string> = {
  "next.js": "Next.js",
  "node.js": "Node.js",
  "tailwind": "Tailwind CSS",
  "typescript": "TypeScript",
  "javascript": "JavaScript",
  "python": "Python",
  "rust": "Rust",
  "java": "Java",
  "orm": "ORM",
  "sql": "SQL",
  "react": "React",
  "astro": "Astro",
  "frontend": "Frontend",
  "runtime": "Runtime",
  "database": "Database",
  "postcss": "PostCSS",
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "2-digit",
})

export function formatStackLabel(stack: string) {
  const normalized = stack.toLowerCase()
  if (stackLabelPresets[normalized]) {
    return stackLabelPresets[normalized]
  }

  if (normalized.includes(".")) {
    return normalized
      .split(".")
      .map((segment, index) =>
        index === normalized.split(".").length - 1
          ? segment.toUpperCase()
          : segment.charAt(0).toUpperCase() + segment.slice(1)
      )
      .join(".")
  }

  if (normalized.includes("-")) {
    return normalized
      .split("-")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ")
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export function formatLastUpdated(dateString: string) {
  const parsed = new Date(dateString)
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown"
  }
  return dateFormatter.format(parsed)
}

export function formatStars(stars: number) {
  if (stars >= 1000) {
    const short = Math.round((stars / 1000) * 10) / 10
    return `${short}k`
  }
  return stars.toString()
}

export function difficultyLabel(difficulty: Difficulty) {
  switch (difficulty) {
    case "Beginner":
      return "Beginner friendly"
    case "Intermediate":
      return "Intermediate"
    default:
      return "Advanced"
  }
}
