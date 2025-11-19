"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { Loader2, Sparkles, ArrowRight } from "lucide-react"
import { CommunityPortfolio } from "@/lib/services/wall-of-fame"
import { Skeleton } from "@/components/ui/skeleton"

interface WallOfFameClientProps {
  portfolios: CommunityPortfolio[] | null
  loading?: boolean
  error?: string | null
}

export function WallOfFameClient({ portfolios, loading = false, error = null }: WallOfFameClientProps) {
  if (loading) {
    return (
      <section className="">
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Skeleton className="h-7 md:h-8 lg:h-9 w-48 mx-auto mb-1" />
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="grid grid-flow-col auto-cols-[220px] grid-rows-3 gap-3 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                <div key={index} className="block h-full">
                  <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  if (error || !portfolios || portfolios.length === 0) {
    return (
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-border/40 bg-card/70 p-10 shadow-sm backdrop-blur"
          >
            <div className="mb-4 inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1 text-xs sm:text-sm">
              <span className="mr-2">🚀</span>
              <span>Community launchpad</span>
            </div>

              <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">Add your portfolio</h2>
              <p className="mb-8 text-sm text-muted-foreground sm:text-base">
                Publish on DevFolio and join the gallery of builders.
              </p>
            <Button size="lg" asChild>
              <Link href="/auth">
                <Sparkles className="mr-2 h-4 w-4" />
                Create Your Portfolio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    )
  }

  const filteredPortfolios = portfolios.filter((portfolio) => portfolio.projectsCount > 0)
  if (filteredPortfolios.length === 0) {
    return null
  }
  return (
    <section className="">
      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            
            <h2 className="mb-2 text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1">Featured Portfolios</h2>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="grid grid-flow-col auto-cols-[220px] grid-rows-3 gap-3 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filteredPortfolios.map((portfolio) => (
              <Link
                key={portfolio.id}
                href={portfolio.portfolioUrl}
                target="_blank"
                  className="block h-full"
              >
                <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 transition hover:border-gray-300">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-gray-600">
                      <AvatarImage src={portfolio.profilePic ?? undefined} alt={portfolio.displayName} />
                      <AvatarFallback className="bg-gray-50 text-gray-900">
                        {portfolio.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight">{portfolio.displayName}</p>
                      <p className="text-xs text-gray-500">@{portfolio.username}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                    <span>{portfolio.projectsCount === 1 ? "1 project" : `${portfolio.projectsCount} projects`}</span>
                    <span className="font-semibold uppercase tracking-wider text-gray-500">View →</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

