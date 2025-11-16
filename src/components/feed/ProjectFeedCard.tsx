"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProjectIcon } from "@/components/ui/project-icon"
import { ArrowBigUp, Check, Eye, Share2, Tags, Users, TrendingUp, BanknoteArrowUpIcon, Banknote } from "lucide-react"
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
  category?: string | null
  status?: string | null
  revenue?: number | null
  mrr?: number | null
  users?: number | null
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
  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) return null
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    return `$${value.toLocaleString()}`
  }

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
        "group relative w-full rounded-lg border border-gray-200 bg-card/90 p-4 sm:p-5 text-card-foreground",
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
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex flex-1 items-center gap-2 sm:gap-3">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center shadow-sm rounded-md bg-muted/40">
            <ProjectIcon
              favicon={project.favicon || undefined}
              logo={project.logo || undefined}
              title={project.title}
              size="sm"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-semibold leading-tight text-foreground transition">
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
            "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 flex-col items-center justify-center rounded-md border border-border/40 bg-background/70 text-[10px] sm:text-xs font-semibold text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            project.hasUpvoted && "border-orange-500 bg-orange-500/10 text-orange-500",
            upvotePending && "opacity-70"
          )}
        >
          <ArrowBigUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="mt-0.5 leading-none">{project.upvotes.toLocaleString()}</span>
        </button>
      </div>

      {description && (
        <p className="mt-3 sm:mt-3.5 text-xs sm:text-sm leading-snug text-muted-foreground line-clamp-2">{description}</p>
      )}
      
      {/* Categories and Metrics Row */}
      {(project.category || typeof project.revenue === 'number' || typeof project.mrr === 'number' || typeof project.users === 'number') && (
        <div className="flex items-start justify-between mt-2.5 sm:mt-3 gap-3">
          {/* Left: Categories */}
          {project.category && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tags className="h-3.5 w-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
              {project.category.split(',').map((cat: string, idx: number) => (
                <span key={idx} className="inline-flex items-center text-[10.5px] leading-none font-semibold rounded-md px-2.5 py-1.5  text-black border border-gray-200">
                  {cat.trim()}
                </span>
              ))}
            </div>
          )}
          
          {/* Right: Metrics */}
          {(typeof project.revenue === 'number' || typeof project.mrr === 'number' || typeof project.users === 'number') && (
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
              {typeof project.users === 'number' && (
                <span className="inline-flex items-center text-[10.5px] leading-none font-semibold rounded-md px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  {project.users.toLocaleString()}
                </span>
              )}
              {typeof project.revenue === 'number' && (
                <span className="inline-flex items-center text-[10.5px] leading-none font-semibold rounded-md px-2.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-200">
                  <Banknote className="h-3.5 w-3.5 mr-1" />
                  {formatCurrency(project.revenue)}
                </span>
              )}
              {typeof project.mrr === 'number' && (
                <span className="inline-flex items-center text-[10.5px] leading-none font-semibold rounded-md px-2.5 py-1.5 bg-orange-50 text-orange-700 border border-orange-200">
                  <BanknoteArrowUpIcon className="h-3.5 w-3.5 mr-1" />
                  {formatCurrency(project.mrr)}
                </span>
              )}
            </div>
          )}
        </div>
      )}
          
      <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <span className="text-foreground text-[10px] sm:text-xs font-medium">Creator</span>
          {portfolioHref ? (
            <Link
              href={portfolioHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="flex items-center gap-1.5 sm:gap-2 font-semibold text-foreground transition hover:text-primary"
            >
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center overflow-hidden rounded-full border border-border/30 bg-muted/50">
                {project.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.author.avatarUrl} alt={project.author.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[9px] sm:text-[10px] uppercase text-muted-foreground">
                    {project.author.name.slice(0, 2)}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-0.5 text-[11px] sm:text-xs">
                {project.author.name}
                {project.author.verified && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />}
              </span>
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 sm:gap-2 font-semibold text-foreground">
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center overflow-hidden rounded-full border border-border/30 bg-muted/50">
                {project.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.author.avatarUrl} alt={project.author.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[9px] sm:text-[10px] uppercase text-muted-foreground">
                    {project.author.name.slice(0, 2)}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-0.5 text-[11px] sm:text-xs">
                {project.author.name}
                {project.author.verified && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="font-medium text-foreground">{project.views}</span>
          </div>
          {(project.deployedUrl || project.githubUrl) && (
            <button
              type="button"
              className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md border border-gray-200 text-muted-foreground transition hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation()
                const target = project.deployedUrl ?? project.githubUrl
                if (target) {
                  window.open(target, "_blank", "noopener,noreferrer")
                }
              }}
            >
              <Share2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
