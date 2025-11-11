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
                <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-medium">
                  {shiplog.project.name}
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{shiplog.content}</p>
            {shiplog.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shiplog.imageUrl}
                alt="Shiplog attachment"
                className="mt-3 max-h-52 w-full rounded-xl object-cover"
              />
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  )
}
