"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface TopUser {
  id: number
  name: string
  avatarUrl: string | null
  username: string | null
  views: number
}

export function TrustedBySection() {
  const [users, setUsers] = useState<TopUser[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          fetch("/api/landing/top-users"),
          fetch("/api/landing/stats"),
        ])

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData.users || [])
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setTotalUsers(statsData.users || 0)
        }
      } catch (error) {
        console.error("Error fetching trusted by data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <section className="pt-4 sm:pt-6 pb-12 sm:pb-16 lg:pb-20">
        <div className="w-full">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex items-center gap-4">
              {/* Profile Pictures Skeleton */}
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((index) => (
                  <Skeleton
                    key={index}
                    className="relative inline-block w-8 h-8 rounded-full border-2 border-background flex-shrink-0"
                    style={{ zIndex: 5 - index }}
                  />
                ))}
              </div>

              {/* Text Skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 sm:h-5 w-32 sm:w-40" />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (users.length === 0) {
    return null
  }

  return (
    <section className="pt-4 sm:pt-6 pb-12  sm:pb-16 lg:pb-20">
      <div className="w-full">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-4">
            {/* Profile Pictures */}
            <div className="flex -space-x-3">
              {users.slice(0, 5).map((user, index) => (
                <Link
                  key={user.id}
                  href={user.username ? `/${user.username}` : "#"}
                  className="relative inline-block w-8 h-8 rounded-full border-2 border-background hover:scale-110 transition-transform duration-200 overflow-hidden flex-shrink-0"
                  style={{ zIndex: 5 - index }}
                >
                  <Image
                    src={user.avatarUrl || "/favicon.png"}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="w-8 h-8 rounded-full object-cover"
                    unoptimized={user.avatarUrl ? user.avatarUrl.startsWith("http") : false}
                  />
                </Link>
              ))}
            </div>

            {/* Text */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Trusted by{" "}
                <span className="font-semibold text-foreground">
                  {totalUsers >= 100 ? `${totalUsers}+` : "100+"}
                </span>{" "}
                <span className="text-primary font-medium">developers</span>
              </span>
              {/* <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

