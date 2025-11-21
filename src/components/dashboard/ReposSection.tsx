"use client"

import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react"
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
  MoreVertical,
  BarChart3
} from "lucide-react"
import { IndividualProjectChart } from "@/components/IndividualProjectChart"
import { AddProjectModal, ProjectInsightsPayload } from "./AddProjectModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditProjectModal as EditModal } from "./EditProjectModal"
import { Skeleton } from "@/components/ui/skeleton"
import toast from "react-hot-toast"
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
  projectCategories?: Record<number, string>
  projectStatuses?: Record<number, string>
  projectRevenues?: Record<number, number>
  projectMrrs?: Record<number, number>
  projectUsers?: Record<number, number>
  projectTechnologies?: Record<number, string>
  repoOrder?: number[]
  onToggleRepo: (repoId: number) => void
  onUpdateDeployedUrl: (repoId: number, url: string) => void
  onUpdateCustomName: (repoId: number, name: string) => void
  onUpdateCustomDescription: (repoId: number, description: string) => void
  onUpdateGithubUrl?: (repoId: number, url: string) => void
  onUpdateProjectCategory?: (repoId: number, category: string | null) => void
  onUpdateProjectStatus?: (repoId: number, status: string | null) => void
  onUpdateProjectRevenue?: (repoId: number, value: number | null) => void
  onUpdateProjectMrr?: (repoId: number, value: number | null) => void
  onUpdateProjectUsers?: (repoId: number, value: number | null) => void
  onUpdateProjectTechnologies?: (repoId: number, value: string | null) => void
  onUpdateRepoOrder: (newOrder: number[]) => void
  onAddImportedProject?: (project: Repository) => void
  analytics?: any
  portfolioId?: number
  onUpdateLogo?: (repoId: number, logo: string | null) => void
  logoOverrides?: Record<number, string>
  isLoading?: boolean
  onNavigateToSection?: (section: string) => void
}

export function ReposSection({ 
  repositories, 
  selectedRepos,
  deployedUrls: initialDeployedUrls,
  customNames: initialCustomNames,
  customDescriptions: initialCustomDescriptions,
  githubUrls: initialGithubUrls,
  projectCategories: initialProjectCategories,
  projectStatuses: initialProjectStatuses,
  projectRevenues: initialProjectRevenues,
  projectMrrs: initialProjectMrrs,
  projectUsers: initialProjectUsers,
  projectTechnologies: initialProjectTechnologies,
  repoOrder: initialRepoOrder,
  onToggleRepo,
  onUpdateDeployedUrl,
  onUpdateCustomName,
  onUpdateCustomDescription,
  onUpdateGithubUrl,
  onUpdateProjectCategory,
  onUpdateProjectStatus,
  onUpdateProjectRevenue,
  onUpdateProjectMrr,
  onUpdateProjectUsers,
  onUpdateProjectTechnologies,
  onUpdateRepoOrder,
  onAddImportedProject,
  analytics,
  portfolioId,
  onUpdateLogo,
  logoOverrides: initialLogoOverrides,
  isLoading = false,
  onNavigateToSection,
}: ReposSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deployedUrls, setDeployedUrls] = useState<Record<number, string>>(initialDeployedUrls || {})
  const [githubUrls, setGithubUrls] = useState<Record<number, string>>(initialGithubUrls || {})
  const [editingRepo, setEditingRepo] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [customNames, setCustomNames] = useState<Record<number, string>>(initialCustomNames || {})
  const [customDescriptions, setCustomDescriptions] = useState<Record<number, string>>(initialCustomDescriptions || {})
  const [projectCategoriesState, setProjectCategoriesState] = useState<Record<number, string>>(initialProjectCategories || {})
  const [projectStatusesState, setProjectStatusesState] = useState<Record<number, string>>(initialProjectStatuses || {})
  const [projectRevenuesState, setProjectRevenuesState] = useState<Record<number, number>>(initialProjectRevenues || {})
  const [projectMrrsState, setProjectMrrsState] = useState<Record<number, number>>(initialProjectMrrs || {})
  const [projectUsersState, setProjectUsersState] = useState<Record<number, number>>(initialProjectUsers || {})
  const [customTechnologies, setCustomTechnologies] = useState<Record<number, string>>(initialProjectTechnologies || {})
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [projectUrl, setProjectUrl] = useState("")
  const [isImportingUrl, setIsImportingUrl] = useState(false)
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editInitial, setEditInitial] = useState<{
    id: number
    url: string
    name: string
    description: string
    logo?: string | null
    category?: string | null
    status?: string | null
    revenue?: number | null
    mrr?: number | null
    users?: number | null
    technologies?: string | null
  } | null>(null)
  const [logoOverrides, setLogoOverrides] = useState<Record<number, string>>(initialLogoOverrides || {})
  const [deletingRepoIds, setDeletingRepoIds] = useState<Record<number, boolean>>({})

  const updateCategory = (repoId: number, value: string | null) => {
    setProjectCategoriesState(prev => {
      const next = { ...prev }
      if (!value) {
        delete next[repoId]
      } else {
        next[repoId] = value
      }
      return next
    })
    onUpdateProjectCategory?.(repoId, value && value.trim() ? value.trim() : null)
  }

  const updateStatus = (repoId: number, value: string | null) => {
    setProjectStatusesState(prev => {
      const next = { ...prev }
      if (!value) {
        delete next[repoId]
      } else {
        next[repoId] = value
      }
      return next
    })
    onUpdateProjectStatus?.(repoId, value && value.trim() ? value.trim() : null)
  }

  const updateNumericInsight = (
    repoId: number,
    value: number | null,
    setter: Dispatch<SetStateAction<Record<number, number>>>,
    callback?: (repoId: number, value: number | null) => void
  ) => {
    setter(prev => {
      const next = { ...prev }
      if (value === null || value === undefined || Number.isNaN(value)) {
        delete next[repoId]
      } else {
        next[repoId] = value
      }
      return next
    })
    callback?.(repoId, value ?? null)
  }

  const updateRevenue = (repoId: number, value: number | null) =>
    updateNumericInsight(repoId, value, setProjectRevenuesState, onUpdateProjectRevenue)

  const updateMrr = (repoId: number, value: number | null) =>
    updateNumericInsight(repoId, value, setProjectMrrsState, onUpdateProjectMrr)

  const updateUsers = (repoId: number, value: number | null) =>
    updateNumericInsight(repoId, value, setProjectUsersState, onUpdateProjectUsers)

  const handleCapturedInsights = (repoId: number, insights: ProjectInsightsPayload) => {
    updateCategory(repoId, insights.category ?? null)
    updateStatus(repoId, insights.status ?? null)
    updateRevenue(repoId, insights.revenue ?? null)
    updateMrr(repoId, insights.mrr ?? null)
    updateUsers(repoId, insights.users ?? null)
    if (insights.technologies) {
      setCustomTechnologies(prev => ({ ...prev, [repoId]: insights.technologies! }))
      onUpdateProjectTechnologies?.(repoId, insights.technologies)
    }
  }
  
  // Sync logoOverrides from parent
  useEffect(() => {
    setLogoOverrides(initialLogoOverrides || {})
  }, [initialLogoOverrides])

  // Keyboard shortcut to open modal (Ctrl/Cmd + K)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        setIsAddProjectOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // (Tip banner removed)
  
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

  const handleRemoveRepo = async (repoId: number, portfolioRepoId?: number) => {
    setDeletingRepoIds(prev => ({ ...prev, [repoId]: true }))

    try {
      if (portfolioRepoId) {
        const response = await fetch(`/api/portfolio/projects/${portfolioRepoId}`, {
          method: "DELETE",
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data?.error || "Failed to delete project")
        }
      }

      const newSelectedRepos = selectedRepos.filter(id => id !== repoId)
      const newDeployedUrls = { ...deployedUrls }
      delete newDeployedUrls[repoId]

      onToggleRepo(repoId)

      setLocalRepoOrder(prev => {
        const newOrder = prev.filter(id => id !== repoId)
        onUpdateRepoOrder(newOrder)
        return newOrder
      })

      setDeployedUrls(newDeployedUrls)

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
      setGithubUrls(prev => {
        const next = { ...prev }
        delete next[repoId]
        return next
      })
      setLogoOverrides(prev => {
        const next = { ...prev }
        delete next[repoId]
        return next
      })
    } catch (error) {
      console.error("Error removing repository:", error)
      toast.error(error instanceof Error ? error.message : "Failed to remove project")
    } finally {
      setDeletingRepoIds(prev => {
        const { [repoId]: _removed, ...rest } = prev
        return rest
      })
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
      onUpdateProjectTechnologies?.(repoId, value || null)
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

  const formatMoney = (value?: number | null) => {
    if (value === null || value === undefined) return null
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    return `$${value.toLocaleString()}`
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
      className="space-y-2 px-6 md:px-10 mt-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Tip banner removed */}

      {/* Header */}
      <motion.div variants={itemVariants} className="-mt-6 md:-mt-8">
        <Card className="bg-white shadow-none border-none dark:bg-background">
          <CardHeader className="py-0">
            <CardTitle className="text-xl md:text-2xl text-black dark:text-white flex items-center font-bold">
              Projects
              <div className="ml-auto">
                <Button onClick={() => setIsAddProjectOpen(true)} className="dark:bg-white dark:text-black bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs">
                  + Add Project (Ctrl+K)
                </Button>
              </div>
          </CardTitle>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Selected Repositories */}
      <AnimatePresence>
        {selectedRepositories.length > 0 && (
          <motion.div 
            className="space-y-3"
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
            
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:gap-3">
              <AnimatePresence mode="popLayout">
                  {selectedRepositories.map((repo, index) => {
                  const isEditing = editingRepo === repo.id
                  const customName = customNames[repo.id] || repo.name
                    const customDescription = customDescriptions[repo.id] || repo.description
                    const categoryValue = projectCategoriesState[repo.id]
                    const statusValue = projectStatusesState[repo.id]
                    const revenueValue = projectRevenuesState[repo.id]
                    const mrrValue = projectMrrsState[repo.id]
                    const usersValue = projectUsersState[repo.id]
                    const hasRevenue = typeof revenueValue === "number"
                    const hasMrr = typeof mrrValue === "number"
                    const hasUsers = typeof usersValue === "number"
                    const shouldShowInsights = Boolean(categoryValue || statusValue || hasRevenue || hasMrr || hasUsers)
                  
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
                        className="hover:border-gray-600 transition-all duration-300 group h-[350px] relative bg-background"
                        style={{ overflow: 'visible' }}
                      >
                        <CardContent className="p-0 h-full" style={{ overflow: 'visible' }}>
                          <div className="flex flex-col h-full px-3 py-2.5 relative" style={{ overflow: 'visible' }}>

                            {/* Delete Button - Appears on hover */}
                              <motion.div
                              className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              initial={{ opacity: 0 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                  onClick={() => handleRemoveRepo(repo.id, repo.portfolioRepositoryId)}
                                variant="destructive"
                                size="sm"
                                  className="h-7 w-7 p-0 rounded-full shadow-md hover:shadow-lg"
                                  disabled={Boolean(deletingRepoIds[repo.id])}
                              >
                                  {deletingRepoIds[repo.id] ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                              </Button>
                            </motion.div>

                            {/* Header row: favicon left, title + description stacked; right: times visited + menu */}
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5 md:gap-3 min-w-0">
                                <ProjectIcon
                                  favicon={repo.repository.favicon}
                                  logo={logoOverrides[repo.id] ?? repo.repository.logo}
                                  title={customName || repo.name}
                                  size="md"
                                  className="flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <h3 className="text-[13px] font-semibold text-gray-900 truncate dark:text-white">
                                    {customName}
                                  </h3>
                                    <p className="text-[11px] text-gray-500 truncate">
                                      {customDescription}
                                    </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 flex-shrink-0">
                                <div className="text-right leading-tight">
                                  <div className="text-[10px] text-gray-500">Times visited</div>
                                  <div className="text-[13px] font-semibold text-black">
                                    {(() => {
                                      const portfolioRepoId = repo.portfolioRepositoryId
                                      const projectData = analytics?.detailed?.projects?.find((p: any) => p.projectId == portfolioRepoId)
                                      return projectData?.totalViews || 0
                                    })()}
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="h-6 w-6 grid place-items-center rounded-md hover:bg-gray-100">
                                      <MoreVertical className="h-3.5 w-3.5 text-gray-600" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-36">
                                    <DropdownMenuItem onClick={() => {
                                      const url = deployedUrls[repo.id] || repo.htmlUrl
                                        setEditInitial({
                                          id: repo.id,
                                          url: url || '',
                                          name: customName || repo.name,
                                          description: customDescription || repo.description,
                                          logo: logoOverrides[repo.id] ?? repo.repository.logo,
                                          category: projectCategoriesState[repo.id] || "",
                                          status: projectStatusesState[repo.id] || "",
                                          revenue: projectRevenuesState[repo.id] ?? null,
                                          mrr: projectMrrsState[repo.id] ?? null,
                                          users: projectUsersState[repo.id] ?? null,
                                          technologies: customTechnologies[repo.id] || null,
                                        })
                                      setIsEditOpen(true)
                                    }}>Edit Project</DropdownMenuItem>
                                      <DropdownMenuItem
                                        disabled={Boolean(deletingRepoIds[repo.id])}
                                        onClick={() => handleRemoveRepo(repo.id, repo.portfolioRepositoryId)}
                                      >
                                        Remove
                                      </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* Categories and Metrics - Below title/desc */}
                            {(categoryValue || hasRevenue || hasMrr || hasUsers) && (
                              <div className="mt-2 mb-2 flex flex-wrap items-center gap-1.5">
                                {categoryValue && (
                                  <div className="flex flex-wrap gap-1">
                                    {categoryValue.split(',').map((cat: string, idx: number) => (
                                      <span key={idx} className="inline-flex items-center text-[9px] leading-none font-medium rounded px-1.5 py-0.5 bg-gray-100 text-gray-700 border border-gray-200">
                                        {cat.trim()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {hasRevenue && (
                                  <span className="inline-flex items-center text-[9px] leading-none font-medium rounded px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
                                    ARR: ${(revenueValue / 1000).toFixed(1)}k
                                  </span>
                                )}
                                {hasMrr && (
                                  <span className="inline-flex items-center text-[9px] leading-none font-medium rounded px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200">
                                    MRR: ${(mrrValue / 1000).toFixed(1)}k
                                  </span>
                                )}
                                {hasUsers && (
                                  <span className="inline-flex items-center text-[9px] leading-none font-medium rounded px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200">
                                    Users: {usersValue >= 1000 ? `${(usersValue / 1000).toFixed(1)}k` : usersValue}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Project Views Chart */}
                            {portfolioId ? (
                              <div className="mt-auto flex-shrink-0" style={{ height: '180px', minHeight: '180px', overflow: 'visible' }}>
                              <div className="w-full" style={{ overflow: 'visible' }}>
                                  <IndividualProjectChart 
                                    portfolioId={portfolioId}
                                    projectId={repo.portfolioRepositoryId || repo.id}
                                    projectName={customName || repo.repository.name}
                                    size="sm"
                                    className="w-full"
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

      {onNavigateToSection && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-40">
          <Button
            variant="default"
            size="sm"
            onClick={() => onNavigateToSection("skills")}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-black/85 focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            Next: Skills
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && selectedRepositories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && selectedRepositories.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          <Card className="bg-white transition-all duration-300 dark:bg-background">
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
                <h3 className="text-xl font-bold text-black dark:text-white mb-3">No projects selected</h3>
                <p className="text-gray-600 font-medium mb-6 max-w-md mx-auto">
                  Import repositories from GitHub to showcase your work and build an impressive portfolio
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => setIsDropdownOpen(true)}
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
      )}
      <AddProjectModal
        open={isAddProjectOpen}
        onOpenChange={setIsAddProjectOpen}
        repositories={repositories}
          onAddImportedProject={(p) => onAddImportedProject?.(p as any)}
          onCaptureInsights={handleCapturedInsights}
      />

      {editInitial && (
        <EditModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          initial={editInitial}
          onSave={(payload: { 
            id: number; 
            url: string; 
            name: string; 
            description: string; 
            logo?: string | null;
            category?: string | null;
            status?: string | null;
            revenue?: number | null;
            mrr?: number | null;
            users?: number | null;
            technologies?: string | null;
          }) => {
            // payload.id is the GitHub ID
            console.log('🔄 EditProjectModal save called:', { 
              id: payload.id, 
              url: payload.url, 
              name: payload.name, 
              hasLogo: !!payload.logo,
              logoLength: payload.logo?.length 
            })
            
            // Update local fields; persist on Publish
            setDeployedUrls(prev => ({ ...prev, [payload.id]: payload.url }))
            setCustomNames(prev => ({ ...prev, [payload.id]: payload.name }))
            setCustomDescriptions(prev => ({ ...prev, [payload.id]: payload.description }))
            // Bubble up to parent so dirty-state/publish gets enabled
            onUpdateDeployedUrl(payload.id, payload.url)
            onUpdateCustomName(payload.id, payload.name)
            onUpdateCustomDescription(payload.id, payload.description)
              updateCategory(payload.id, payload.category ?? null)
              updateStatus(payload.id, payload.status ?? null)
              updateRevenue(payload.id, payload.revenue ?? null)
              updateMrr(payload.id, payload.mrr ?? null)
              updateUsers(payload.id, payload.users ?? null)
            // Update technologies
            if (payload.technologies) {
              setCustomTechnologies(prev => ({ ...prev, [payload.id]: payload.technologies! }))
              onUpdateProjectTechnologies?.(payload.id, payload.technologies)
            }
            // Update logo override in local state
            if (payload.logo) {
              setLogoOverrides(prev => ({ ...prev, [payload.id]: payload.logo! }))
              console.log('✅ Logo override set in local state for ID:', payload.id)
            }
            // Also bubble up to parent to track in portfolio state
            if (onUpdateLogo) {
              onUpdateLogo(payload.id, payload.logo || null)
              console.log('✅ Logo override sent to parent for ID:', payload.id)
            }
          }}
        />
      )}
    </motion.div>
  )
}