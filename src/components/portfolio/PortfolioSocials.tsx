/**
 * Portfolio Socials Component - Social media links
 */

"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Social } from "@/types/portfolio.types"
import { getPlatformConfig } from "@/constants/social-platforms"

interface PortfolioSocialsProps {
  socials: Social[]
}

export function PortfolioSocials({ socials }: PortfolioSocialsProps) {
  const pinnedSocials = socials.filter(s => s.isPinned)

  if (pinnedSocials.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="flex items-center justify-center gap-3 flex-wrap mb-12"
    >
      {pinnedSocials.map((social, index) => {
        const config = getPlatformConfig(social.platform)
        if (!config) return null

        const Icon = config.icon

        return (
          <motion.div
            key={social.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + index * 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2"
            >
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon className="h-4 w-4" />
                {config.name}
              </a>
            </Button>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

