"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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
  projectSlug?: string | null
}

interface ProjectFeedCardProps {
  project: FeedProject
  onToggleUpvote: (projectId: number) => void
  upvotePending?: boolean
}

export function ProjectFeedCard({ project, onToggleUpvote, upvotePending = false }: ProjectFeedCardProps) {
  const router = useRouter()
  const projectHref =
    project.author.portfolioSlug && project.projectSlug
      ? `/${project.author.portfolioSlug}/${project.projectSlug}`
      : null
  const portfolioHref = project.author.portfolioSlug ? `/${project.author.portfolioSlug}` : undefined
  const description = project.description?.trim() ?? ""

  const isInteractiveElement = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false
    return Boolean(target.closest("button, a"))
  }

  const handleNavigate = () => {
    if (!projectHref) return
    router.push(projectHref)
  }

  return (
    <div
      className={cn(
        "group relative w-full rounded-xl border border-gray-200 bg-card/90 p-2 text-card-foreground sm:px-6 sm:py-6",
        projectHref && "cursor-pointer transition hover:border-gray-300 hover:bg-card"
      )}
      role={projectHref ? "button" : undefined}
      tabIndex={projectHref ? 0 : undefined}
      onClick={(event) => {
        if (projectHref && !isInteractiveElement(event.target)) {
          handleNavigate()
        }
      }}
      onKeyDown={(event) => {
        if (!projectHref || isInteractiveElement(event.target)) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          handleNavigate()
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/40 sm:h-9 sm:w-9">
            <ProjectIcon
              favicon={project.favicon || undefined}
              logo={project.logo || undefined}
              title={project.title}
              size="sm"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-[12px] font-bold leading-tight text-foreground transition sm:text-base">
              {project.title}
            </h3>
          </div>
        </div>
        <button
          type="button"
          aria-label={project.hasUpvoted ? "Remove upvote" : "Upvote project"}
          onClick={(event) => {
            event.stopPropagation()
            onToggleUpvote(project.id)
          }}
          className={cn(
            "flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-md border border-border/40 bg-background/70 text-[11px] font-semibold text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-9 sm:w-9 sm:text-xs",
            project.hasUpvoted && "border-orange-500 bg-orange-500/10 text-orange-500",
            upvotePending && "opacity-70"
          )}
        >
          <ArrowBigUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="mt-0.5 leading-none">{project.upvotes.toLocaleString()}</span>
        </button>
      </div>

      {description && (
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground sm:text-[14.5px]">{description}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-muted-foreground sm:text-xs">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <span className="text-foreground font-medium"> Creator</span>
          {portfolioHref ? (
            <Link
              href={portfolioHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="flex items-center gap-2 font-semibold text-foreground transition hover:text-primary"
            >
              <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-border/30 bg-muted/50 sm:h-7 sm:w-7">
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
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-border/30 bg-muted/50 sm:h-7 sm:w-7">
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
        <div className="flex items-center gap-2 text-gray-500 sm:gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-500 sm:text-[13px]">
            <Eye className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{project.views}</span>
          </div>
          {(project.deployedUrl || project.githubUrl) && (
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 text-muted-foreground transition hover:text-foreground sm:h-7 sm:w-7"
                onClick={(event) => {
                  event.stopPropagation()
                const target = project.deployedUrl ?? project.githubUrl
                if (target) {
                  window.open(target, "_blank", "noopener,noreferrer")
                }
              }}
            >
              <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
