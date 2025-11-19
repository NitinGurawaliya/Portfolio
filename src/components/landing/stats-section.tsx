"use client"

import { useEffect, useState } from "react"
import { Users, FolderKanban, Briefcase, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface Stats {
  users: number
  projects: number
  portfolios: number
  profileVisits: number
}

export function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/landing/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading || !stats) {
    return (
      <section className="px-4 py-12 sm:px-8 lg:px-12 xl:px-20">
        <div className="w-full">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="mb-2 text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1">Devfolio Statistics</h2>
            </motion.div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg border border-border/40 bg-card p-4 sm:p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-8 sm:h-9 w-20 mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k"
    }
    return num.toLocaleString()
  }

  const statCards = [
    {
      icon: Users,
      title: "Users",
      value: stats.users,
      subtitle: "Active developers",
      color: "text-purple-500",
    },
    {
      icon: FolderKanban,
      title: "Projects",
      value: stats.projects,
      subtitle: "Showcased projects",
      color: "text-purple-500",
    },
    {
      icon: Briefcase,
      title: "Portfolios",
      value: stats.portfolios,
      subtitle: "Published portfolios",
      color: "text-purple-500",
    },
    {
      icon: Eye,
      title: "Profile Visits",
      value: stats.profileVisits,
      subtitle: "Total profile views",
      color: "text-purple-500",
    },
  ]

  return (
    <section className=" px-4 py-12 sm:px-8 lg:px-12 xl:px-20">
      <div className="w-full">
      <div className="mx-auto mb-8 max-w-2xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            
            <h2 className="mb-2 text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1">Devfolio Statistics</h2>
          </motion.div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg border border-border/40 bg-card p-4 sm:p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                      <h3 className="text-sm font-medium text-foreground">
                        {stat.title}
                      </h3>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                      {formatNumber(stat.value)}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

