import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PortfolioShiplog } from "@/interface"

const formatDate = (iso: string) => {
  try {
    const date = new Date(iso)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

const MAX_PROJECT_WORDS = 7
const MAX_PROJECT_LENGTH = 60

const formatProjectName = (name: string) => {
  if (!name) return ""
  const words = name.trim().split(/\s+/)
  let truncated =
    words.length > MAX_PROJECT_WORDS ? words.slice(0, MAX_PROJECT_WORDS).join(" ") : words.join(" ")

  if (truncated.length > MAX_PROJECT_LENGTH) {
    truncated = truncated.slice(0, MAX_PROJECT_LENGTH).trimEnd()
  }

  if (truncated !== name) {
    truncated = `${truncated}…`
  }

  return truncated
}

interface PublicShiplogListProps {
  shiplogs?: PortfolioShiplog[]
}

export function PublicShiplogList({ shiplogs }: PublicShiplogListProps) {
  if (!shiplogs || shiplogs.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Building in Public — Day Logs</h3>
      <div className="space-y-3">
        {shiplogs.map((shiplog) => (
          <Card key={shiplog.id} className="rounded-2xl border border-border/50 bg-background/80 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground/80">{formatDate(shiplog.createdAt)}</span>
              {shiplog.project ? (
                <Badge
                  variant="outline"
                  className="max-w-full flex-1 overflow-hidden rounded-full px-3 py-1 text-[11px] font-medium [overflow-wrap:anywhere]"
                  title={shiplog.project.name}
                >
                  <span className="block min-w-0 truncate text-foreground/90">{formatProjectName(shiplog.project.name)}</span>
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
              {shiplog.content}
            </p>
            {shiplog.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <div className="mt-3 flex w-full justify-center overflow-hidden rounded-xl border border-border/40 bg-muted/20">
                <img
                  src={shiplog.imageUrl}
                  alt="Shiplog attachment"
                  className="h-full max-h-64 w-full object-contain p-2"
                />
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  )
}
