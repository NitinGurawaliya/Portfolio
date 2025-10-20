/**
 * Portfolio Header Component - Profile section
 */

"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Building, Globe } from "lucide-react"
import { Portfolio } from "@/types/portfolio.types"

interface PortfolioHeaderProps {
  portfolio: Portfolio
}

export function PortfolioHeader({ portfolio }: PortfolioHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <Avatar className="w-32 h-32 mx-auto mb-6 ring-4 ring-primary/20">
          <AvatarImage src={portfolio.profilePic} alt={portfolio.displayName} />
          <AvatarFallback className="text-4xl">
            {portfolio.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-bold mb-2"
      >
        {portfolio.displayName}
      </motion.h1>

      {portfolio.jobTitle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Badge variant="secondary" className="mb-4 text-sm">
            {portfolio.jobTitle}
          </Badge>
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6"
      >
        {portfolio.bio}
      </motion.p>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap"
      >
        {portfolio.user.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{portfolio.user.location}</span>
          </div>
        )}
        {portfolio.user.company && (
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span>{portfolio.user.company}</span>
          </div>
        )}
        {portfolio.user.websiteUrl && (
          <a
            href={portfolio.user.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>Website</span>
          </a>
        )}
      </motion.div>
    </motion.div>
  )
}

