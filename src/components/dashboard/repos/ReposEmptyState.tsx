import { motion } from "framer-motion"
import { Github, Code2, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ReposEmptyStateProps {
  onBrowseGitHub: () => void
  variants?: {
    hidden: { opacity: number; y: number }
    visible: { opacity: number; y: number }
  }
}

export function ReposEmptyState({ onBrowseGitHub, variants }: ReposEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      variants={variants}
    >
      <Card className="bg-white transition-all duration-300 dark:bg-background">
        <CardContent className="pt-8">
          <div className="text-center py-8">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Code2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-3">No projects selected</h3>
            <p className="text-gray-600 font-medium mb-6 max-w-md mx-auto">
              Import repositories from GitHub to showcase your work and build an impressive portfolio
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onBrowseGitHub}
                className="bg-black text-white hover:bg-gray-800 font-bold px-8 py-3  transition-all duration-300 dark:bg-white dark:text-black"
              >
                <motion.div
                  className="flex items-center"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Github className="h-5 w-5 mr-2" />
                  Browse GitHub Repositories
                  <ArrowRight className="h-4 w-4 ml-2" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
