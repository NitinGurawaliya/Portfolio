import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ReposSectionHeaderProps {
  onAddProject: () => void
}

export function ReposSectionHeader({ onAddProject }: ReposSectionHeaderProps) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="-mt-6 md:-mt-8">
      <Card className="bg-white shadow-none border-none dark:bg-background">
        <CardHeader className="py-0">
          <CardTitle className="text-xl md:text-2xl text-black dark:text-white flex items-center font-bold">
            Projects
            <div className="ml-auto">
              <Button
                onClick={onAddProject}
                className="dark:bg-white dark:text-black bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs"
              >
                + Add Project (Ctrl+K)
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
    </motion.div>
  )
}
