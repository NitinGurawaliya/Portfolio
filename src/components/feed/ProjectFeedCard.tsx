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
    <Card className="group relative mx-auto w-full max-w-xl gap-0 rounded-xl   p-0 border-1 border-gray-200 shadow-none transition-colors duration-150">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pb-3 pt-5">
        <div className="flex flex-1 items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/30 bg-muted/30">
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
            "flex h-10 border-2 border-black rounded-md w-10 shrink-0 flex-col items-center justify-center rounded-md border border-border/40 bg-background text-sm font-semibold text-muted-foreground transition focus:outline-none focus:ring-2",
            project.hasUpvoted && "border-orange-500 bg-orange-500/10 text-orange-500",
            upvotePending && "opacity-70"
          )}
        >
          <ArrowBigUp className="h-3.5 w-3.5" />
          <span className="mt-0.5 leading-none text-sm">{project.upvotes.toLocaleString()}</span>
        </button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 mt-2 px-6 pb-0">
        <p className="w-full text-sm  break-words">{description}</p>
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

      <CardFooter className="mt-0 flex items-center justify-between border-t border-border/15 bg-background/80 px-6 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2.5">
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Eye className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{project.views}</span>
          </div>
          {(project.deployedUrl || project.githubUrl) && (
            <button
              type="button"
              className="flex h-6 w-6 border border-gray-300 rounded-md items-center justify-center text-muted-foreground transition hover:text-foreground"
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
