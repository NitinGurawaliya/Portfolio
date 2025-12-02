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
  Users,
  Code2,
  TrendingUp,
  Tags,
  DollarSign,
  Banknote,
  CurrencyIcon,
  BanknoteArrowUpIcon,
  ArrowUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectIcon } from "@/components/ui/project-icon"
import { ShiplogCard } from "@/components/shiplog/ShiplogCard"
import { SkillIcon, getSkillIcon } from "@/lib/skill-icons"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { PublicProjectPageData } from "@/types/public-project"
import type { Shiplog } from "@/types/shiplog"
import { MdCurrencyBitcoin } from "react-icons/md"
import { Arrow } from "@radix-ui/react-dropdown-menu"

const formatNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return value.toString()
}

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return null
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`
  return `$${value.toLocaleString()}`
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
  const [projectLogo, setProjectLogo] = useState<string | null>(data.project.logo)
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false)
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

  // Priority: 1. Existing logo, 2. OG image
  // Only capture screenshot if logo is completely missing (not saved in DB)
  useEffect(() => {
    // If we already have a logo from data, use it (don't refetch)
    // But check if it's a valid URL - if it's a GitHub favicon, treat as null
    if (data.project.logo) {
      const isGitHubFavicon = data.project.logo.includes('github.com') && (
        data.project.logo.includes('favicon') || 
        data.project.logo.includes('github-icon') || 
        data.project.logo.includes('octocat')
      )
      
      if (isGitHubFavicon) {
        // Don't use GitHub favicon as logo - will be handled by runtime logic
        setProjectLogo(null)
        return
      }
      
      // If logo is from opengraph.githubassets.com, use proxy API to detect default logo
      // The proxy API will try to get custom OG image from repository HTML first
      if (data.project.logo.includes('opengraph.githubassets.com')) {
        try {
          const url = new URL(data.project.logo)
          const pathParts = url.pathname.split('/').filter(Boolean)
          if (pathParts.length >= 2) {
            const owner = pathParts[0]
            const repo = pathParts[1]
            // Use proxy API which detects default logos and tries to get custom images
            setProjectLogo(`/api/portfolio/github-og-image?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`)
            return
          }
        } catch (e) {
          // If URL parsing fails, use direct URL
          console.warn('Failed to parse GitHub OG image URL:', e)
        }
      }
      
      setProjectLogo(data.project.logo)
      return
    }
    
    // Only try to capture screenshot if:
    // 1. No logo exists in database
    // 2. Deployed URL exists
    // 3. Not a GitHub URL
    // 4. Not already capturing
    if (
      !data.project.logo &&
      data.project.deployedUrl && 
      !isCapturingScreenshot &&
      !data.project.deployedUrl.includes('github.com')
    ) {
      setIsCapturingScreenshot(true)
      fetch('/api/portfolio/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: data.project.deployedUrl,
          projectId: data.project.id // Pass project ID to save screenshot to DB
        }),
      })
      .then(response => response.json())
      .then(result => {
        if (result.screenshot) {
          setProjectLogo(result.screenshot)
          // Screenshot is saved to DB by the API, so we won't refetch on next load
        }
      })
      .catch(error => {
        console.error('Failed to capture screenshot:', error)
      })
      .finally(() => {
        setIsCapturingScreenshot(false)
      })
    }
  }, [data.project.logo, data.project.deployedUrl, data.project.id, isCapturingScreenshot])

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
      },
      {
        icon: AlertTriangle,
        label: "Project upvote position",
        value: rankValue(data.stats.upvotes),
      },
      {
        icon: Eye,
        label: "Project visits",
        value: formatNumber(data.stats.totalViews),
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
      <div className="px-6">
        <div className="mx-auto w-full bg-white max-w-6xl px-3 py-6 pb-0 sm:px-6 lg:px-8">
          {/* Hero Section: Logo, Title, Buttons, Description */}
          <div className="flex flex-col gap-4">
            {/* Layout: Logo + Title + Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Logo + Title (Left side on large screens) */}
              <div className="flex items-start gap-4 md:gap-2">
                <div className="flex h-14 w-14   bg-gray-800 shadow-sm rounded-md shrink-0 items-center  justify-center bg-white  overflow-hidden">
                  <ProjectIcon
                    favicon={data.project.favicon || undefined}
                    logo={data.project.logo || undefined}
                    title={data.project.title}
                    size="lg"
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h1 className="text-xl font-semibold mt-2 text-black md:text-lg lg:text-3xl">
                    {data.project.title}
                  </h1>
                  
                </div>
              </div>

              {/* Action Buttons (Right side on large screens) */}
              <div className="flex flex-wrap items-center gap-8 md:gap-6">
                {/* <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleShare}
                  className="flex h-10 items-center gap-2 rounded-full border-1 border-gray-200  shadow-sm bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  aria-label="Share project"
                >
                  <ArrowBigUp className="h-4 w-4" />
                </Button> */}
                {data.project.deployedUrl ? (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex h-10 items-center gap-2 rounded-full border-1 border-gray-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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
                  { hasUpvoted ? "Upvoted" : upvotePending ? "Updating..." : `Upvote ${upvoteCount}`}
                </Button>
              </div>
            </div>

            {/* Description */}
            {data.project.description ? (
              <div
                className="prose max-w-none text-md ml-2 leading-snug text-gray-900  font-semibold line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: sanitizeDescription(data.project.description),
                }}
              />
            ) : null}

            {/* Status, Users, Revenue, MRR */}
            {(data.project.status || typeof data.project.users === "number" || typeof data.project.revenue === "number" || typeof data.project.mrr === "number") && (
              <div className="flex flex-wrap items-center ml-2 gap-2">
                {/* {data.project.status && (
                  <span className="inline-flex items-center text-sm font-semibold rounded-md px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="mr-1.5">●</span>
                    {data.project.status}
                  </span>
                )}
                {typeof data.project.users === "number" && (
                  <span className="inline-flex items-center text-sm font-semibold rounded-md px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200">
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    {data.project.users.toLocaleString()}
                  </span>
                )} */}
                {typeof data.project.revenue === "number" && (
                  <span className="inline-flex items-center text-xs font-semibold rounded-md px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200">
                    <Banknote className="h-3.5 w-3.5 mr-1.5" />
                    Rev {formatCurrency(data.project.revenue)}
                  </span>
                )}
                {typeof data.project.mrr === "number" && (
                  <span className="inline-flex items-center text-xs font-semibold rounded-md px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200">
                    <BanknoteArrowUpIcon className="h-3.5 w-3.5 mr-1.5" />
                    MRR {formatCurrency(data.project.mrr)}
                  </span>
                )}
              </div>
            )}



            {/* Categories */}
            {data.project.category && (
              <div className="flex items-center mt-2 gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500"></h3>
                <div className="flex flex-wrap gap-2">
                <Tags className="h-4 w-4 text-slate-500 mt-2" />
                  {data.project.category.split(',').map((cat: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center text-xs font-semibold rounded-md px-3 py-1 hover:bg-indigo-50 text-black border border-orange-200">
                      {cat.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {/* {techStack.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-slate-500" />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tech Stack</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech: string) => {
                    const IconComponent = getSkillIcon(tech)
                    return (
                      <span key={tech} className="inline-flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors">
                        {IconComponent && <SkillIcon skillName={tech} className="h-4 w-4" />}
                        {tech}
                      </span>
                    )
                  })}
                </div>
              </div>
            )} */}
          </div>

          {/* Stats Section */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <item.icon className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
          </div>

          {/* Image and Portfolio Info Section */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-stretch">
          <div className="relative overflow-hidden rounded-3xl  bg-white/80 p-0  md:h-full">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" />
            <div className="relative flex h-full items-center justify-center p-5">
            {projectLogo ? (
              <div className="relative flex w-full max-w-[520px] items-center justify-center overflow-hidden rounded-2xl bg-white/70 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={projectLogo}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-125 blur-[36px] object-cover opacity-85"
                />
                <img
                  src={projectLogo}
                  alt={`${data.project.title} preview`}
                  className="relative z-10 w-full rounded-2xl border border-white/60 shadow-xl object-contain"
                  style={{ aspectRatio: "16 / 9" }}
                  onLoad={(e) => {
                    // Detect if this is the default GitHub Octocat logo
                    // Default logos are usually square (1:1 aspect ratio) and have specific dimensions
                    const img = e.currentTarget as HTMLImageElement
                    const naturalWidth = img.naturalWidth
                    const naturalHeight = img.naturalHeight
                    
                    // Default GitHub OG images are usually square (1200x1200 or 1280x640)
                    // Custom repo OG images are usually wider (1200x630 or similar)
                    const aspectRatio = naturalWidth / naturalHeight
                    const isSquare = Math.abs(aspectRatio - 1) < 0.1 // Within 10% of 1:1
                    const isDefaultSize = (naturalWidth === 1200 && naturalHeight === 1200) || 
                                         (naturalWidth === 1280 && naturalHeight === 640)
                    
                    // If it's square and matches default dimensions, it's likely the default Octocat logo
                    if (isSquare && isDefaultSize && projectLogo?.includes('opengraph.githubassets.com')) {
                      // Hide the default logo and show placeholder
                      img.style.display = 'none'
                      const parent = img.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex min-h-[200px] w-full max-w-[520px] flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6 text-center shadow-inner">
                            <div class="text-sm font-medium text-slate-600">Preview image unavailable</div>
                            <div class="text-xs text-slate-500">This repository doesn't have a custom OG image</div>
                          </div>
                        `
                      }
                    }
                  }}
                  onError={(e) => {
                    // If OG image fails to load, hide it and show placeholder
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex min-h-[200px] w-full max-w-[520px] flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6 text-center shadow-inner">
                          <div class="text-sm font-medium text-slate-600">Preview image unavailable</div>
                        </div>
                      `
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex min-h-[200px] w-full max-w-[520px] flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6 text-center shadow-inner">
                {isCapturingScreenshot ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                    <p className="text-sm font-medium text-slate-600">
                      Capturing preview...
                    </p>
                  </>
                ) : (
                  <>
                    <ProjectIcon
                      favicon={data.project.favicon || undefined}
                      logo={data.project.logo || undefined}
                      title={data.project.title}
                      size="lg"
                    />
                    <p className="text-sm font-medium text-slate-600">
                      Preview image coming soon
                    </p>
                  </>
                )}
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
              {data.portfolio.cvUrl ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = data.portfolio.cvUrl!
                    link.download = `${data.portfolio.name || "resume"}-cv.pdf`
                    link.target = "_blank"
                    link.rel = "noopener noreferrer"
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  className="rounded-full border border-black bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-black hover:border-slate-300 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download CV
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

              {data.portfolio.skills && data.portfolio.skills.length > 0 ? (
                <div className="flex items-center justify-between border-b border-slate-100 pb-0">
                  <span className="text-xs font-medium text-slate-500">
                    Skills
                  </span>
                  <div className="flex items-center justify-end -space-x-2 overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-hide">
                    {data.portfolio.skills.map((skill, index) => (
                      <span
                        key={skill.id}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm hover:z-10 hover:scale-110 transition-transform"
                        title={skill.name}
                        style={{ zIndex: data.portfolio.skills.length - index }}
                      >
                        <SkillIcon skillName={skill.name} className="h-4 w-4" />
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
          </div>

        </div>
      </div>
    </div>
  )
}
