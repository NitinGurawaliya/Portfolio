'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowBigUp,
  ArrowLeft,
  CalendarDays,
  MousePointerClick,
  ExternalLink,
  Eye,
  Github,
  Globe,
  MapPin,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  Share2,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectIcon } from "@/components/ui/project-icon"
import { ShiplogCard } from "@/components/shiplog/ShiplogCard"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { PublicProjectPageData } from "@/types/public-project"
import type { Shiplog } from "@/types/shiplog"

const formatNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return value.toString()
}

const formatDate = (iso: string) => {
  const date = new Date(iso)
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const parseTechList = (value: string | null, fallbacks: string[]) => {
  if (!value) return fallbacks

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item : ""))
        .filter(Boolean)
    }
  } catch {
    // not JSON - treat as comma separated
  }

  return value
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const sanitizeDescription = (value: string) => {
  if (!value) return ""
  return value.replace(/<script.*?>.*?<\/script>/gi, "")
}

const MetricCard = ({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  helper?: string
}) => (
  <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.35)]">
    <div className="flex items-center gap-4">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-white text-slate-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        {helper ? (
          <p className="text-xs font-medium text-slate-500">{helper}</p>
        ) : null}
      </div>
    </div>
  </div>
)

const SocialIconLink = ({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
  >
    <Icon className="h-4 w-4" />
  </Link>
)

export default function ProjectPageClient({
  data,
}: {
  data: PublicProjectPageData
}) {
  const pathname = usePathname()
  const { toast } = useToast()

  const techStack = useMemo(
    () => parseTechList(data.project.technologies, data.project.languages),
    [data.project.languages, data.project.technologies]
  )

  const createdAt = useMemo(
    () => formatDate(data.project.createdAt),
    [data.project.createdAt]
  )
  const updatedAt = useMemo(
    () => formatDate(data.project.updatedAt),
    [data.project.updatedAt]
  )

  const [copied, setCopied] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(data.stats.upvotes)
  const [hasUpvoted, setHasUpvoted] = useState(data.viewerHasUpvoted)
  const [upvotePending, setUpvotePending] = useState(false)

  const highlightStats = useMemo(() => {
    const rankValue = (metric: number) => {
      if (!metric || metric <= 0) return "#—"
      const computed = Math.max(1, 100 - Math.min(metric, 99))
      return `#${computed}`
    }

    return [
      {
        icon: MousePointerClick,
        label: "Project click position",
        value: rankValue(data.stats.views30Days),
        helper: "Based on the last 30 days",
      },
      {
        icon: AlertTriangle,
        label: "Project upvote position",
        value: rankValue(data.stats.upvotes),
        helper: "Relative community ranking",
      },
      {
        icon: Eye,
        label: "Project visits",
        value: formatNumber(data.stats.totalViews),
        helper: "Lifetime traffic",
      },
    ]
  }, [data.stats.totalViews, data.stats.upvotes, data.stats.views30Days])

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/analytics/track-project-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        portfolioId: data.portfolio.id,
        projectId: data.project.id,
      }),
      signal: controller.signal,
    }).catch(() => {})

    return () => controller.abort()
  }, [data.portfolio.id, data.project.id])

  const handleShare = useCallback(async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? window.location.origin + pathname
        : pathname
    try {
      if (navigator.share) {
        await navigator.share({
          title: data.project.title,
          url: shareUrl,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error("Failed to share project", error)
      toast({
        title: "Share failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      })
    }
  }, [data.project.title, pathname, toast])

  const handleToggleUpvote = useCallback(async () => {
    setUpvotePending(true)
    try {
      const response = await fetch(
        `/api/feed/projects/${data.project.id}/upvote`,
        {
          method: "POST",
        }
      )

      const result = await response.json().catch(() => ({}))

      if (response.status === 401) {
        toast({
          title: "Sign in required",
          description: "Log in to upvote this project.",
          variant: "destructive",
        })
        return
      }

      if (!response.ok) {
        throw new Error(result?.error || "Unable to update upvote.")
      }

      setHasUpvoted(result.upvoted)
      setUpvoteCount(result.totalUpvotes)
    } catch (error) {
      console.error("Failed to toggle upvote", error)
      toast({
        title: "Upvote failed",
        description: "Please retry in a few seconds.",
        variant: "destructive",
      })
    } finally {
      setUpvotePending(false)
    }
  }, [data.project.id, toast])

  const badgeTechs = techStack.slice(0, 6)
  const heroTags = useMemo(() => badgeTechs.slice(0, 4), [badgeTechs])
  const shiplogEntries = useMemo<Shiplog[]>(
    () =>
      data.shiplogs.map((shiplog) => ({
        id: shiplog.id,
        content: shiplog.content,
        imageUrl: shiplog.imageUrl,
        createdAt: shiplog.createdAt,
        updatedAt: shiplog.createdAt,
        project: shiplog.project
          ? {
              id: shiplog.project.id,
              name: shiplog.project.name,
              repositoryId: shiplog.project.id,
              deployUrl: null,
              repositoryUrl: null,
            }
          : null,
        author: {
          id: data.portfolio.id,
          name: data.portfolio.name,
          githubUsername: data.portfolio.githubUsername,
          avatarUrl: data.portfolio.profilePic,
          portfolioSlug: data.portfolio.slug,
        },
        reactions: {
          shipped: 0,
          fixed: 0,
          support: 0,
        },
        viewerReaction: null,
        isAuthorSelf: true,
        isAuthorFollowed: true,
      })),
    [
      data.shiplogs,
      data.portfolio.id,
      data.portfolio.name,
      data.portfolio.githubUsername,
      data.portfolio.profilePic,
      data.portfolio.slug,
    ]
  )

  return (
    <div
      className="min-h-screen bg-[#f6f7fb] text-slate-900"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(86, 145, 226, 0.12) 1px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="p-2">
      <div className="mx-auto w-full bg-white max-w-6xl px-4 py-6 pb-16 sm:px-6 lg:px-8">

        <section className="bg-white">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-slate-100 sm:h-20 sm:w-20">
                <ProjectIcon
                  favicon={data.project.favicon || undefined}
                  logo={data.project.logo || undefined}
                  title={data.project.title}
                  size="lg"
                />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-2xl font-semibold mt-3 leading-tight text-black sm:text-4xl">
                  {data.project.title}
                </h1>
                {heroTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {heroTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 sm:gap-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleShare}
                className="flex h-10 items-center gap-2 rounded-full border-slate-200 bg-white px-4 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                aria-label="Share project"
              >
                <Share2 className="h-4 w-4" />
                {copied ? "Link copied" : "Share"}
              </Button>
              {data.project.deployedUrl ? (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="flex h-10 items-center gap-2 rounded-full border-slate-200 bg-white px-4 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                >
                  <Link
                    href={data.project.deployedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Visit
                  </Link>
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                onClick={handleToggleUpvote}
                disabled={upvotePending}
                className={cn(
                  "flex h-10 items-center gap-2 p-4 rounded-full px-5 text-xs font-semibold uppercase tracking-wide transition",
                  hasUpvoted
                    ? "bg-gradient-to-r from-orange-600 to-orange-700 text-white"
                    : "bg-orange-400 text-black hover:bg-orange-500",
                  upvotePending && "opacity-80"
                )}
              >
                <ArrowBigUp className="h-4 w-4" />
                {upvotePending ? "Updating..." : `Upvote ${upvoteCount}`}
              </Button>
            </div>

            {data.project.description ? (
              <div
                className="prose max-w-none text-sm leading-relaxed text-slate-600 prose-p:mb-3 prose-p:text-slate-600"
                dangerouslySetInnerHTML={{
                  __html: sanitizeDescription(data.project.description),
                }}
              />
            ) : null}
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlightStats.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">{item.helper}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <item.icon className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-stretch">
          <div className="relative overflow-hidden rounded-3xl  bg-white/80 p-0  md:h-full">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" />
            <div className="relative flex h-full items-center justify-center p-5">
            {data.project.logo ? (
              <div className="relative flex w-full max-w-[520px] items-center justify-center overflow-hidden rounded-2xl bg-white/70 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.project.logo}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-125 blur-[36px] object-cover opacity-85"
                />
                <img
                  src={data.project.logo}
                  alt={`${data.project.title} preview`}
                  className="relative z-10 w-full rounded-2xl border border-white/60 shadow-xl object-cover"
                  style={{ aspectRatio: "16 / 9" }}
                />
              </div>
            ) : (
              <div className="flex min-h-[200px] w-full max-w-[520px] flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6 text-center shadow-inner">
                <ProjectIcon
                  favicon={data.project.favicon || undefined}
                  logo={data.project.logo || undefined}
                  title={data.project.title}
                  size="lg"
                />
                <p className="text-sm font-medium text-slate-600">
                  Preview image coming soon
                </p>
              </div>
            )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm g sm:p-6 md:h-full flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  {data.portfolio.profilePic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.portfolio.profilePic}
                      alt={data.portfolio.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold uppercase text-slate-500">
                      {data.portfolio.name.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="space-y-0">
                  <h2 className="text-base font-semibold text-slate-900">
                    {data.portfolio.name}
                  </h2>
                  {data.portfolio.githubUsername ? (
                    <Link
                      href={`https://github.com/${data.portfolio.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      @{data.portfolio.githubUsername}
                    </Link>
                  ) : null}
                </div>
              </div>
              {data.portfolio.websiteUrl ? (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-full border border-black bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-black hover:border-slate-300 hover:bg-slate-50"
                >
                  <Link
                    href={data.portfolio.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download CV
                  </Link>
                </Button>
              ) : null}
            </div>

            <div className="mt-5 space-y-4 flex-1">
              {data.portfolio.jobTitle ? (
                <div className="flex items-center justify-between border-b border-slate-100 pb-0">
                  <span className="text-xs font-medium text-slate-500">
                    Role
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {data.portfolio.jobTitle}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center justify-between border-b border-slate-100 pb-0">
                <span className="text-xs font-medium text-slate-500">
                  Project launch date
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  {createdAt}
                </span>
              </div>

              {data.portfolio.location ? (
                <div className="flex items-center justify-between border-b border-slate-100 pb-0">
                  <span className="text-xs font-medium text-slate-500">
                    Location
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {data.portfolio.location}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center justify-between border-b border-slate-100 pb-0">
                <span className="text-xs font-medium text-slate-500">
                  Socials
                </span>
                <span className="flex items-center gap-2">
                  {data.portfolio.githubUsername ? (
                    <SocialIconLink
                      href={`https://github.com/${data.portfolio.githubUsername}`}
                      label="GitHub"
                      icon={Github}
                    />
                  ) : null}
                  {data.portfolio.websiteUrl ? (
                    <SocialIconLink
                      href={data.portfolio.websiteUrl}
                      label="Website"
                      icon={Globe}
                    />
                  ) : null}
                  {data.project.deployedUrl ? (
                    <SocialIconLink
                      href={data.project.deployedUrl}
                      label="Live project"
                      icon={ExternalLink}
                    />
                  ) : null}
                </span>
              </div>

              {techStack.length > 0 ? (
                <div className="flex items-center justify-between border-b border-slate-100 pb-0">
                  <span className="text-xs font-medium text-slate-500">
                    Skills
                  </span>
                  <div className="flex flex-wrap justify-end gap-2">
                    {techStack.slice(0, 6).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between border-b border-slate-100 pb-0">
                <span className="text-xs font-medium text-slate-500">
                  Times visited
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  {formatNumber(data.stats.totalViews)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Projects shipped
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  {data.portfolio.projectCount}
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
    </div>
  )
}
