"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { Loader2, Sparkles, ArrowRight } from "lucide-react"
import { CommunityPortfolio } from "@/lib/services/wall-of-fame"

interface WallOfFameClientProps {
  portfolios: CommunityPortfolio[] | null
  loading?: boolean
  error?: string | null
}

export function WallOfFameClient({ portfolios, loading = false, error = null }: WallOfFameClientProps) {
  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Portfolios लोड हो रहे हैं…</span>
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
              <span>Community launchpad</span>
            </div>

            <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">अपना पोर्टफोलियो जोड़ें</h2>
            <p className="mb-8 text-sm text-muted-foreground sm:text-base">
              DevFolio पर पोर्टफोलियो पब्लिश करें और हज़ारों बिल्डर्स की सूची में जुड़ें।
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

  const visiblePortfolios = portfolios.slice(0, 9)

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-4 inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1 text-xs sm:text-sm">
              <span className="mr-2">🌍</span>
              <span>DevFolio community</span>
            </div>
            <h2 className="mb-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Builders on display</h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              सभी लाइव पोर्टफोलियो — तीन कतारों में देखें और तुरंत प्रोफ़ाइल खोलें।
            </p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePortfolios.map((portfolio) => (
              <Link key={portfolio.id} href={portfolio.portfolioUrl} target="_blank" className="block h-full">
                <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 transition hover:border-gray-300">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-gray-600">
                      <AvatarImage src={portfolio.profilePic ?? undefined} alt={portfolio.displayName} />
                      <AvatarFallback className="bg-gray-50 text-gray-900">
                        {portfolio.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-base font-semibold leading-tight">{portfolio.displayName}</p>
                      <p className="text-xs text-gray-500">@{portfolio.username}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <span>{portfolio.projectsCount === 1 ? "1 project" : `${portfolio.projectsCount} projects`}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">View →</span>
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

