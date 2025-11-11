import { useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Shiplog, ShiplogReactionType } from "@/types/shiplog"

const REACTIONS: Array<{
  type: ShiplogReactionType
  emoji: string
  label: string
}> = [
  { type: "SHIPPED", emoji: "🚢", label: "Shipped" },
  { type: "FIXED", emoji: "🔧", label: "Fixed something" },
  { type: "SUPPORT", emoji: "❤️", label: "Support" },
]

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
}

export function ShiplogCard({
  shiplog,
  onReact,
  onToggleFollow,
  reactionPending = false,
  followPending = false,
  showFollowButton = false,
  className,
}: ShiplogCardProps) {
  const relativeTime = useMemo(() => formatRelativeTime(shiplog.createdAt), [shiplog.createdAt])

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
    if (reactionPending || !onReact) return
    onReact(shiplog.id, type)
  }

  const handleFollowClick = () => {
    if (!onToggleFollow || followPending) return
    if (shiplog.author.id == null) return
    onToggleFollow(shiplog.author.id, !shiplog.isAuthorFollowed)
  }

  const shouldShowFollow = showFollowButton && !shiplog.isAuthorSelf && shiplog.author.id !== null

  return (
    <Card className={cn("w-full rounded-2xl border border-border/40 bg-background/80 p-5 shadow-sm backdrop-blur", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={shiplog.author.avatarUrl ?? undefined} alt={shiplog.author.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{shiplog.author.name}</span>
                {shiplog.author.githubUsername ? (
                  <span className="text-xs text-muted-foreground">@{shiplog.author.githubUsername}</span>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground">{relativeTime}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-foreground">{shiplog.content}</p>
            {shiplog.project ? (
              <div className="mt-2">
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
                  Linked project: {shiplog.project.name}
                </Badge>
              </div>
            ) : null}
            {shiplog.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shiplog.imageUrl}
                alt="Shiplog attachment"
                className="mt-3 max-h-72 w-full rounded-xl object-cover"
              />
            ) : null}
          </div>
        </div>
        {shouldShowFollow ? (
          <Button
            variant={shiplog.isAuthorFollowed ? "default" : "outline"}
            size="sm"
            disabled={followPending}
            onClick={handleFollowClick}
            className={cn(
              "rounded-full px-3 text-xs font-semibold transition",
              shiplog.isAuthorFollowed
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "border border-border/60 text-foreground hover:bg-muted/60"
            )}
          >
            {shiplog.isAuthorFollowed ? "Following" : "Follow"}
          </Button>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {REACTIONS.map((reaction) => {
            const isActive = shiplog.viewerReaction === reaction.type
            const count =
              reaction.type === "SHIPPED"
                ? shiplog.reactions.shipped
                : reaction.type === "FIXED"
                  ? shiplog.reactions.fixed
                  : shiplog.reactions.support
            return (
              <Button
                key={reaction.type}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                disabled={reactionPending}
                onClick={() => handleReactionClick(reaction.type)}
                className={cn(
                  "rounded-full px-3 text-xs font-semibold transition",
                  isActive
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "border border-border/60 text-foreground hover:bg-muted/60"
                )}
              >
                <span className="mr-1.5 text-base">{reaction.emoji}</span>
                <span>{count}</span>
              </Button>
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
