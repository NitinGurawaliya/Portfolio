/**
 * Repository Search Component - Search and select GitHub repos
 */

"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Repository } from "@/types/portfolio.types"
import { 
  Github, 
  Search, 
  Star, 
  GitFork,
  ArrowRight,
  Code2,
  ChevronDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getLanguageColor } from "@/constants/language-colors"

interface RepoSearchProps {
  repositories: Repository[]
  selectedRepos: number[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSelectRepo: (repo: Repository) => void
}

export function RepoSearch({
  repositories,
  selectedRepos,
  isOpen,
  onOpenChange,
  onSelectRepo
}: RepoSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRepos = repositories.filter(repo =>
    !selectedRepos.includes(repo.id) && (
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-50"
        >
          <Button className="bg-black text-white rounded-lg hover:bg-gray-800 flex items-center space-x-2 font-medium h-9 text-sm transition-all duration-300">
            <Github className="h-3 w-3" />
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-3 w-3" />
            </motion.div>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 bg-white shadow-2xl z-[60]">
        <motion.div 
          className="p-4 border-b border-gray-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 text-black font-medium h-9 text-sm focus:bg-white"
            />
          </div>
        </motion.div>
        <div className="max-h-80 overflow-y-auto scrollbar-hide">
          {filteredRepos.length === 0 ? (
            <motion.div 
              className="p-6 text-gray-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Code2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">
                {searchTerm ? "No repositories found" : "All repositories imported"}
              </p>
            </motion.div>
          ) : (
            filteredRepos.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DropdownMenuItem
                  onClick={() => onSelectRepo(repo)}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-center gap-3 w-full">
                    <motion.div>
                      <Github className="h-5 w-5 text-black" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-black font-medium truncate text-sm">
                          {repo.name}
                        </span>
                        {repo.isPrivate && (
                          <Badge variant="secondary" className="bg-black text-white text-[10px] font-medium">
                            Private
                          </Badge>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-gray-600 text-xs truncate mt-0.5 font-medium">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-3 mt-1.5">
                        {repo.language && (
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)} mr-1.5`}></div>
                            <span className="text-gray-600 text-[10px] font-medium">{repo.language}</span>
                          </div>
                        )}
                        {repo.stargazersCount >= 10 && (
                          <div className="flex items-center text-gray-600 text-[10px] font-medium">
                            <Star className="h-2.5 w-2.5 mr-1" />
                            {repo.stargazersCount}
                          </div>
                        )}
                        {repo.forksCount >= 10 && (
                          <div className="flex items-center text-gray-600 text-[10px] font-medium">
                            <GitFork className="h-2.5 w-2.5 mr-1" />
                            {repo.forksCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="h-4 w-4 text-black" />
                    </motion.div>
                  </div>
                </DropdownMenuItem>
              </motion.div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

