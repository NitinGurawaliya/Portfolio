/**
 * Repository Card Component - Individual repo display
 */

"use client"

import { Repository } from "@/types/portfolio.types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
  Github, 
  ExternalLink, 
  Star, 
  GitFork,
  ChevronUp,
  ChevronDown,
  Trash2
} from "lucide-react"
import { getLanguageColor } from "@/constants/language-colors"

interface RepoCardProps {
  repo: Repository
  index: number
  totalRepos: number
  customName: string
  customDescription: string
  deployedUrl: string
  customTechnologies: string
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onDeployedUrlChange: (value: string) => void
  onTechnologiesChange: (value: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

export function RepoCard({
  repo,
  index,
  totalRepos,
  customName,
  customDescription,
  deployedUrl,
  customTechnologies,
  onNameChange,
  onDescriptionChange,
  onDeployedUrlChange,
  onTechnologiesChange,
  onMoveUp,
  onMoveDown,
  onRemove
}: RepoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      layout
      layoutId={`repo-${repo.id}`}
    >
      <Card className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 group">
        <CardContent className="p-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Project Name - Inline Editable */}
              <motion.div
                className="mb-3"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  value={customName}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="text-lg font-bold border-0 bg-transparent p-0 focus:bg-gray-50 focus:border-2 border-gray-300 focus:p-2 transition-all duration-300 text-black placeholder:text-gray-400"
                  placeholder="Project name"
                />
              </motion.div>

              {/* Project Description - Inline Editable */}
              <motion.div
                className="mb-4"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  value={customDescription}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  className="text-gray-700 font-medium border-0 bg-transparent p-0 focus:bg-gray-50 focus:border-2 border-gray-300 focus:p-2 transition-all duration-300 placeholder:text-gray-400"
                  placeholder="Project description"
                />
              </motion.div>

              {/* Repository Stats & Technologies */}
              <div className="mb-3">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  {/* Display all languages from the repository */}
                  {repo.languages && repo.languages.length > 0 ? (
                    repo.languages.map((lang, idx) => (
                      <div key={idx} className="flex items-center px-2 py-1 bg-gray-100 rounded-md">
                        <motion.div 
                          className={`w-2.5 h-2.5 rounded-full ${getLanguageColor(lang)} mr-1.5`}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="font-bold text-xs text-gray-700">{lang}</span>
                      </div>
                    ))
                  ) : repo.language && (
                    <div className="flex items-center px-2 py-1 bg-gray-100 rounded-md">
                      <motion.div 
                        className={`w-2.5 h-2.5 rounded-full ${getLanguageColor(repo.language)} mr-1.5`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="font-bold text-xs text-gray-700">{repo.language}</span>
                    </div>
                  )}
                  {/* Display custom additional technologies */}
                  {customTechnologies && customTechnologies.split(',').map((tech, idx) => (
                    tech.trim() && (
                      <div key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                        {tech.trim()}
                      </div>
                    )
                  ))}
                </div>
                <div className="flex items-center space-x-5 text-sm text-gray-600 font-medium">
                  {repo.stargazersCount >= 10 && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      <span className="font-bold">{repo.stargazersCount}</span>
                    </div>
                  )}
                  {repo.forksCount >= 10 && (
                    <div className="flex items-center">
                      <GitFork className="h-4 w-4 mr-1 text-blue-500" />
                      <span className="font-bold">{repo.forksCount}</span>
                    </div>
                  )}
                  <div className="text-xs">
                    Updated {new Date(repo.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Additional Technologies Input */}
              <div className="mt-3">
                <Label htmlFor={`tech-${repo.id}`} className="text-black font-bold mb-2 block text-sm">
                  Other Technologies (comma-separated)
                </Label>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    id={`tech-${repo.id}`}
                    value={customTechnologies || ""}
                    onChange={(e) => onTechnologiesChange(e.target.value)}
                    placeholder="e.g., React, Node.js, MongoDB"
                    className="border-0 bg-transparent p-0 focus:bg-gray-50 focus:border-2 border-gray-300 focus:p-2 transition-all duration-300 font-medium text-sm text-black placeholder:text-gray-400"
                  />
                </motion.div>
              </div>

              {/* Deployed URL Input - Inline Editable */}
              <div className="mt-3">
                <Label htmlFor={`deployed-${repo.id}`} className="text-black font-bold mb-2 block text-sm">
                  Deployed URL (optional)
                </Label>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    id={`deployed-${repo.id}`}
                    value={deployedUrl || ""}
                    onChange={(e) => onDeployedUrlChange(e.target.value)}
                    placeholder="Auto-filled from GitHub or add custom URL"
                    className="border-0 bg-transparent p-0 focus:bg-gray-50 focus:border-2 border-gray-300 focus:p-2 transition-all duration-300 font-medium text-sm text-black placeholder:text-gray-400"
                  />
                </motion.div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 ml-6">
              {/* Reorder Buttons */}
              <div className="flex space-x-1 mb-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onMoveUp()
                    }}
                    disabled={index === 0}
                    className="h-7 w-7 p-0 text-gray-700 hover:bg-gray-100 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onMoveDown()
                    }}
                    disabled={index === totalRepos - 1}
                    className="h-7 w-7 p-0 text-gray-700 hover:bg-gray-100 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
              <div className="flex space-x-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(repo.htmlUrl, '_blank')}
                    className="text-black border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 font-bold h-8 px-3 transition-colors"
                  >
                    <Github className="h-3 w-3 mr-1" />
                    GitHub
                  </Button>
                </motion.div>
                {deployedUrl && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(deployedUrl, '_blank')}
                      className="text-black border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 font-bold h-8 px-3 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Live
                    </Button>
                  </motion.div>
                )}
              </div>
              
              {/* Delete Button - Show on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 px-2 font-bold"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

