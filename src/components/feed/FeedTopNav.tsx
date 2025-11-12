import Link from "next/link"
import { usePathname } from "next/navigation"
import { FolderOpen, PenSquare } from "lucide-react"

import { cn } from "@/lib/utils"

const FEED_LINKS = [
  {
    href: "/feed/projects",
    label: "Projects",
    icon: FolderOpen,
  },
  {
    href: "/feed/shiplog",
    label: "Shiplogs",
    icon: PenSquare,
  },
]

interface FeedTopNavProps {
  className?: string
}

export function FeedTopNav({ className }: FeedTopNavProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full bg-background/90 px-3 pb-1.5 pt-2 backdrop-blur sm:px-4 lg:hidden",
        className
      )}
    >
      <nav className="flex w-full items-center justify-center gap-2 rounded-full border border-border/40 bg-background/80 px-2 py-1.5 shadow-sm">
        {FEED_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2",
                isActive
                  ? "bg-foreground text-background shadow-sm"
                  : "hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

