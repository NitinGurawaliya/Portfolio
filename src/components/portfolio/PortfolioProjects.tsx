/**
 * Portfolio Projects Component - Project cards section
 */

"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Github, ExternalLink, Star, GitFork } from "lucide-react"
import { PortfolioRepository } from "@/types/portfolio.types"

interface PortfolioProjectsProps {
  repositories: PortfolioRepository[]
}

export function PortfolioProjects({ repositories }: PortfolioProjectsProps) {
  if (repositories.length === 0) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <section className="mb-16">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold mb-8 flex items-center gap-2"
      >
        <Github className="h-8 w-8" />
        Projects
      </motion.h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {repositories.map((repo, index) => (
          <motion.div key={repo.id} variants={itemVariants}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {repo.customName || repo.repository.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {repo.customDescription || repo.repository.description}
                </p>

                {/* Language Badge */}
                {repo.repository.language && (
                  <Badge variant="secondary" className="mb-4">
                    {repo.repository.language}
                  </Badge>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  {repo.repository.stargazersCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{repo.repository.stargazersCount}</span>
                    </div>
                  )}
                  {repo.repository.forksCount > 0 && (
                    <div className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      <span>{repo.repository.forksCount}</span>
                    </div>
                  )}
                </div>

                {/* Links */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <a
                      href={repo.repository.htmlUrl || repo.repository.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Code
                    </a>
                  </Button>
                  {repo.deployedUrl && (
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <a
                        href={repo.deployedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

