"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { FeedTopNav } from "@/components/feed/FeedTopNav"
import { FeedBrandMark } from "@/components/feed/FeedBrandMark"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Users as UsersIcon, FolderOpen } from "lucide-react"
import { SkillIcon, getSkillIcon } from "@/lib/skill-icons"

interface FeedUser {
  id: number
  username: string
  name: string
  profilePic: string | null
  bio: string | null
  skills: Array<{ id: number; name: string; category: string | null }>
  profileViews: number
  projectsCount: number
  portfolioUrl: string
}

export default function UsersFeedPage() {
  const [users, setUsers] = useState<FeedUser[]>([])
  const [loading, setLoading] = useState(false) // Start with false to not block redirects
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchUsers = useCallback(
    async (targetPage: number, append: boolean = false) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const response = await fetch(`/api/feed/users?page=${targetPage}&limit=10`, {
          cache: "no-store",
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data?.error || "Users feed could not be loaded.")
        }

        const data = await response.json()
        const incomingUsers: FeedUser[] = data.users ?? []

        if (append) {
          setUsers((prev) => [...prev, ...incomingUsers])
        } else {
          setUsers(incomingUsers)
        }
        setPage(data.page ?? targetPage)
        setHasMore(Boolean(data.hasMore))
      } catch (err) {
        console.error("❌ Feed: Failed to fetch users:", err)
        setError(err instanceof Error ? err.message : "Something went wrong.")
      } finally {
        if (append) {
          setLoadingMore(false)
        } else {
          setLoading(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    // Fetch in background without blocking
    fetchUsers(1)
  }, [fetchUsers])

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore) return
    const nextPage = page + 1
    fetchUsers(nextPage, true)
  }, [fetchUsers, hasMore, loadingMore, page])

  const handleRetry = useCallback(() => {
    fetchUsers(1)
  }, [fetchUsers])

  const content = useMemo(() => {
    if (loading && users.length === 0) {
      return <UsersFeedSkeletonList />
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <p className="text-base font-medium text-foreground">{error}</p>
          <Button onClick={handleRetry} className="rounded-full">
            Try again
          </Button>
        </div>
      )
    }

    if (users.length === 0) {
      return (
        <Card className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/60 py-16 text-center">
          <p className="text-lg font-medium text-foreground">No users yet.</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Be the first to publish your portfolio and join the community.
          </p>
          <Button asChild className="rounded-full px-6">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </Card>
      )
    }

    return (
      <div className="relative flex flex-col gap-4 sm:gap-3">
        {users.map((user) => (
          <UserFeedCard key={user.id} user={user} />
        ))}
        {loadingMore && <UsersFeedSkeletonList count={2} />}
      </div>
    )
  }, [error, handleRetry, loading, loadingMore, users])

  return (
    <>
      <FeedTopNav />
      <div className="mx-auto grid min-h-screen w-full max-w-4xl grid-cols-1 gap-6 px-3 pb-10 pt-8 sm:px-4 sm:pt-10 lg:h-[calc(100vh-3rem)] lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-8 lg:overflow-hidden lg:pb-8 lg:pt-5">
        <aside className="sticky top-24 hidden h-fit lg:block lg:w-[240px] lg:top-6 xl:w-[260px]">
          <Card className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-background p-6">
            <FeedBrandMark />
            <nav className="space-y-3 text-sm font-semibold text-muted-foreground">
              <Link
                href="/feed/projects"
                className="group flex items-center mt-2 gap-3 rounded-2xl border border-transparent px-4 py-3 hover:border-border/70 hover:bg-muted/40"
              >
                <FolderOpen className="h-4 w-4 text-foreground" />
                <span className="text-foreground">Projects</span>
              </Link>
              <Link
                href="/feed/users"
                className="group flex mt-1 items-center gap-3 rounded-2xl border border-border/70 bg-foreground px-4 py-3 text-background"
              >
                <UsersIcon className="h-4 w-4" />
                Users
              </Link>
            </nav>
          </Card>
        </aside>

        <div className="flex flex-col gap-5 lg:col-start-2 lg:mx-auto lg:h-full lg:w-full lg:max-w-4xl lg:overflow-y-auto lg:pr-2 lg:scroll-smooth lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col gap-3 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Discover DevFolio Users
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {content}

            {hasMore && !error && users.length > 0 && !loading && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="rounded-full border border-border/60 px-6 text-sm font-semibold"
                >
                  {loadingMore ? "Loading..." : "Load more users"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function UserFeedCard({ user }: { user: FeedUser }) {
  return (
    <Card className="group relative w-full rounded-xl border border-border/25 bg-background p-4 sm:p-5 transition hover:border-border/50 hover:bg-background/95">
      <Link href={user.portfolioUrl} className="block">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Profile Picture - Smaller */}
          <div className="flex-shrink-0">
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden border border-border/20">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-base font-semibold text-gray-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {user.name}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                <Eye className="h-3.5 w-3.5" />
                <span className="font-medium">{user.profileViews.toLocaleString()}</span>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Skills - Only logos, overlapping, colored */}
            {user.skills.length > 0 && (
              <div className="flex items-center gap-0 mt-1">
                {user.skills.slice(0, 12).map((skill, index) => {
                  return (
                    <div
                      key={skill.id}
                      className="relative -ml-1.5 first:ml-0"
                      style={{ zIndex: user.skills.length - index }}
                      title={skill.name}
                    >
                      <div className="h-6 w-6 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                        <SkillIcon skillName={skill.name} className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  )
                })}
                {user.skills.length > 12 && (
                  <div className="relative -ml-1.5 h-6 w-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm">
                    <span className="text-[8px] font-bold text-gray-900">
                      +{user.skills.length - 12}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  )
}

function UsersFeedSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="mx-auto w-full max-w-2xl gap-0 rounded-xl border border-border/25 bg-background/70 p-0 shadow-none"
        >
          <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5">
            <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-5 w-32 rounded-full" />
                </div>
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <div className="flex items-center gap-0 pt-1">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full -ml-2" />
                <Skeleton className="h-6 w-6 rounded-full -ml-2" />
                <Skeleton className="h-6 w-6 rounded-full -ml-2" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}


