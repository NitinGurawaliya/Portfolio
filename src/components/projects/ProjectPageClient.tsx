'use client'

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Github,
  Globe,
  MapPin,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectIcon } from "@/components/ui/project-icon"
import { ProjectViewsChart } from "@/components/ProjectViewsChart"
import { PublicShiplogList } from "@/components/shiplog/PublicShiplogList"
import { PortfolioShiplog } from "@/interface"
import { cn } from "@/lib/utils"

export interface PublicProjectPageData {
  slug: string
  project: {
    id: number
    title: string
    description: string
    deployedUrl: string | null
    githubUrl: string | null
    favicon: string | null
    logo: string | null
    technologies: string | null
    languages: string[]
    createdAt: string
    updatedAt: string
  }
  portfolio: {
    id: number
    name: string
    jobTitle: string | null
    bio: string
    profilePic: string | null
    slug: string
    githubUsername: string | null
    websiteUrl: string | null
    company: string | null
    location: string | null
  }
  stats: {
    totalViews: number
    views7Days: number
    views30Days: number
    upvotes: number
    stars: number
    forks: number
  }
  shiplogs: Array<{
    id: number
    content: string
    imageUrl: string | null
    createdAt: string
    project: {
      id: number
      name: string
    } | null
  }>
}

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

const StatBadge = ({
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
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-transparent text-white/80">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
        <p className="text-xl font-semibold text-white">{value}</p>
        {helper ? <p className="text-xs text-white/50">{helper}</p> : null}
      </div>
    </div>
  </div>
)

const CTAButton = ({
  icon: Icon,
  label,
  href,
  variant = "default",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  variant?: "default" | "secondary"
}) => (
  <Button
    asChild
    size="lg"
    variant={variant === "secondary" ? "outline" : "default"}
    className={cn(
      "h-11 w-full justify-between rounded-xl border border-white/10 px-4 text-base font-medium transition",
      variant === "secondary"
        ? "bg-transparent text-white hover:bg-white/10"
        : "bg-white text-black hover:bg-white/90"
    )}
  >
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <ArrowUpRight className="h-4 w-4" />
    </Link>
  </Button>
)

export default function ProjectPageClient({ data }: { data: PublicProjectPageData }) {
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)

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

  const handleShare = async () => {
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
    }
  }

  const shiplogs = useMemo<PortfolioShiplog[]>(
    () =>
      data.shiplogs.map((shiplog) => ({
        ...shiplog,
        createdAt: shiplog.createdAt,
      })),
    [data.shiplogs]
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060606] via-[#0c0c0f] to-[#050505] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 text-sm text-white/60">
          <Link
            href={`/${data.portfolio.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white/60 transition hover:border-white/30 hover:text-white/90"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Portfolio
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
          >
            <Share2 className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Share"}
          </button>
        </div>

        <header className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] shadow-2xl shadow-black/40">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
              <div className="relative flex flex-col items-start gap-6 px-6 py-8 sm:px-10 sm:py-12">
                <ProjectIcon
                  favicon={data.project.favicon || undefined}
                  logo={data.project.logo || undefined}
                  title={data.project.title}
                  size="lg"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    {data.portfolio.name}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
                    {data.project.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {formatNumber(data.stats.totalViews)} lifetime views
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Updated {updatedAt}
                    </div>
                  </div>
                </div>
                {data.project.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.project.logo}
                    alt={`${data.project.title} preview`}
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 object-cover shadow-inner"
                  />
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatBadge
                icon={TrendingUp}
                label="Total Views"
                value={formatNumber(data.stats.totalViews)}
                helper={`${formatNumber(data.stats.views30Days)} in last 30 days`}
              />
              <StatBadge
                icon={Users}
                label="Weekly Views"
                value={formatNumber(data.stats.views7Days)}
                helper="Last 7 days"
              />
              <StatBadge
                icon={Share2}
                label="Upvotes"
                value={formatNumber(data.stats.upvotes)}
                helper="From DevFolio community"
              />
              <StatBadge
                icon={Github}
                label="GitHub Stars"
                value={formatNumber(data.stats.stars)}
              />
              <StatBadge
                icon={ExternalLink}
                label="Repository Forks"
                value={formatNumber(data.stats.forks)}
              />
              <StatBadge
                icon={ArrowUpRight}
                label="Launched"
                value={createdAt}
                helper="First published"
              />
            </div>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg shadow-black/30 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="lg:w-2/3">
                  <h2 className="text-lg font-semibold text-white">About</h2>
                  <div className="mt-3 text-sm leading-relaxed text-white/70">
                    {data.project.description ? (
                      <div
                        className="prose prose-invert max-w-none prose-p:mb-3 prose-p:leading-relaxed prose-strong:text-white prose-a:text-white"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeDescription(data.project.description),
                        }}
                      />
                    ) : (
                      <p>
                        This project showcases what{" "}
                        <span className="font-medium text-white">
                          {data.portfolio.name}
                        </span>{" "}
                        has been building recently.
                      </p>
                    )}
                  </div>
                  {techStack.length > 0 ? (
                    <div className="mt-5">
                      <h3 className="text-xs uppercase tracking-[0.3em] text-white/50">
                        Tech Stack
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {techStack.map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="lg:w-1/3">
                  <div className="space-y-3">
                    {data.project.deployedUrl ? (
                      <CTAButton
                        icon={Globe}
                        label="Visit Live Project"
                        href={data.project.deployedUrl}
                      />
                    ) : null}
                    {data.project.githubUrl ? (
                      <CTAButton
                        icon={Github}
                        label="Explore on GitHub"
                        href={data.project.githubUrl}
                        variant={data.project.deployedUrl ? "secondary" : "default"}
                      />
                    ) : null}
                  </div>
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
                    <p className="font-semibold text-white">
                      Built by {data.portfolio.name}
                    </p>
                    {data.portfolio.jobTitle ? (
                      <p className="text-white/60">{data.portfolio.jobTitle}</p>
                    ) : null}
                    {data.portfolio.location ? (
                      <p className="mt-2 flex items-center gap-2 text-white/50">
                        <MapPin className="h-4 w-4" />
                        {data.portfolio.location}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/50">
                      {data.portfolio.githubUsername ? (
                        <Link
                          href={`https://github.com/${data.portfolio.githubUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 transition hover:border-white/30 hover:text-white/80"
                        >
                          <Github className="h-3.5 w-3.5" />
                          @{data.portfolio.githubUsername}
                        </Link>
                      ) : null}
                      {data.portfolio.websiteUrl ? (
                        <Link
                          href={data.portfolio.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 transition hover:border-white/30 hover:text-white/80"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Portfolio Website
                        </Link>
                      ) : null}
                      {data.portfolio.company ? (
                        <span className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                          <Users className="h-3.5 w-3.5" />
                          {data.portfolio.company}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </header>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg shadow-black/30 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Audience Insights
              </h2>
              <p className="mt-1 text-sm text-white/60">
                Daily views for this project, tracked automatically as visitors
                explore.
              </p>
            </div>
          </div>
          <div className="mt-6 overflow-hidden rounded-3xl border border-white/5 bg-black/20 p-4 sm:p-6">
            <ProjectViewsChart
              portfolioId={data.portfolio.id}
              projectId={data.project.id}
              days={14}
            />
          </div>
        </section>

        {shiplogs.length > 0 ? (
          <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg shadow-black/30 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Live Shiplogs
                </h2>
                <p className="text-sm text-white/60">
                  Build-in-public updates from {data.portfolio.name} for this
                  project.
                </p>
              </div>
              <Link
                href={`/${data.portfolio.slug}/#shiplogs`}
                className="hidden rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white/90 sm:inline-flex"
              >
                View all
              </Link>
            </div>
            <div className="mt-6">
              <PublicShiplogList shiplogs={shiplogs} />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
