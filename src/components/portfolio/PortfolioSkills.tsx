/**
 * Portfolio Skills Component - Skills showcase
 */

"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Wrench } from "lucide-react"
import { Skill } from "@/types/portfolio.types"

interface PortfolioSkillsProps {
  skills: Skill[]
}

export function PortfolioSkills({ skills }: PortfolioSkillsProps) {
  if (skills.length === 0) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <section className="mb-16">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold mb-8 flex items-center gap-2"
      >
        <Wrench className="h-8 w-8" />
        Skills & Technologies
      </motion.h2>

      <div className="space-y-6">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3 text-muted-foreground">
              {category}
            </h3>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-2"
            >
              {categorySkills.map((skill) => (
                <motion.div key={skill.id} variants={itemVariants}>
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    {skill.name}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}

