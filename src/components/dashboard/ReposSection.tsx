"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { 
  Github, 
  ExternalLink, 
  Star, 
  GitFork,
  Search,
  Code2,
  ChevronDown,
  Plus,
  Edit3,
  Save,
  X,
  Link as LinkIcon,
  Trash2,
  Check,
  Loader2,
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Repository {
  id: number
  name: string
  fullName: string
  description: string
  htmlUrl: string
  homepage?: string
  language: string
  stargazersCount: number
  forksCount: number
  isPrivate: boolean
  isFork: boolean
  size: number
  createdAt: string
  updatedAt: string
  pushedAt: string
  isImported?: boolean
}

interface SelectedRepository extends Repository {
  deployedUrl?: string
  customName?: string
  customDescription?: string
}

interface ReposSectionProps {
  repositories: Repository[]
  selectedRepos: number[]
  deployedUrls: Record<number, string>
  onToggleRepo: (repoId: number) => void
  onUpdateDeployedUrl: (repoId: number, url: string) => void
  onAddImportedProject?: (project: Repository) => void
}

export function ReposSection({ 
  repositories, 
  selectedRepos,
  deployedUrls: initialDeployedUrls,
  onToggleRepo,
  onUpdateDeployedUrl,
  onAddImportedProject
}: ReposSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deployedUrls, setDeployedUrls] = useState<Record<number, string>>(initialDeployedUrls || {})
  const [editingRepo, setEditingRepo] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [customNames, setCustomNames] = useState<Record<number, string>>({})
  const [customDescriptions, setCustomDescriptions] = useState<Record<number, string>>({})
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [projectUrl, setProjectUrl] = useState("")
  const [isImportingUrl, setIsImportingUrl] = useState(false)

  const filteredRepos = repositories.filter(repo =>
    !selectedRepos.includes(repo.id) && (
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const selectedRepositories = repositories.filter(repo => selectedRepos.includes(repo.id))

  useEffect(() => {
    console.log("ReposSection - Selected repos:", selectedRepos)
    console.log("ReposSection - Deployed URLs:", deployedUrls)
    console.log("ReposSection - Selected repositories:", selectedRepositories.map(r => ({ id: r.id, name: r.name })))
  }, [selectedRepos, deployedUrls, selectedRepositories])

  useEffect(() => {
    if (initialDeployedUrls) {
      console.log("Syncing deployed URLs from props:", initialDeployedUrls)
      setDeployedUrls(initialDeployedUrls)
    }
  }, [initialDeployedUrls])

  const handleDeployedUrlChange = (repoId: number, url: string) => {
    setDeployedUrls(prev => ({
      ...prev,
      [repoId]: url
    }))
    onUpdateDeployedUrl(repoId, url)
  }

  const handleImportRepo = async (repo: Repository) => {
    
    try {
      // Get deployed URL from GitHub homepage field if available
      const deployedUrl = repo.homepage || ""
      const newDeployedUrls = { ...deployedUrls }
      if (deployedUrl) {
        newDeployedUrls[repo.id] = deployedUrl
        setDeployedUrls(newDeployedUrls)
      }
      
      onToggleRepo(repo.id)
      
      // Only close dropdown after successful save
      setIsDropdownOpen(false)
    } catch (error) {
      console.error("Error importing repository:", error)
    }
  }

  const handleRemoveRepo = async (repoId: number) => {
    
    try {
      const newSelectedRepos = selectedRepos.filter(id => id !== repoId)
      const newDeployedUrls = { ...deployedUrls }
      delete newDeployedUrls[repoId]
      
      onToggleRepo(repoId)
      
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
    } catch (error) {
      console.error("Error removing repository:", error)
    }
  }

  const handleEditRepo = (repoId: number) => {
    setEditingRepo(repoId)
    const repo = repositories.find(r => r.id === repoId)
    if (repo) {
      setCustomNames(prev => ({
        ...prev,
        [repoId]: prev[repoId] || repo.name
      }))
      setCustomDescriptions(prev => ({
        ...prev,
        [repoId]: prev[repoId] || repo.description
      }))
    }
  }

  const handleSaveEdit = (repoId: number) => {
    setEditingRepo(null)
  }

  const handleCancelEdit = (repoId: number) => {
    setEditingRepo(null)
    const repo = repositories.find(r => r.id === repoId)
    if (repo) {
      setCustomNames(prev => ({
        ...prev,
        [repoId]: repo.name
      }))
      setCustomDescriptions(prev => ({
        ...prev,
        [repoId]: repo.description
      }))
    }
  }

  const handleInlineEdit = (repoId: number, field: 'name' | 'description' | 'deployedUrl', value: string) => {
    // Update local state immediately
    if (field === 'name') {
      setCustomNames(prev => ({ ...prev, [repoId]: value }))
    } else if (field === 'description') {
      setCustomDescriptions(prev => ({ ...prev, [repoId]: value }))
    } else if (field === 'deployedUrl') {
      setDeployedUrls(prev => ({
        ...prev,
        [repoId]: value
      }))
      onUpdateDeployedUrl(repoId, value)
    }
  }

  const handleUrlImport = async () => {
    if (!projectUrl.trim()) return
    
    setIsImportingUrl(true)
    try {
      // Extract metadata from URL
      const metadataResponse = await fetch('/api/extract-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: projectUrl.trim() })
      })

      if (!metadataResponse.ok) {
        throw new Error('Failed to extract metadata from URL')
      }

      const { projectData, metadata } = await metadataResponse.json()
      
      // Add to imported projects if callback is provided
      if (onAddImportedProject) {
        onAddImportedProject(projectData)
      }
      
      // Set deployed URL to the original URL since this is the live project
      const newDeployedUrls = { ...deployedUrls, [projectData.id]: projectUrl.trim() }
      setDeployedUrls(newDeployedUrls)
      
      // Add the imported project to the parent state
      if (onAddImportedProject) {
        onAddImportedProject(projectData)
      }
      onToggleRepo(projectData.id)
      
      // Clear the input
      setProjectUrl("")
      
      // Add to custom names and descriptions
      setCustomNames(prev => ({
        ...prev,
        [projectData.id]: projectData.name
      }))
      setCustomDescriptions(prev => ({
        ...prev,
        [projectData.id]: projectData.description
      }))

    } catch (error) {
      console.error("Error importing project from URL:", error)
      alert("Failed to import project. Please check the URL and try again.")
    } finally {
      setIsImportingUrl(false)
    }
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-400',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-orange-500',
      'React': 'bg-cyan-500',
      'Vue': 'bg-emerald-500',
      'Angular': 'bg-red-500',
      'Node.js': 'bg-green-600',
      'Go': 'bg-cyan-600',
      'Rust': 'bg-orange-600',
      'C++': 'bg-blue-600',
      'C#': 'bg-purple-500',
      'CSS': 'bg-pink-500',
      'HTML': 'bg-orange-400',
      'PHP': 'bg-indigo-500',
      'Ruby': 'bg-red-600',
      'Swift': 'bg-orange-500',
      'Kotlin': 'bg-purple-600',
    }
    return colors[language] || 'bg-gray-500'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
        <Card className="bg-white   transition-all duration-300">
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
                <motion.div
                  className="ml-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                </motion.div>
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
        <Card className="bg-white   transition-all duration-300">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
              {/* Project URL Input with inline button */}
              <motion.div 
                className="flex-1 min-w-[220px] relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Put your project URL here"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  className="pl-10 pr-12 bg-gray-50  text-black font-medium h-9 text-sm focus:bg-white transition-all duration-300"
                  onKeyDown={(e) => e.key === 'Enter' && projectUrl.trim() && handleUrlImport()}
                />
                {/* Inline Add Button - only show when there's text */}
                {projectUrl.trim() && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    <Button
                      onClick={handleUrlImport}
                      disabled={isImportingUrl}
                      className="h-7 w-7 p-0 bg-black text-white hover:bg-gray-800 transition-all duration-300 rounded"
                    >
                      {isImportingUrl ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </Button>
                  </motion.div>
                )}
              </motion.div>

              <motion.div 
                className="text-gray-400 text-sm font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Or
              </motion.div>

              {/* GitHub Dropdown */}
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-50"
                  >
                    <Button className="bg-black text-white rounded-lg hover:bg-gray-800 flex items-center space-x-2 font-medium h-9 text-sm transition-all duration-300">
                      <Github className="h-3 w-3" />
                      {/* <span>GitHub</span> */}
                      <motion.div
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
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
                        className="pl-10 bg-gray-50  text-black font-medium h-9 text-sm focus:bg-white"
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
                            onClick={() => handleImportRepo(repo)}
                            className="p-3 hover:bg-gray-50 cursor-pointer   transition-all duration-300"
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
            {/* <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-lg font-bold text-black">Selected Projects</h3>
              <motion.div
                className="bg-black text-white px-2 py-0.5 rounded-full font-medium text-xs"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                {selectedRepositories.length}
              </motion.div>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-4 w-4 text-black" />
              </motion.div>
            </motion.div> */}
            
            <div className="grid gap-2">
              <AnimatePresence>
                {selectedRepositories.map((repo, index) => {
                  const isEditing = editingRepo === repo.id
                  const customName = customNames[repo.id] || repo.name
                  const customDescription = customDescriptions[repo.id] || repo.description
                  
                  return (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.4,
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      layout
                    >
                      <Card 
                        className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 group"
                      >
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
                                  onChange={(e) => handleInlineEdit(repo.id, 'name', e.target.value)}
                                  className="text-lg font-bold border-0 bg-transparent p-0 focus:bg-gray-50 focus:border-2 /80 focus:p-2 transition-all duration-300"
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
                                  onChange={(e) => handleInlineEdit(repo.id, 'description', e.target.value)}
                                  className="text-gray-600 font-medium border-0 bg-transparent p-0 focus:bg-gray-50 focus:border-2 /80 focus:p-2 transition-all duration-300"
                                  placeholder="Project description"
                                />
                              </motion.div>

                              {/* Repository Stats */}
                              <div className="flex items-center space-x-5 text-sm text-gray-600 mb-3 font-medium">
                                {repo.language && (
                                  <div className="flex items-center">
                                    <motion.div 
                                      className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)} mr-2`}
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <span className="font-bold">{repo.language}</span>
                                  </div>
                                )}
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
                                    value={deployedUrls[repo.id] || ""}
                                    onChange={(e) => handleInlineEdit(repo.id, 'deployedUrl', e.target.value)}
                                    placeholder="Auto-filled from GitHub or add custom URL"
                                    className="border-0 bg-transparent p-0 focus:bg-gray-50 focus:border-2 /80 focus:p-2 transition-all duration-300 font-medium text-sm"
                                  />
                                </motion.div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col space-y-2 ml-6">
                              <div className="flex space-x-2">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(repo.htmlUrl, '_blank')}
                                    className="  hover:bg-black hover:text-white font-bold h-8 px-3"
                                  >
                                    <Github className="h-3 w-3 mr-1" />
                                    GitHub
                                  </Button>
                                </motion.div>
                                {deployedUrls[repo.id] && (
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(deployedUrls[repo.id], '_blank')}
                                      className="  hover:bg-black hover:text-white font-bold h-8 px-3"
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
                                    onClick={() => handleRemoveRepo(repo.id)}
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
                })}
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
          <Card className="bg-white   transition-all duration-300">
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
                    className="bg-black text-white hover:bg-gray-800 font-bold px-8 py-3  transition-all duration-300"
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