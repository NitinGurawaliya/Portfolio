"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { 
  Github, 
  Star, 
  ExternalLink, 
  Users, 
  Code2, 
  Sparkles,
  ArrowRight,
  Loader2,
  Zap,
  TrendingUp,
  Heart
} from "lucide-react"
import Link from "next/link"

interface FeaturedPortfolio {
  id: number
  username: string
  displayName: string
  jobTitle?: string
  bio?: string
  profilePic?: string
  selectedTheme: string
  skills: Array<{
    name: string
    category: string
  }>
  repositories: Array<{
    name: string
    language: string
    stargazersCount: number
  }>
  updatedAt: string
  portfolioUrl: string
}

interface WallOfFameProps {
  limit?: number
}

export function WallOfFame({ limit = 6 }: WallOfFameProps) {
  const [portfolios, setPortfolios] = useState<FeaturedPortfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPortfolios()
  }, [limit])

  const fetchPortfolios = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/portfolios/featured?limit=${limit}`)
      const data = await response.json()

      if (data.success) {
        setPortfolios(data.portfolios)
      } else {
        setError(data.error || "Failed to load portfolios")
      }
    } catch (err) {
      setError("Failed to load portfolios")
    } finally {
      setLoading(false)
    }
  }

  const getSkillColor = (category: string) => {
    const colors: Record<string, string> = {
      'Frontend': 'bg-blue-100 text-blue-800',
      'Backend': 'bg-green-100 text-green-800',
      'Full Stack': 'bg-purple-100 text-purple-800',
      'Mobile': 'bg-orange-100 text-orange-800',
      'DevOps': 'bg-red-100 text-red-800',
      'Data Science': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors['Other']
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-100 text-yellow-800',
      'TypeScript': 'bg-blue-100 text-blue-800',
      'Python': 'bg-green-100 text-green-800',
      'Java': 'bg-red-100 text-red-800',
      'React': 'bg-cyan-100 text-cyan-800',
      'Node.js': 'bg-green-100 text-green-800',
      'Vue': 'bg-emerald-100 text-emerald-800',
      'Angular': 'bg-red-100 text-red-800'
    }
    return colors[language] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading live portfolios...</span>
          </div>
        </div>
      </section>
    )
  }

  if (error || portfolios.length === 0) {
    return (
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1 text-xs sm:text-sm">
                <span className="mr-2">🚀</span>
                <span>Live & Active</span>
              </div>
              
              <h2 className="mb-6 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance leading-tight">
                Join the{" "}
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  community
                </span>
              </h2>
              
              <p className="mb-8 text-base sm:text-lg text-muted-foreground text-pretty">
                Be the first to showcase your amazing work with DevFolio
              </p>
              
              <Button size="lg" className="text-sm sm:text-base" asChild>
                <Link href="/auth">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Your Portfolio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container px-4 sm:px-6 mx-auto">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1 text-xs sm:text-sm">
              <span className="mr-2">🔥</span>
              <span>Live & Active</span>
            </div>
            
            <h2 className="mb-6 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance leading-tight">
              See what{" "}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                developers are building
              </span>
            </h2>
            
            <p className="text-base sm:text-lg text-muted-foreground text-pretty">
              Real portfolios from developers who actually ship stuff
            </p>
          </motion.div>
        </div>

        {/* Live Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
            <span>{portfolios.length}+ portfolios created</span>
          </div>
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-2 text-orange-500" />
            <span>Updated daily</span>
          </div>
          <div className="flex items-center">
            <Heart className="h-4 w-4 mr-2 text-red-500" />
            <span>Loved by developers</span>
          </div>
        </motion.div>

        {/* Portfolio Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio, index) => (
            <motion.div
              key={portfolio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <Link href={portfolio.portfolioUrl} target="_blank" className="block h-full">
                <Card className="group hover:shadow-xl transition-all duration-300 border-border/40 bg-card/50 backdrop-blur h-full cursor-pointer">
                  <CardContent className="p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start mb-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarImage src={portfolio.profilePic} alt={portfolio.displayName} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {portfolio.displayName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {portfolio.displayName}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            @{portfolio.username}
                          </p>
                          {portfolio.jobTitle && (
                            <p className="text-xs text-muted-foreground truncate">
                              {portfolio.jobTitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                    </div>

                    {/* Bio - Fixed height */}
                    <div className="mb-6 min-h-[3rem]">
                      {portfolio.bio ? (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {portfolio.bio}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground/60 italic">
                          Developer creating amazing projects
                        </p>
                      )}
                    </div>

                    {/* Projects - Clean list */}
                    <div className="mb-6 flex-1">
                      {portfolio.repositories.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Featured Projects
                          </h4>
                          <div className="space-y-2">
                            {portfolio.repositories.slice(0, 3).map((repo, repoIndex) => (
                              <div key={repoIndex} className="flex items-center space-x-3">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                                <span className="text-sm text-foreground truncate font-medium">
                                  {repo.name}
                                </span>
                              </div>
                            ))}
                            {portfolio.repositories.length > 3 && (
                              <div className="text-xs text-muted-foreground ml-4">
                                +{portfolio.repositories.length - 3} more projects
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Featured Projects
                          </h4>
                          <div className="text-sm text-muted-foreground/60 italic">
                            Projects coming soon
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Ready to join them?
          </p>
          <Button size="lg" className="text-sm sm:text-base" asChild>
            <Link href="/auth">
              <Github className="mr-2 h-4 w-4" />
              Create Your Portfolio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
