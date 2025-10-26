"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectIcon } from "@/components/ui/project-icon"
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
  ArrowRight,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  GripVertical,
  BarChart3
} from "lucide-react"
import { IndividualProjectChart } from "@/components/IndividualProjectChart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Repository {
  id: number
  portfolioRepositoryId?: number // PortfolioRepository ID for analytics
  name: string
  fullName: string
  description: string
  htmlUrl: string
  homepage?: string
  language: string
  languages?: string[] // All languages used in the repo
  stargazersCount: number
  forksCount: number
  isPrivate: boolean
  isFork: boolean
  size: number
  createdAt: string
  updatedAt: string
  pushedAt: string
  isImported?: boolean
  favicon?: string
  logo?: string
  siteName?: string
  keywords?: string
  author?: string
}

interface SelectedRepository extends Repository {
  deployedUrl?: string
  customName?: string
  customDescription?: string
}

interface PortfolioRepository {
  id: number
  deployedUrl: string
  customName?: string
  customDescription?: string
  isVisible: boolean
  name: string
  description: string
  language: string
  languages?: string[]
  stargazersCount: number
  forksCount: number
  updatedAt: string
  htmlUrl: string
  repository: {
    id: number
    name: string
    description: string
    htmlUrl: string
    githubUrl?: string
    language: string
    stargazersCount: number
    forksCount: number
    isImported?: boolean
    favicon?: string
    logo?: string
    homepage?: string
  }
}

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
  analytics?: any
  portfolioId?: number
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
  onAddImportedProject,
  analytics,
  portfolioId
}: ReposSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deployedUrls, setDeployedUrls] = useState<Record<number, string>>(initialDeployedUrls || {})
  const [githubUrls, setGithubUrls] = useState<Record<number, string>>(initialGithubUrls || {})
  const [editingRepo, setEditingRepo] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [customNames, setCustomNames] = useState<Record<number, string>>(initialCustomNames || {})
  const [customDescriptions, setCustomDescriptions] = useState<Record<number, string>>(initialCustomDescriptions || {})
  const [customTechnologies, setCustomTechnologies] = useState<Record<number, string>>({})
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [projectUrl, setProjectUrl] = useState("")
  const [isImportingUrl, setIsImportingUrl] = useState(false)
  
  // Track initialization to prevent triggering changes during initial load
  const [isInitialized, setIsInitialized] = useState(false)
  const hasInitializedFromProps = useRef(false)
  
  // Use parent's repoOrder or initialize locally
  const [localRepoOrder, setLocalRepoOrder] = useState<number[]>(initialRepoOrder || [])

  const filteredRepos = repositories.filter(repo =>
    !selectedRepos.includes(repo.id) && (
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const selectedRepositories: (PortfolioRepository & { portfolioRepositoryId?: number })[] = repositories
    .filter(repo => selectedRepos.includes(repo.id))
    .map(repo => ({
      id: repo.id,
      portfolioRepositoryId: repo.portfolioRepositoryId,
      deployedUrl: deployedUrls[repo.id] || '',
      customName: customNames[repo.id] || '',
      customDescription: customDescriptions[repo.id] || '',
      isVisible: true,
      name: repo.name,
      description: repo.description,
      language: repo.language,
      languages: repo.languages,
      stargazersCount: repo.stargazersCount,
      forksCount: repo.forksCount,
      updatedAt: repo.updatedAt,
      htmlUrl: repo.htmlUrl,
      repository: {
        id: repo.id,
        name: repo.name,
        description: repo.description,
        htmlUrl: repo.htmlUrl,
        language: repo.language,
        stargazersCount: repo.stargazersCount,
        forksCount: repo.forksCount,
        isImported: repo.isImported,
        favicon: repo.favicon,
        logo: repo.logo,
        homepage: repo.homepage
      }
    }))
    .sort((a, b) => {
      const indexA = localRepoOrder.indexOf(a.id)
      const indexB = localRepoOrder.indexOf(b.id)
      if (indexA === -1 && indexB === -1) return 0
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Auto-fill fields for GitHub projects
  useEffect(() => {
    // Only auto-fill after initialization to prevent triggering change detection during initial load
    if (!isInitialized) return
    
    const updates: Record<number, string> = {}
    selectedRepositories.forEach(repo => {
      // If it's a GitHub project and has deployed URL, pre-fill it
      if (repo.repository.htmlUrl && !deployedUrls[repo.id]) {
        // Check if repo has homepage URL from GitHub
        if (repo.repository.homepage) {
          updates[repo.id] = repo.repository.homepage || ''
        }
      }
    })
    
    // Only update if there are changes to avoid infinite loops
    if (Object.keys(updates).length > 0) {
      setDeployedUrls(prev => ({ ...prev, ...updates }))
    }
  }, [selectedRepositories, isInitialized]) // Added isInitialized to dependencies

  // Debug logging
  useEffect(() => {
    console.log("🔍 ReposSection Debug:", {
      repositories: repositories.length,
      selectedRepos,
      localRepoOrder,
      selectedRepositories: selectedRepositories.length,
      portfolioId,
      portfolioIdType: typeof portfolioId,
      portfolioIdValid: portfolioId && portfolioId !== undefined
    })
    
    if (!portfolioId || portfolioId === undefined) {
      console.error('❌ ReposSection: portfolioId is undefined or invalid:', portfolioId)
    }
  }, [repositories, selectedRepos, localRepoOrder, selectedRepositories, portfolioId])

  // Sync with parent's repoOrder
  useEffect(() => {
    if (initialRepoOrder && initialRepoOrder.length > 0) {
      setLocalRepoOrder(initialRepoOrder)
      hasInitializedFromProps.current = true
    }
  }, [initialRepoOrder])

  useEffect(() => {
    // Only update repo order after initialization to prevent triggering change detection during initial load
    if (!isInitialized) return
    
    // Don't call parent callback if we just initialized from props
    // This prevents triggering change detection during initial sync
    const shouldSyncToParent = !hasInitializedFromProps.current
    
    // Initialize or update order when selected repos change
    if (selectedRepos.length > 0) {
      setLocalRepoOrder(prev => {
        // If empty, initialize with selected repos
        if (prev.length === 0) {
          const newOrder = selectedRepos
          // Only sync to parent if not initializing from props
          if (shouldSyncToParent) {
            // Use setTimeout to avoid setState during render
            setTimeout(() => onUpdateRepoOrder(newOrder), 0)
          }
          return newOrder
        }
        // If new repos added, add them to the end
        const newRepos = selectedRepos.filter(id => !prev.includes(id))
        const removedRepos = prev.filter(id => !selectedRepos.includes(id))
        // Remove repos that were unselected and add new ones
        const newOrder = [...prev.filter(id => !removedRepos.includes(id)), ...newRepos]
        // Only sync to parent if not initializing from props
        if (shouldSyncToParent) {
          // Use setTimeout to avoid setState during render
          setTimeout(() => onUpdateRepoOrder(newOrder), 0)
        }
        return newOrder
      })
    } else {
      setLocalRepoOrder([])
      // Only sync to parent if not initializing from props
      if (shouldSyncToParent) {
        // Use setTimeout to avoid setState during render
        setTimeout(() => onUpdateRepoOrder([]), 0)
      }
    }
    
    // Mark that we're done initializing from props
    if (hasInitializedFromProps.current) {
      hasInitializedFromProps.current = false
    }
    
    console.log("ReposSection - Selected repos:", selectedRepos)
    console.log("ReposSection - Deployed URLs:", deployedUrls)
    console.log("ReposSection - Selected repositories:", selectedRepositories.map(r => ({ id: r.id, name: r.name })))
  }, [selectedRepos, isInitialized])

  useEffect(() => {
    if (initialDeployedUrls && Object.keys(initialDeployedUrls).length > 0) {
      console.log("Syncing deployed URLs from props:", initialDeployedUrls)
      setDeployedUrls(prev => {
        // Only update if there are actual differences
        const hasChanges = JSON.stringify(prev) !== JSON.stringify(initialDeployedUrls)
        if (hasChanges) {
          console.log("Deployed URLs changed, updating...")
          return initialDeployedUrls
        }
        return prev
      })
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
      
      // Remove from order
      setLocalRepoOrder(prev => {
        const newOrder = prev.filter(id => id !== repoId)
        onUpdateRepoOrder(newOrder)
        return newOrder
      })
      
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

  const handleMoveUp = (repoId: number) => {
    setLocalRepoOrder(prev => {
      const currentIndex = prev.indexOf(repoId)
      if (currentIndex > 0) {
        const newOrder = [...prev]
        // Swap current with previous
        ;[newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]]
        onUpdateRepoOrder(newOrder) // Update parent state
        return newOrder
      }
      return prev
    })
  }

  const handleMoveDown = (repoId: number) => {
    setLocalRepoOrder(prev => {
      const currentIndex = prev.indexOf(repoId)
      if (currentIndex < prev.length - 1 && currentIndex !== -1) {
        const newOrder = [...prev]
        // Swap current with next
        ;[newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]]
        onUpdateRepoOrder(newOrder) // Update parent state
        return newOrder
      }
      return prev
    })
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

  const handleInlineEdit = (repoId: number, field: 'name' | 'description' | 'deployedUrl' | 'technologies', value: string) => {
    // Update local state immediately
    if (field === 'name') {
      setCustomNames(prev => ({ ...prev, [repoId]: value }))
      onUpdateCustomName(repoId, value)
    } else if (field === 'description') {
      setCustomDescriptions(prev => ({ ...prev, [repoId]: value }))
      onUpdateCustomDescription(repoId, value)
    } else if (field === 'deployedUrl') {
      setDeployedUrls(prev => ({
        ...prev,
        [repoId]: value
      }))
      onUpdateDeployedUrl(repoId, value)
    } else if (field === 'technologies') {
      setCustomTechnologies(prev => ({ ...prev, [repoId]: value }))
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
        console.log("🔄 Adding imported project:", projectData)
        onAddImportedProject(projectData)
      }
      
      // Set deployed URL to the original URL since this is the live project
      const newDeployedUrls = { ...deployedUrls, [projectData.id]: projectUrl.trim() }
      setDeployedUrls(newDeployedUrls)
      console.log("✅ Imported project setup complete for ID:", projectData.id)
      
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

  // GitHub URL validation
  const isValidGitHubUrl = (url: string) => {
    const githubRegex = /^https?:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/
    return githubRegex.test(url)
  }

  const handleGithubUrlChange = (repoId: number, url: string) => {
    setGithubUrls(prev => ({
      ...prev,
      [repoId]: url
    }))
    onUpdateGithubUrl?.(repoId, url)
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
              <CardTitle className="text-lg text-black flex items-center justify-between font-bold">
                <div className="flex items-center">
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
                </div>
                
                {/* Input Section integrated with title */}
                <div className="flex items-center gap-2">
                  {/* Simple Input Box */}
                  <motion.div 
                    className="relative"
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LinkIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      placeholder="Project URL"
                      value={projectUrl}
                      onChange={(e) => setProjectUrl(e.target.value)}
                      className="pl-7 pr-8 bg-white border border-gray-300 text-black font-medium h-8 text-xs focus:border-gray-400 transition-all duration-300 w-48"
                      onKeyDown={(e) => e.key === 'Enter' && projectUrl.trim() && handleUrlImport()}
                    />
                    {/* Inline Add Button */}
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
                          className="h-6 w-6 p-0 bg-black text-white hover:bg-gray-800 transition-all duration-300 rounded"
                        >
                          {isImportingUrl ? (
                            <Loader2 className="h-2 w-2 animate-spin" />
                          ) : (
                            <Plus className="h-2 w-2" />
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* GitHub Dropdown */}
                  <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative z-50"
                      >
                        <Button className="bg-black text-white rounded-lg hover:bg-gray-800 flex items-center space-x-1 font-medium h-8 text-xs transition-all duration-300 px-2">
                          <Github className="h-3 w-3" />
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
            
            <div className="grid grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
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
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                      layout
                      layoutId={`repo-${repo.id}`}
                    >
                      <Card 
                        className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 group h-[450px] relative"
                      >
                        <CardContent className="p-0 h-full">
                          <div className="flex flex-col h-full px-3 relative">

                            {/* Delete Button - Appears on hover */}
                            <motion.div
                              className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              initial={{ opacity: 0 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                onClick={() => handleRemoveRepo(repo.id)}
                                variant="destructive"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-full shadow-md hover:shadow-lg"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </motion.div>

                            {/* Project Icon at the top */}
                            <div className="mb-2">
                              <ProjectIcon
                                favicon={repo.repository.favicon}
                                logo={repo.repository.logo}
                                title={customName || repo.name}
                                size="md"
                              />
                            </div>
                            
                            {/* Project Name - Limited */}
                            <div className="mb-2">
                              <motion.div
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Input
                                  value={customName}
                                  onChange={(e) => handleInlineEdit(repo.id, 'name', e.target.value)}
                                  className="text-sm font-bold border-0 bg-transparent p-0 focus:bg-gray-50 focus:border-2 border-gray-300 focus:p-1 transition-all duration-300 text-black placeholder:text-gray-400 truncate"
                                  placeholder="Project name"
                                  maxLength={20}
                                />
                              </motion.div>
                            </div>

                            {/* Project Description - Limited */}
                            <div className="mb-1 flex-1">
                              <motion.div
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Input
                                  value={customDescription}
                                  onChange={(e) => handleInlineEdit(repo.id, 'description', e.target.value)}
                                  className="text-xs text-gray-600 border-0 bg-transparent p-0 focus:bg-gray-50 focus:border-2 border-gray-300 focus:p-1 transition-all duration-300 placeholder:text-gray-400 line-clamp-2"
                                  placeholder="Project description"
                                  maxLength={60}
                                />
                              </motion.div>
                            </div>

                            {/* Analytics - Times Visited */}
                            <div className="absolute top-2 right-2 text-right">
                              <div className="text-xs font-bold text-gray-600">Times visited</div>
                              <div className="text-lg font-bold text-black">
                                {(() => {
                                  // Use PortfolioRepository ID for matching analytics
                                  const portfolioRepoId = repo.portfolioRepositoryId;
                                  const projectData = analytics?.detailed?.projects?.find((p: any) => p.projectId == portfolioRepoId);
                                  if (!portfolioRepoId) {
                                    console.warn(`⚠️ No portfolioRepositoryId for repo ${repo.name} (GitHub ID: ${repo.id})`);
                                  }
                                  if (portfolioRepoId && analytics?.detailed?.projects) {
                                    console.log(`🔍 Looking for portfolioRepoId ${portfolioRepoId} in analytics, found:`, projectData);
                                  }
                                  return projectData?.clickCount || 0;
                                })()}
                              </div>
                            </div>

                            {/* Project Views Chart */}
                            {portfolioId ? (
                              <div className="mt-1 flex-1 flex flex-col">
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded overflow-hidden">
                                  <IndividualProjectChart 
                                    portfolioId={portfolioId}
                                    projectId={repo.portfolioRepositoryId || repo.id}
                                    projectName={customName || repo.name}
                                    size="lg"
                                    className="h-full w-full"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1 flex-1 flex flex-col">
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                                  <div className="text-xs text-gray-400 text-center px-2">
                                    Loading portfolio...
                                  </div>
                                </div>
                              </div>
                            )}
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