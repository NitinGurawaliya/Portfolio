/**
 * Refactored ReposSection - Using smaller components and hooks
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Code2, Github, ArrowRight } from "lucide-react"
import { Repository } from "@/types/portfolio.types"
import { RepoCard, RepoSearch, UrlImport } from "./repos"
import { useRepositories } from "@/hooks/useRepositories"

interface ReposSectionProps {
  repositories: Repository[]
  selectedRepos: number[]
  deployedUrls: Record<number, string>
  customNames?: Record<number, string>
  customDescriptions?: Record<number, string>
  githubUrls?: Record<number, string>
  repoOrder?: number[]
  onToggleRepo: (repoId: number) => void
  onUpdateDeployedUrl: (repoId: number, url: string) => void
  onUpdateCustomName: (repoId: number, name: string) => void
  onUpdateCustomDescription: (repoId: number, description: string) => void
  onUpdateGithubUrl?: (repoId: number, url: string) => void
  onUpdateRepoOrder: (newOrder: number[]) => void
  onAddImportedProject?: (project: Repository) => void
}

export function ReposSection({ 
  repositories, 
  selectedRepos,
  deployedUrls: initialDeployedUrls,
  customNames: initialCustomNames,
  customDescriptions: initialCustomDescriptions,
  githubUrls: initialGithubUrls,
  repoOrder: initialRepoOrder,
  onToggleRepo,
  onUpdateDeployedUrl,
  onUpdateCustomName,
  onUpdateCustomDescription,
  onUpdateGithubUrl,
  onUpdateRepoOrder,
  onAddImportedProject
}: ReposSectionProps) {
  const [deployedUrls, setDeployedUrls] = useState<Record<number, string>>(initialDeployedUrls || {})
  const [customNames, setCustomNames] = useState<Record<number, string>>(initialCustomNames || {})
  const [customDescriptions, setCustomDescriptions] = useState<Record<number, string>>(initialCustomDescriptions || {})
  const [customTechnologies, setCustomTechnologies] = useState<Record<number, string>>({})
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [localRepoOrder, setLocalRepoOrder] = useState<number[]>(initialRepoOrder || [])

  // Use the useRepositories hook
  const {
    importProjectFromUrl,
    moveRepoUp,
    moveRepoDown,
    removeRepo
  } = useRepositories({
    onRepoToggle: onToggleRepo,
    onDeployedUrlUpdate: onUpdateDeployedUrl,
    onCustomNameUpdate: onUpdateCustomName,
    onCustomDescriptionUpdate: onUpdateCustomDescription,
    onGithubUrlUpdate: onUpdateGithubUrl,
    onRepoOrderUpdate: onUpdateRepoOrder,
    onImportedProjectAdd: onAddImportedProject
  })

  const selectedRepositories = repositories
    .filter(repo => selectedRepos.includes(repo.id))
    .sort((a, b) => {
      const indexA = localRepoOrder.indexOf(a.id)
      const indexB = localRepoOrder.indexOf(b.id)
      if (indexA === -1 && indexB === -1) return 0
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })

  // Sync with parent's repoOrder
  useEffect(() => {
    if (initialRepoOrder && initialRepoOrder.length > 0) {
      setLocalRepoOrder(initialRepoOrder)
    }
  }, [initialRepoOrder])

  useEffect(() => {
    if (selectedRepos.length > 0) {
      setLocalRepoOrder(prev => {
        if (prev.length === 0) {
          const newOrder = selectedRepos
          onUpdateRepoOrder(newOrder)
          return newOrder
        }
        const newRepos = selectedRepos.filter(id => !prev.includes(id))
        const removedRepos = prev.filter(id => !selectedRepos.includes(id))
        const newOrder = [...prev.filter(id => !removedRepos.includes(id)), ...newRepos]
        onUpdateRepoOrder(newOrder)
        return newOrder
      })
    } else {
      setLocalRepoOrder([])
      onUpdateRepoOrder([])
    }
  }, [selectedRepos, onUpdateRepoOrder])

  useEffect(() => {
    if (initialDeployedUrls) {
      setDeployedUrls(initialDeployedUrls)
    }
  }, [initialDeployedUrls])

  const handleImportRepo = async (repo: Repository) => {
    try {
      const deployedUrl = repo.homepage || ""
      const newDeployedUrls = { ...deployedUrls }
      if (deployedUrl) {
        newDeployedUrls[repo.id] = deployedUrl
        setDeployedUrls(newDeployedUrls)
      }
      onToggleRepo(repo.id)
      setIsDropdownOpen(false)
    } catch (error) {
      console.error("Error importing repository:", error)
    }
  }

  const handleRemoveRepo = async (repoId: number) => {
    const newOrder = removeRepo(repoId, localRepoOrder)
    setLocalRepoOrder(newOrder)
    
    setCustomNames(prev => {
      const newNames = { ...prev }
      delete newNames[repoId]
      return newNames
    })
    setCustomDescriptions(prev => {
      const newDescriptions = { ...prev }
      delete newDescriptions[repoId]
      return newDescriptions
    })
  }

  const handleInlineEdit = (repoId: number, field: 'name' | 'description' | 'deployedUrl' | 'technologies', value: string) => {
    if (field === 'name') {
      setCustomNames(prev => ({ ...prev, [repoId]: value }))
      onUpdateCustomName(repoId, value)
    } else if (field === 'description') {
      setCustomDescriptions(prev => ({ ...prev, [repoId]: value }))
      onUpdateCustomDescription(repoId, value)
    } else if (field === 'deployedUrl') {
      setDeployedUrls(prev => ({ ...prev, [repoId]: value }))
      onUpdateDeployedUrl(repoId, value)
    } else if (field === 'technologies') {
      setCustomTechnologies(prev => ({ ...prev, [repoId]: value }))
    }
  }

  const handleUrlImport = async (url: string) => {
    const projectData = await importProjectFromUrl(url)
    if (projectData) {
      const newDeployedUrls = { ...deployedUrls, [projectData.id]: url }
      setDeployedUrls(newDeployedUrls)
      
      setCustomNames(prev => ({
        ...prev,
        [projectData.id]: projectData.name
      }))
      setCustomDescriptions(prev => ({
        ...prev,
        [projectData.id]: projectData.description
      }))
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white transition-all duration-300">
          <CardHeader className="pb-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CardTitle className="text-lg text-black flex items-center font-bold">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Code2 className="h-5 w-5 mr-2" />
                </motion.div>
                Projects
              </CardTitle>
              <motion.p 
                className="text-gray-600 mt-1 font-medium text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Showcase your best work by importing repositories from GitHub
              </motion.p>
            </motion.div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Project Input and GitHub Dropdown */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white transition-all duration-300">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
              {/* URL Import Component */}
              <UrlImport onImport={handleUrlImport} />

              <motion.div 
                className="text-gray-400 text-sm font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Or
              </motion.div>

              {/* GitHub Repo Search Component */}
              <RepoSearch
                repositories={repositories}
                selectedRepos={selectedRepos}
                isOpen={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
                onSelectRepo={handleImportRepo}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Repositories */}
      <AnimatePresence>
        {selectedRepositories.length > 0 && (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            variants={itemVariants}
          >
            <div className="grid gap-2">
              <AnimatePresence mode="popLayout">
                {selectedRepositories.map((repo, index) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    index={index}
                    totalRepos={selectedRepositories.length}
                    customName={customNames[repo.id] || repo.name}
                    customDescription={customDescriptions[repo.id] || repo.description}
                    deployedUrl={deployedUrls[repo.id] || ""}
                    customTechnologies={customTechnologies[repo.id] || ""}
                    onNameChange={(value) => handleInlineEdit(repo.id, 'name', value)}
                    onDescriptionChange={(value) => handleInlineEdit(repo.id, 'description', value)}
                    onDeployedUrlChange={(value) => handleInlineEdit(repo.id, 'deployedUrl', value)}
                    onTechnologiesChange={(value) => handleInlineEdit(repo.id, 'technologies', value)}
                    onMoveUp={() => {
                      const newOrder = moveRepoUp(repo.id, localRepoOrder)
                      setLocalRepoOrder(newOrder)
                    }}
                    onMoveDown={() => {
                      const newOrder = moveRepoDown(repo.id, localRepoOrder)
                      setLocalRepoOrder(newOrder)
                    }}
                    onRemove={() => handleRemoveRepo(repo.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {selectedRepositories.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          <Card className="bg-white transition-all duration-300">
            <CardContent className="pt-8">
              <div className="text-center py-8">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Code2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-bold text-black mb-3">No projects selected</h3>
                <p className="text-gray-600 font-medium mb-6 max-w-md mx-auto">
                  Import repositories from GitHub to showcase your work and build an impressive portfolio
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => setIsDropdownOpen(true)}
                    className="bg-black text-white hover:bg-gray-800 font-bold px-8 py-3 transition-all duration-300"
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
      )}
    </motion.div>
  )
}

