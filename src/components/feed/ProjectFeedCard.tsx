"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ProjectIcon } from "@/components/ui/project-icon"
import { ArrowBigUp, Check, Eye, Share2 } from "lucide-react"
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
  tags?: string[]
  author: {
    id: number | null
    name: string
    githubUsername?: string | null
    avatarUrl?: string | null
    portfolioSlug?: string | null
    verified?: boolean
  }
}

interface ProjectFeedCardProps {
  project: FeedProject
  onToggleUpvote: (projectId: number) => void
  upvotePending?: boolean
}

export function ProjectFeedCard({ project, onToggleUpvote, upvotePending = false }: ProjectFeedCardProps) {
  const portfolioHref = project.author.portfolioSlug ? `/${project.author.portfolioSlug}` : undefined

  const description =
    project.description?.trim().length > 0
      ? project.description.trim()
      : "No description has been provided for this project yet."

  return (
    <Card className="group relative mx-auto w-full max-w-xl rounded-2xl border border-border/40 bg-card/90 p-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border/20 bg-background/60 px-4 py-4 backdrop-blur-sm sm:flex-nowrap sm:px-6">
          <div className="flex flex-1 items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-muted/20">
            <ProjectIcon
              favicon={project.favicon || undefined}
              logo={project.logo || undefined}
              title={project.title}
              size="md"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-md font-semibold leading-tight text-foreground">
              {project.deployedUrl || project.githubUrl ? (
                <Link
                  href={project.deployedUrl ?? project.githubUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-orange-500"
                >
                  {project.title}
                </Link>
              ) : (
                project.title
              )}
            </h3>
          </div>
        </div>
        <button
          type="button"
          aria-label={project.hasUpvoted ? "Remove upvote" : "Upvote project"}
          onClick={() => onToggleUpvote(project.id)}
          className={cn(
            "flex h-10 min-w-[3rem] shrink-0 flex-col items-center justify-center rounded-full border border-border/50 bg-background/80 text-xs font-semibold text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm",
            project.hasUpvoted && "border-orange-500 bg-orange-500/10 text-orange-500",
            upvotePending && "opacity-70"
          )}
        >
          <ArrowBigUp className="h-3.5 w-3.5" />
          <span className="mt-0.5 leading-none text-sm">{project.upvotes.toLocaleString()}</span>
        </button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-4 pb-0 pt-4 sm:px-6">
          <p className="w-full break-words text-sm">{description}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {project.tags &&
            project.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-border/30 bg-muted/20 px-2.5 py-0.5 text-[11px] font-medium text-foreground/70"
              >
                <span className="text-foreground/60">#</span>
                {tag}
              </span>
            ))}
        </div>
      </CardContent>

      <CardFooter className="mt-0 flex flex-col gap-4 border-t border-border/15 bg-background/70 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6">
        <div className="flex items-start gap-2.5">
          <span className="font-medium text-foreground">Created by</span>
          {portfolioHref ? (
            <Link
              href={portfolioHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-semibold text-foreground transition hover:text-primary"
            >
              <span className="flex h-6 w-6 items-center ml-0 justify-center overflow-hidden rounded-full border border-border/30 bg-muted/50">
                {project.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.author.avatarUrl} alt={project.author.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {project.author.name.slice(0, 2)}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1 ml-0">
                {project.author.name}
                {project.author.verified && <Check className="h-3 w-3 text-blue-500" />}
              </span>
            </Link>
          ) : (
            <span className="flex items-center gap-2 font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-border/30 bg-muted/50">
                {project.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.author.avatarUrl} alt={project.author.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {project.author.name.slice(0, 2)}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1">
                {project.author.name}
                {project.author.verified && <Check className="h-3 w-3 text-blue-500" />}
              </span>
            </span>
          )}
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:flex-nowrap">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Eye className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{project.views}</span>
          </div>
          {(project.deployedUrl || project.githubUrl) && (
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border/40 text-muted-foreground transition hover:text-foreground"
              onClick={() => {
                const target = project.deployedUrl ?? project.githubUrl
                if (target) {
                  window.open(target, "_blank", "noopener,noreferrer")
                }
              }}
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
