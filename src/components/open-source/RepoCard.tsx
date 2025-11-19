import Link from "next/link"
import { BookOpen, Clock, ExternalLink, Star, Target } from "lucide-react"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type OpenSourceRepo } from "@/lib/open-source-repos"
import {
  formatLastUpdated,
  formatStackLabel,
  formatStars,
  difficultyLabel,
} from "@/lib/open-source-format"

const difficultyVariant: Record<
  OpenSourceRepo["difficulty"],
  { badge: "default" | "secondary" | "outline"; label: string }
> = {
  Beginner: { badge: "secondary", label: difficultyLabel("Beginner") },
  Intermediate: { badge: "default", label: difficultyLabel("Intermediate") },
  Advanced: { badge: "outline", label: difficultyLabel("Advanced") },
}

export interface RepoCardProps {
  repo: OpenSourceRepo
}

export function RepoCard({ repo }: RepoCardProps) {
  const difficulty = difficultyVariant[repo.difficulty]

  return (
    <Card className="h-full">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <Link
                href={repo.repoUrl}
                className="hover:text-primary flex items-center gap-2"
                target="_blank"
                rel="noreferrer"
              >
                {repo.name}
                <ExternalLink className="size-4" />
              </Link>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Updated {formatLastUpdated(repo.lastUpdated)}
            </CardDescription>
          </div>
          <Badge variant={difficulty.badge}>{difficulty.label}</Badge>
        </div>
        {repo.highlight ? (
          <div className="bg-muted text-muted-foreground/90 ring-muted-foreground/10 rounded-lg px-4 py-3 text-sm ring-1">
            {repo.highlight}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm leading-6 text-muted-foreground">{repo.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium">
            <Star className="size-4 text-amber-500" />
            {formatStars(repo.stars)} stars
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-4" />
            Last activity {formatLastUpdated(repo.lastUpdated)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Target className="size-4" />
            Focus {repo.tags.slice(0, 2).join(", ")}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {repo.stacks.map((stack) => (
            <Badge
              key={stack}
              variant="outline"
              className="rounded-full px-3 py-1 text-xs font-medium"
            >
              {formatStackLabel(stack)}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {repo.websiteUrl ? (
            <Link
              href={repo.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary underline"
            >
              Project site
            </Link>
          ) : (
            <span>Open source project</span>
          )}
        </div>
        <div className="flex flex-1 flex-wrap justify-end gap-2 sm:flex-none">
          <Button variant="outline" asChild>
            <Link href={repo.repoUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              View Repo
            </Link>
          </Button>
          <Button variant={repo.guide ? "default" : "outline"} asChild={Boolean(repo.guide)} disabled={!repo.guide}>
            {repo.guide ? (
              <Link href={`/opensource/${repo.slug}/guide`}>
                <BookOpen className="size-4" />
                View Guide
              </Link>
            ) : (
              <span className="flex items-center gap-2">
                <BookOpen className="size-4" />
                Guide coming soon
              </span>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
