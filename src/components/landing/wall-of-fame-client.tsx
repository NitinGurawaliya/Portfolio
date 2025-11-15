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
              सभी लाइव पोर्टफोलियो — swipe करें और किसी भी क्रिएटर के पेज पर सीधे जाएँ।
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {portfolios.map((portfolio) => (
              <Link
                href={portfolio.portfolioUrl}
                key={portfolio.id}
                className="min-w-[180px] snap-start sm:min-w-[220px]"
                target="_blank"
              >
                <motion.article
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 text-white shadow-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-white/20">
                      <AvatarImage src={portfolio.profilePic ?? undefined} alt={portfolio.displayName} />
                      <AvatarFallback className="bg-white/10 text-white">
                        {portfolio.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-base font-semibold leading-tight">{portfolio.displayName}</p>
                      <p className="text-xs text-white/70">@{portfolio.username}</p>
                      <p className="text-[11px] text-white/60">
                        {portfolio.projectsCount === 1 ? "1 project" : `${portfolio.projectsCount} projects`}
                      </p>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

