"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  ExternalLink,
  Heart,
  Loader2,
  TrendingUp,
  Zap,
} from "lucide-react"
import { Sparkles } from "lucide-react"

export interface FeaturedPortfolio {
  id: number
  username: string
  displayName: string
  jobTitle?: string | null
  bio?: string | null
  profilePic?: string | null
  selectedTheme: string
  skills: Array<{
    name: string
    category: string | null
  }>
  repositories: Array<{
    name: string
    language: string | null
    stargazersCount: number
  }>
  updatedAt: string
  portfolioUrl: string
  totalViews: number
}

interface WallOfFameClientProps {
  portfolios: FeaturedPortfolio[] | null
  loading?: boolean
  error?: string | null
}

export function WallOfFameClient({
  portfolios,
  loading = false,
  error = null,
}: WallOfFameClientProps) {
  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Loading portfolios...
            </span>
          </div>
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
              <span>Ready for liftoff</span>
            </div>

            <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Be the first on the wall of fame
            </h2>
            <p className="mb-8 text-sm text-muted-foreground sm:text-base">
              Publish your DevFolio portfolio to claim a top spot when the wall
              refreshes.
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

  const statCards = [
    {
      label: `${portfolios.reduce(
        (acc, current) => acc + (current.totalViews || 0),
        0
      )} total views`,
      icon: TrendingUp,
      accent: "text-green-500",
    },
    {
      label: `${portfolios[0]?.totalViews ?? 0} views today`,
      icon: Zap,
      accent: "text-orange-500",
    },
    {
      label: "Loved by developers",
      icon: Heart,
      accent: "text-rose-500",
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1 text-xs sm:text-sm">
              <span className="mr-2">🔥</span>
              <span>Top portfolios this week</span>
            </div>

            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Wall of fame
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              A curated showcase of the three most viewed DevFolio portfolios.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground sm:text-sm"
        >
          {statCards.map(({ label, icon: Icon, accent }, index) => (
            <div key={index} className="flex items-center">
              <Icon className={`mr-2 h-4 w-4 ${accent}`} />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {portfolios.map((portfolio, index) => (
            <motion.div
              key={portfolio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 * index }}
            >
              <Link
                href={portfolio.portfolioUrl}
                target="_blank"
                className="block h-full"
              >
                <Card className="group h-full border-border/40 bg-card/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-5 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarImage
                            src={portfolio.profilePic ?? undefined}
                            alt={portfolio.displayName}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {portfolio.displayName?.charAt(0) ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          
                          <h3 className="font-semibold text-foreground">
                            {portfolio.displayName}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            @{portfolio.username}
                          </p>
                          {portfolio.jobTitle ? (
                            <p className="text-xs text-muted-foreground/80">
                              {portfolio.jobTitle}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    </div>

                    <div className="mb-5 min-h-[3rem]">
                      {portfolio.bio ? (
                        <p className="line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                          {portfolio.bio}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground/60 italic">
                          Developer creating amazing projects
                        </p>
                      )}
                    </div>

                    <div className="mb-6 flex-1">
                      {portfolio.repositories.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Featured projects
                          </h4>
                          <ul className="space-y-2">
                            {portfolio.repositories.map((repo, repoIndex) => (
                              <li
                                key={repoIndex}
                                className="flex items-center gap-2"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span className="text-sm font-medium text-foreground">
                                  {repo.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Featured projects
                          </h4>
                          <p className="text-sm text-muted-foreground/60 italic">
                            Projects coming soon
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

