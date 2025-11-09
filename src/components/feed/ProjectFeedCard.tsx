"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ProjectIcon } from "@/components/ui/project-icon"
import { ArrowBigUp, Check, Eye, Loader2, Share2 } from "lucide-react"
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
  upvoteLoading?: boolean
}

export function ProjectFeedCard({ project, onToggleUpvote, upvoteLoading = false }: ProjectFeedCardProps) {
  const portfolioHref = project.author.portfolioSlug ? `/${project.author.portfolioSlug}` : undefined

  const description =
    project.description?.trim().length > 0
      ? project.description.trim()
      : "No description has been provided for this project yet."

  return (
    <Card className="group relative mx-auto flex h-full w-full max-w-3xl min-h-[240px] flex-col overflow-hidden rounded-2xl border border-border/20 bg-card/90 shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-all duration-200">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex flex-1 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/40">
            <ProjectIcon
              favicon={project.favicon || undefined}
              logo={project.logo || undefined}
              title={project.title}
              size="md"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold leading-tight text-foreground">
              {project.deployedUrl || project.githubUrl ? (
                <Link
                  href={project.deployedUrl ?? project.githubUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-primary"
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
           disabled={upvoteLoading}
           className={cn(
             "flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-border/30 bg-background text-[11px] font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40",
             project.hasUpvoted && "border-primary/40 bg-primary/10 text-primary",
             upvoteLoading && "cursor-wait opacity-80"
           )}
         >
           {upvoteLoading ? (
             <Loader2 className="h-3.5 w-3.5 animate-spin" />
           ) : (
             <ArrowBigUp className="h-3.5 w-3.5" />
           )}
           <span className="mt-0.5 leading-none">{project.upvotes.toLocaleString()}</span>
         </button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-5 pb-0">
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="flex flex-wrap items-center gap-2">
          {project.tags &&
            project.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-border/30 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground"
              >
                <span className="text-foreground/60">#</span>
                {tag}
              </span>
            ))}
        </div>
      </CardContent>

      <CardFooter className="mt-4 flex items-center justify-between border-t border-border/10 bg-background/40 px-5 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Made by</span>
          {portfolioHref ? (
            <Link
              href={portfolioHref}
              className="flex items-center gap-2 font-semibold text-foreground transition hover:text-primary"
            >
              <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-muted/60">
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
                {project.author.verified && <Check className="h-3.5 w-3.5 text-blue-500" />}
              </span>
            </Link>
          ) : (
            <span className="flex items-center gap-2 font-semibold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-muted/60">
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
                {project.author.verified && <Check className="h-3.5 w-3.5 text-blue-500" />}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span className="font-medium">{project.views}</span>
          </div>
          {(project.deployedUrl || project.githubUrl) && (
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center text-muted-foreground transition hover:text-foreground"
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
