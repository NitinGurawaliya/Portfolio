import { Bell } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface UpvoteNotification {
  id: string
  projectId: number
  projectName: string
  totalUpvotes: number
  createdAt: string
  actor?: {
    id: number
    name: string | null
    githubUsername: string | null
    avatarUrl: string | null
  }
}

interface UpvoteNotificationsBellProps {
  notifications: UpvoteNotification[]
  unreadCount: number
  onOpenChange?: (open: boolean) => void
}

export function UpvoteNotificationsBell({
  notifications,
  unreadCount,
  onOpenChange,
}: UpvoteNotificationsBellProps) {
  const badgeContent = unreadCount > 9 ? "9+" : unreadCount.toString()

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full border border-border/60 bg-background/80 shadow-sm transition-all hover:border-border hover:bg-background"
          aria-label="Upvote notifications"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white shadow-lg">
              {badgeContent}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[320px] p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Recent upvotes</p>
          <span className="text-xs font-medium text-muted-foreground">
            {notifications.length} अपडेट{notifications.length === 1 ? "" : "s"}
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center gap-1 px-6 py-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground">अभी कोई नया upvote नहीं</p>
            <p className="text-xs text-muted-foreground/80">
              जैसे ही आपके प्रोजेक्ट को upvote मिलेगा, आपको यहाँ सूचनाएँ दिखेंगी।
            </p>
          </div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto py-1">
            {notifications.map((notification) => {
              const createdAt = new Date(notification.createdAt)

              const username =
                notification.actor?.githubUsername ||
                notification.actor?.name ||
                "किसी ने"

              const avatarFallback =
                notification.actor?.githubUsername?.[0] ||
                notification.actor?.name?.[0] ||
                "U"

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-3 rounded-none px-3 py-2 focus:bg-muted/60 focus:text-foreground"
                >
                  <Avatar className="h-8 w-8 border border-border/50 shadow-sm">
                    {notification.actor?.avatarUrl ? (
                      <AvatarImage src={notification.actor.avatarUrl} alt={username} />
                    ) : null}
                    <AvatarFallback className="bg-orange-500/20 text-xs font-semibold text-orange-700">
                      {avatarFallback.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-sm font-semibold text-foreground line-clamp-1">
                      {notification.projectName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {username} ने आपके प्रोजेक्ट को upvote किया। कुल {notification.totalUpvotes} upvotes।
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground/80">
                      {createdAt.toLocaleString()}
                    </span>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
