"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProjectIcon } from "@/components/ui/project-icon"
import { ArrowBigUp, ExternalLink, Eye, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type FeedProject = {
  id: number
  title: string
  description: string
  deployedUrl?: string | null
  githubUrl?: string | null
  favicon?: string | null
  logo?: string | null
  upvotes: number
  views: number
  hasUpvoted: boolean
  createdAt: string
  author: {
    id: number | null
    name: string
    githubUsername?: string | null
    avatarUrl?: string | null
    portfolioSlug?: string | null
  }
}

interface ProjectFeedCardProps {
  project: FeedProject
  onToggleUpvote: (projectId: number) => void
  upvoteLoading?: boolean
}

export function ProjectFeedCard({
  project,
  onToggleUpvote,
  upvoteLoading = false,
}: ProjectFeedCardProps) {
  const portfolioHref = project.author.portfolioSlug
    ? `/${project.author.portfolioSlug}`
    : undefined

  const description =
    project.description?.trim().length > 0
      ? project.description.trim()
      : "इस प्रोजेक्ट के लिए कोई विवरण उपलब्ध नहीं है।"

  return (
    <Card className="relative h-full rounded-2xl border border-border/60 bg-card/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex items-start gap-3">
          <ProjectIcon
            favicon={project.favicon || undefined}
            logo={project.logo || undefined}
            title={project.title}
            size="lg"
          />
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {project.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {new Date(project.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={project.hasUpvoted ? "default" : "outline"}
          className={cn(
            "flex items-center gap-1 rounded-full px-3",
            project.hasUpvoted
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
              : "border-border/80 text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onToggleUpvote(project.id)}
          disabled={upvoteLoading}
        >
          {upvoteLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowBigUp className={cn("h-4 w-4", project.hasUpvoted && "text-white")} />
          )}
          <span className="text-xs font-medium">{project.upvotes}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 opacity-70" />
            <span>{project.views.toLocaleString()} views</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowBigUp className="h-4 w-4 opacity-70" />
            <span>{project.upvotes.toLocaleString()} upvotes</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-6 py-4">
        {portfolioHref ? (
          <Link
            href={portfolioHref}
            className="text-xs font-medium text-foreground/90 transition hover:text-primary"
          >
            Made by {project.author.name}
          </Link>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            Made by {project.author.name}
          </span>
        )}
        <div className="flex items-center gap-2">
          {project.deployedUrl && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 rounded-full px-3 text-xs"
              asChild
            >
              <Link href={project.deployedUrl} target="_blank" rel="noopener noreferrer">
                Live <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
          {project.githubUrl && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 rounded-full px-3 text-xs"
              asChild
            >
              <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                Source <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
