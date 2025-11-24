"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ProjectIcon } from "@/components/ui/project-icon"
import {
  ArrowBigUp,
  ArrowLeft,
  ArrowRight,
  X,
  ExternalLink,
  Eye,
  Share2,
  Check,
  Users,
  Tags,
  Banknote,
  BanknoteArrowUpIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { FeedProject } from "@/components/feed/ProjectFeedCard"

interface ProjectModalProps {
  project: FeedProject | null
  isOpen: boolean
  onClose: () => void
  onToggleUpvote: (projectId: number) => void
  upvotePending?: boolean
}

interface UserProject {
  id: number
  title: string
  description: string
  deployedUrl?: string | null
  githubUrl?: string | null
  favicon?: string | null
  logo?: string | null
  category?: string | null
  status?: string | null
  revenue?: number | null
  mrr?: number | null
  users?: number | null
  slug: string
  createdAt: string
  updatedAt: string
}

export function ProjectModal({
  project,
  isOpen,
  onClose,
  onToggleUpvote,
  upvotePending = false,
}: ProjectModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [userProjects, setUserProjects] = useState<UserProject[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [loading, setLoading] = useState(false)
  const [currentProject, setCurrentProject] = useState<UserProject | null>(null)

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) return null
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    return `$${value.toLocaleString()}`
  }

  // Fetch user projects when modal opens
  useEffect(() => {
    if (isOpen && project?.author.portfolioSlug) {
      setLoading(true)
      fetch(`/api/projects/user/${project.author.portfolioSlug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.projects) {
            setUserProjects(data.projects)
            // Find current project index
            const index = data.projects.findIndex(
              (p: UserProject) => p.id === project.id
            )
            setCurrentIndex(index >= 0 ? index : 0)
            setCurrentProject(
              index >= 0 ? data.projects[index] : data.projects[0]
            )
          }
        })
        .catch((error) => {
          console.error("Failed to load user projects:", error)
          toast({
            title: "Error",
            description: "Failed to load projects",
            variant: "destructive",
          })
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, project, toast])

  // Update current project when index changes
  useEffect(() => {
    if (currentIndex >= 0 && userProjects.length > 0) {
      const newProject = userProjects[currentIndex]
      setCurrentProject(newProject)
      // Update project prop if it matches the new project
      if (project && project.id === newProject.id) {
        // Keep the upvote state from the original project
        setCurrentProject((prev) => prev ? { ...prev, upvotes: project.upvotes, hasUpvoted: project.hasUpvoted } : null)
      }
    }
  }, [currentIndex, userProjects, project])

  const handlePrevious = useCallback(() => {
    if (userProjects.length === 0) return
    const newIndex =
      currentIndex > 0 ? currentIndex - 1 : userProjects.length - 1
    setCurrentIndex(newIndex)
  }, [currentIndex, userProjects.length])

  const handleNext = useCallback(() => {
    if (userProjects.length === 0) return
    const newIndex =
      currentIndex < userProjects.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(newIndex)
  }, [currentIndex, userProjects.length])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        handlePrevious()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        handleNext()
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handlePrevious, handleNext, onClose])

  const handleVisit = () => {
    if (currentProject?.deployedUrl) {
      window.open(currentProject.deployedUrl, "_blank", "noopener,noreferrer")
    } else if (currentProject?.githubUrl) {
      window.open(currentProject.githubUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleShare = async () => {
    if (!currentProject || !project?.author.portfolioSlug) return

    const shareUrl = `${window.location.origin}/${project.author.portfolioSlug}/${currentProject.slug}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentProject.title,
          url: shareUrl,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Copied!",
          description: "Link copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Failed to share project", error)
    }
  }

  const displayProject = currentProject || project

  if (!displayProject) return null

  const hasPrevious = userProjects.length > 1
  const hasNext = userProjects.length > 1

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay 
        className="bg-black/70 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300" 
      />
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-700/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-3xl duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400/50 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600/50 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500/50 scroll-smooth"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.16, 1, 0.3, 1]
          }}
          className="relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-50 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 p-2.5 shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:scale-110 active:scale-95 transition-all duration-200"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Navigation buttons */}
          {hasPrevious && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 p-3.5 shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Previous project"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          {hasNext && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 p-3.5 shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Next project"
            >
              <ArrowRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          <div className="p-8 sm:p-10">
            {/* Header Section */}
            <div className="flex items-start gap-5 mb-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl overflow-hidden ring-2 ring-gray-100 dark:ring-gray-800 shadow-md">
                <ProjectIcon
                  favicon={displayProject.favicon || undefined}
                  logo={displayProject.logo || undefined}
                  title={displayProject.title}
                  size="lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                  {displayProject.title}
                </h2>
                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400 mb-4">
                  {displayProject.description || "No description available"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-8">
              {displayProject.deployedUrl && (
                <Button
                  onClick={handleVisit}
                  variant="outline"
                  className="rounded-full border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit
                </Button>
              )}
              <Button
                onClick={() => {
                  const targetProject = currentProject || project
                  if (targetProject && project) {
                    onToggleUpvote(project.id)
                  }
                }}
                disabled={upvotePending || !project}
                className={cn(
                  "rounded-full px-6 font-semibold shadow-md hover:scale-105 active:scale-95 transition-all duration-200",
                  project?.hasUpvoted
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-500/30"
                    : "bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-orange-400/30"
                )}
              >
                <ArrowBigUp className="h-4 w-4 mr-2" />
                {project?.hasUpvoted ? "Upvoted" : `Upvote ${project?.upvotes || 0}`}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="rounded-full border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm font-medium"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Project Image/Preview */}
            {displayProject.logo && (
              <div className="mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 ring-1 ring-gray-200/50 dark:ring-gray-700/50 shadow-xl">
                <img
                  src={displayProject.logo}
                  alt={displayProject.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Categories and Metrics */}
            <div className="space-y-6">
              {displayProject.category && (
                <div className="flex items-center gap-3 flex-wrap">
                  <Tags className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  {displayProject.category.split(",").map((cat: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-sm font-semibold rounded-xl px-4 py-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      {cat.trim()}
                    </span>
                  ))}
                </div>
              )}

              {(typeof displayProject.revenue === "number" ||
                typeof displayProject.mrr === "number" ||
                typeof displayProject.users === "number") && (
                <div className="flex items-center gap-3 flex-wrap">
                  {typeof displayProject.users === "number" && (
                    <span className="inline-flex items-center text-sm font-semibold rounded-xl px-4 py-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <Users className="h-4 w-4 mr-2" />
                      {displayProject.users.toLocaleString()}
                    </span>
                  )}
                  {typeof displayProject.revenue === "number" && (
                    <span className="inline-flex items-center text-sm font-semibold rounded-xl px-4 py-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <Banknote className="h-4 w-4 mr-2" />
                      Rev {formatCurrency(displayProject.revenue)}
                    </span>
                  )}
                  {typeof displayProject.mrr === "number" && (
                    <span className="inline-flex items-center text-sm font-semibold rounded-xl px-4 py-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-800/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <BanknoteArrowUpIcon className="h-4 w-4 mr-2" />
                      MRR {formatCurrency(displayProject.mrr)}
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              {project && (
                <div className="flex items-center gap-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Eye className="h-4 w-4" />
                    <span className="font-semibold text-gray-900 dark:text-white">{project.views.toLocaleString()}</span>
                    <span>views</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ArrowBigUp className="h-4 w-4" />
                    <span className="font-semibold text-gray-900 dark:text-white">{project.upvotes.toLocaleString()}</span>
                    <span>upvotes</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

