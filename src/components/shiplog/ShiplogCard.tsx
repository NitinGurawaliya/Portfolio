import Link from "next/link"
import { useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { Shiplog, ShiplogReactionType } from "@/types/shiplog"
import { X } from "lucide-react"

const REACTIONS: Array<{
  type: ShiplogReactionType
  emoji: string
  label: string
}> = [
  { type: "SHIPPED", emoji: "🚢", label: "Shipped" },
  { type: "FIXED", emoji: "🔧", label: "Fixed something" },
  { type: "SUPPORT", emoji: "❤️", label: "Support" },
]

const MAX_PREVIEW_WORDS = 130
const WORD_MATCHER = /\S+/g
const MAX_PROJECT_BADGE_WORDS = 7
const MAX_PROJECT_BADGE_LENGTH = 60
const MAX_INLINE_WORD_LENGTH = 80

function countWords(content: string) {
  if (!content) return 0
  return (content.match(WORD_MATCHER) ?? []).length
}

function shouldTruncate(content: string) {
  return countWords(content) > MAX_PREVIEW_WORDS
}

function truncateContent(content: string) {
  if (!shouldTruncate(content)) return content

  let endIndex = content.length
  let wordsSeen = 0

  for (const match of content.matchAll(WORD_MATCHER)) {
    wordsSeen += 1
    if (wordsSeen >= MAX_PREVIEW_WORDS) {
      endIndex = match.index! + match[0].length
      break
    }
  }

  return content.slice(0, endIndex).replace(/\s+$/, "") + "…"
}

function formatProjectBadgeLabel(name: string) {
  if (!name) return ""
  const words = name.trim().split(/\s+/)
  let truncated =
    words.length > MAX_PROJECT_BADGE_WORDS ? words.slice(0, MAX_PROJECT_BADGE_WORDS).join(" ") : words.join(" ")

  if (truncated.length > MAX_PROJECT_BADGE_LENGTH) {
    truncated = truncated.slice(0, MAX_PROJECT_BADGE_LENGTH).trimEnd()
  }

  if (truncated !== name) {
    truncated = `${truncated}…`
  }

  return truncated
}

function formatRelativeTime(dateInput: string) {
  const date = new Date(dateInput)
  const now = Date.now()
  const diffMs = now - date.getTime()

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ]

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })

  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms || unit === "second") {
      const value = Math.round(diffMs / ms)
      return rtf.format(-value, unit)
    }
  }

  return ""
}

interface ShiplogCardProps {
  shiplog: Shiplog
  onReact?: (shiplogId: number, reaction: ShiplogReactionType) => void
  onToggleFollow?: (authorId: number, shouldFollow: boolean) => void
  reactionPending?: boolean
  followPending?: boolean
  showFollowButton?: boolean
  className?: string
  variant?: "default" | "dashboard"
}

export function ShiplogCard({
  shiplog,
  onReact,
  onToggleFollow,
  reactionPending = false,
  followPending = false,
  showFollowButton = false,
  className,
  variant = "default",
}: ShiplogCardProps) {
  const { toast } = useToast()
  const relativeTime = useMemo(() => formatRelativeTime(shiplog.createdAt), [shiplog.createdAt])
  const [expanded, setExpanded] = useState(false)
  const [isImageOpen, setIsImageOpen] = useState(false)
  const isTruncated = useMemo(() => shouldTruncate(shiplog.content), [shiplog.content])
  const displayContent = useMemo(() => {
    const source = expanded || !isTruncated ? shiplog.content : truncateContent(shiplog.content)
    return source.split(/(\s+)/).map((token) => {
      if (token.trim().length === 0) return token
      if (token.length <= MAX_INLINE_WORD_LENGTH) return token
      const chunks = []
      for (let i = 0; i < token.length; i += MAX_INLINE_WORD_LENGTH) {
        chunks.push(token.slice(i, i + MAX_INLINE_WORD_LENGTH))
      }
      return chunks.join(" ")
    }).join("")
  }, [expanded, isTruncated, shiplog.content])
  const contentLength = useMemo(() => shiplog.content.trim().split(/\s+/).length, [shiplog.content])
  const isCompact = useMemo(() => {
    if (shiplog.imageUrl) return false
    return contentLength <= 40
  }, [contentLength, shiplog.imageUrl])
  const isDashboardVariant = variant === "dashboard"
  const basePadding = useMemo(() => {
    if (contentLength > 80) return "p-6 sm:p-6"
    if (contentLength > 40) return "p-5 sm:p-5"
    return "p-4 sm:p-4"
  }, [contentLength])
  const cardPaddingClass = shiplog.imageUrl
    ? isDashboardVariant
      ? "p-3.5 sm:p-4 pb-5 sm:pb-6"
      : "p-4 sm:p-5 pb-6 sm:pb-7"
    : isDashboardVariant
      ? "p-3.5 sm:p-4"
      : basePadding

  const initials = useMemo(() => {
    if (shiplog.author.name) {
      return shiplog.author.name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    }
    return "?"
  }, [shiplog.author.name])

  const totalReactions = shiplog.reactions.shipped + shiplog.reactions.fixed + shiplog.reactions.support

  const handleReactionClick = (type: ShiplogReactionType) => {
    if (reactionPending) return
    if (!onReact) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add a reaction.",
        duration: 3000,
        action: (
          <ToastAction altText="Sign in" asChild>
            <Link href="/auth?redirect=/feed/shiplog" className="px-3 py-1 text-sm font-semibold">
              Sign in
            </Link>
          </ToastAction>
        ),
      })
      return
    }
    onReact(shiplog.id, type)
  }

  const handleFollowClick = () => {
    if (followPending) return
    if (!onToggleFollow) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow creators.",
        duration: 3000,
        action: (
          <ToastAction altText="Sign in" asChild>
            <Link href="/auth?redirect=/feed/shiplog" className="px-3 py-1 text-sm font-semibold">
              Sign in
            </Link>
          </ToastAction>
        ),
      })
      return
    }
    if (shiplog.author.id == null) return
    onToggleFollow(shiplog.author.id, !shiplog.isAuthorFollowed)
  }

  const authorProfileUrl = shiplog.author.portfolioSlug ? `/${shiplog.author.portfolioSlug}` : null
  const projectLink = shiplog.project?.deployUrl ?? shiplog.project?.repositoryUrl ?? null
  const projectBadgeLabel = useMemo(
    () => (shiplog.project?.name ? formatProjectBadgeLabel(shiplog.project.name) : null),
    [shiplog.project?.name]
  )

  const shouldShowFollow = showFollowButton && !shiplog.isAuthorSelf && shiplog.author.id !== null

  return (
    <Card
      className={cn(
        "group w-full max-w-full overflow-hidden rounded-lg border border-border/70 bg-background",
        cardPaddingClass,
        isCompact && !isDashboardVariant && "sm:p-4",
        isDashboardVariant && "rounded-2xl border-border bg-background",
        className
      )}
    >
      <div
        className={cn(
          "flex w-full items-start",
          isDashboardVariant ? "gap-3" : "gap-3 sm:gap-4"
        )}
      >
        {authorProfileUrl ? (
          <Link
            href={authorProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isDashboardVariant ? "mt-0 h-10 w-10" : "mt-1 h-12 w-12"
            )}
            prefetch={false}
          >
            <Avatar
              className={cn(
                "shadow-sm ring-1 ring-border/60",
                isDashboardVariant ? "h-10 w-10" : "h-12 w-12"
              )}
            >
              <AvatarImage src={shiplog.author.avatarUrl ?? undefined} alt={shiplog.author.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Avatar
            className={cn(
              "shadow-sm ring-1 ring-border/60",
              isDashboardVariant ? "mt-0 h-10 w-10" : "mt-1 h-12 w-12"
            )}
          >
            <AvatarImage src={shiplog.author.avatarUrl ?? undefined} alt={shiplog.author.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            "flex-1 min-w-0 space-y-3",
            (isCompact || isDashboardVariant) && "space-y-2.5"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] sm:text-sm">
              {authorProfileUrl ? (
                <Link
                  href={authorProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  prefetch={false}
                  className="font-semibold text-foreground hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {shiplog.author.name}
                </Link>
              ) : (
                <span className="font-semibold text-foreground">{shiplog.author.name}</span>
              )}

              {relativeTime ? <span className="text-muted-foreground">· {relativeTime}</span> : null}
            </div>
            {shouldShowFollow ? (
              <Button
                variant={shiplog.isAuthorFollowed ? "default" : "outline"}
                size="sm"
                disabled={followPending}
                onClick={handleFollowClick}
                className={cn(
                  "rounded-full px-3 text-xs font-semibold",
                  shiplog.isAuthorFollowed
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "border-border/60 text-foreground hover:bg-muted/60"
                )}
              >
                {shiplog.isAuthorFollowed ? "Following" : "Follow"}
              </Button>
            ) : null}
          </div>

          <div
            className={cn(
              "space-y-3",
              (isCompact || isDashboardVariant) && "space-y-2.5"
            )}
          >
            <p
              className={cn(
                "whitespace-pre-wrap break-words text-[15px] leading-7 text-foreground [overflow-wrap:anywhere] [word-break:break-word]",
                (isCompact || isDashboardVariant) && "leading-6"
              )}
            >
              {displayContent}
            </p>
            {!expanded && isTruncated ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Show more
              </button>
            ) : null}

            {shiplog.project && projectBadgeLabel ? (
              <Badge
                variant="outline"
                className="inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full border-border/50 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground [overflow-wrap:anywhere] [word-break:break-word]"
                title={shiplog.project.name}
              >
                <span className="shrink-0 text-muted-foreground/80">View project:</span>
                {projectLink ? (
                  <a
                    href={projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate text-foreground hover:underline"
                  >
                    {projectBadgeLabel}
                  </a>
                ) : (
                  <span className="min-w-0 flex-1 truncate text-foreground">{projectBadgeLabel}</span>
                )}
              </Badge>
            ) : null}

            {shiplog.imageUrl ? (
              <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
                <button
                  type="button"
                  onClick={() => setIsImageOpen(true)}
                  className="flex w-full justify-center overflow-hidden rounded-2xl border border-border/40 bg-muted/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shiplog.imageUrl}
                    alt="Shiplog attachment"
                    className="h-full max-h-[420px] w-full cursor-zoom-in object-contain bg-background p-2"
                  />
                </button>
                <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none">
                  <DialogTitle className="sr-only">Shiplog image preview</DialogTitle>
                  <DialogDescription className="sr-only">Enlarged shiplog attachment</DialogDescription>
                  <div className="relative flex w-full max-h-[85vh] items-center justify-center overflow-hidden rounded-3xl border border-border/60 bg-background/95 p-2 sm:p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shiplog.imageUrl}
                      alt="Shiplog attachment enlarged"
                      className="max-h-[80vh] w-full object-contain"
                    />
                    <DialogClose className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-sm transition hover:bg-background">
                      <X className="h-4 w-4" />
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3",
          isDashboardVariant ? "mt-3" : "mt-4"
        )}
      >
        <div className={cn("flex flex-wrap items-center gap-3", isDashboardVariant ? "sm:gap-3" : "sm:gap-4")}>
          {REACTIONS.map((reaction) => {
            const isActive = shiplog.viewerReaction === reaction.type
            const count =
              reaction.type === "SHIPPED"
                ? shiplog.reactions.shipped
                : reaction.type === "FIXED"
                  ? shiplog.reactions.fixed
                  : shiplog.reactions.support
            return (
              <button
                key={reaction.type}
                type="button"
                disabled={reactionPending}
                onClick={() => handleReactionClick(reaction.type)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition",
                  reactionPending ? "opacity-60" : "hover:bg-muted/60",
                  isActive
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn("text-base leading-none", isDashboardVariant && "text-sm")}>
                  {reaction.emoji}
                </span>
                <span className={cn("text-[13px]", isDashboardVariant && "text-xs")}>{count}</span>
              </button>
            )
          })}
        </div>

        <span className="text-xs text-muted-foreground">
          {totalReactions === 0 ? "No reactions yet" : `${totalReactions} reaction${totalReactions === 1 ? "" : "s"}`}
        </span>
      </div>
    </Card>
  )
}