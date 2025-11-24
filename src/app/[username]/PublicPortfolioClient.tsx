"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Portfolio } from "@/interface"
import { PortfolioShareButton } from "@/components/portfolio/PortfolioShareButton"
import { ProjectModal } from "@/components/projects/ProjectModal"
import { useParams } from "next/navigation"
import type { FeedProject } from "@/components/feed/ProjectFeedCard"

interface PublicPortfolioClientProps {
  portfolio: Portfolio
}

export function PublicPortfolioClient({ portfolio }: PublicPortfolioClientProps) {
  const params = useParams()
  const username = params.username as string
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  
  // Track if favicon has been updated to prevent multiple calls
  const faviconUpdatedRef = useRef<string | null>(null)
  const analyticsTrackedRef = useRef<boolean>(false)
  
  // Modal state
  const [selectedProject, setSelectedProject] = useState<FeedProject | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [upvotePending, setUpvotePending] = useState<Record<number, boolean>>({})

  // Update favicon once when portfolio data is available
  useEffect(() => {
    if (portfolio?.profilePic && typeof window !== 'undefined') {
      // Prevent duplicate updates for the same profile picture
      if (faviconUpdatedRef.current === portfolio.profilePic) {
        return
      }

      if (!portfolio.profilePic.startsWith('http')) {
        return
      }

      const generateCacheBuster = (url: string): string => {
        let hash = 0
        for (let i = 0; i < url.length; i++) {
          const char = url.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash
        }
        return Math.abs(hash).toString(36).slice(0, 8)
      }

      const baseUrl = window.location.origin
      const cacheBuster = generateCacheBuster(portfolio.profilePic)
      const timestamp = Date.now()
      const faviconUrl = `${baseUrl}/api/favicon?url=${encodeURIComponent(portfolio.profilePic)}&username=${encodeURIComponent(username)}&hash=${cacheBuster}&t=${timestamp}`

      // Mark as updated
      faviconUpdatedRef.current = portfolio.profilePic

      // Remove existing favicon links
      const existingIcons = document.querySelectorAll("link[rel*='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']")
      existingIcons.forEach(icon => icon.remove())

      // Create new favicon link
      const createFaviconLink = (rel: string, type?: string) => {
        const link = document.createElement('link')
        link.rel = rel
        if (type) link.type = type
        link.href = faviconUrl
        const firstChild = document.head.firstChild
        if (firstChild) {
          document.head.insertBefore(link, firstChild)
        } else {
          document.head.appendChild(link)
        }
        return link
      }

      // Create icon links
      createFaviconLink('icon', 'image/png')
      createFaviconLink('shortcut icon', 'image/png')
      createFaviconLink('apple-touch-icon')

      // Simple browser refresh trick
      const originalTitle = document.title
      document.title = ' '
      setTimeout(() => {
        document.title = originalTitle
      }, 10)
    }
  }, [portfolio?.profilePic, username])

  // Track portfolio view (only once)
  useEffect(() => {
    if (portfolio?.id && !analyticsTrackedRef.current && typeof window !== 'undefined') {
      analyticsTrackedRef.current = true
      
      // Capture referrer on client side
      const clientReferrer = document.referrer || 'direct'
      
      // Track view asynchronously (non-blocking)
      fetch('/api/analytics/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: portfolio.id,
          userId: null,
          clientReferrer
        })
      }).catch(err => console.error('Failed to track view:', err))
    }
  }, [portfolio?.id])

  // Convert portfolio repository to FeedProject format
  const convertToFeedProject = useCallback((repo: any, projectSlug: string): FeedProject => {
    const portfolioSlug = (portfolio as any).customUsername || portfolio.user?.githubUsername || username
    return {
      id: repo.id,
      title: repo.customName || repo.repository?.name || "",
      description: repo.customDescription || repo.repository?.description || "",
      deployedUrl: repo.deployedUrl,
      githubUrl: repo.repository?.githubUrl || repo.repository?.htmlUrl,
      favicon: repo.repository?.favicon,
      logo: repo.repository?.logo,
      upvotes: 0, // Will be fetched from API if needed
      views: 0, // Will be fetched from API if needed
      hasUpvoted: false,
      createdAt: repo.createdAt?.toISOString() || new Date().toISOString(),
      category: repo.projectCategory,
      status: repo.projectStatus,
      revenue: repo.projectRevenue,
      mrr: repo.projectMrr,
      users: repo.projectUsers,
      projectSlug,
      author: {
        id: (portfolio.user as any)?.id || null,
        name: portfolio.displayName || (portfolio.user as any)?.name || portfolio.user?.githubUsername || "",
        githubUsername: portfolio.user?.githubUsername,
        avatarUrl: portfolio.profilePic || (portfolio.user as any)?.avatarUrl,
        portfolioSlug,
      },
    }
  }, [portfolio, username])

  const handleOpenModal = useCallback((repo: any, projectSlug: string) => {
    const feedProject = convertToFeedProject(repo, projectSlug)
    setSelectedProject(feedProject)
    setIsModalOpen(true)
  }, [convertToFeedProject])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedProject(null)
  }, [])

  const handleToggleUpvote = useCallback(async (projectId: number) => {
    if (upvotePending[projectId] || !selectedProject) return

    const previousHasUpvoted = selectedProject.hasUpvoted
    const previousUpvotes = selectedProject.upvotes

    setUpvotePending((prev) => ({ ...prev, [projectId]: true }))
    setSelectedProject((prev) => prev ? {
      ...prev,
      hasUpvoted: !previousHasUpvoted,
      upvotes: Math.max(0, previousUpvotes + (previousHasUpvoted ? -1 : 1)),
    } : null)

    try {
      const response = await fetch(`/api/feed/projects/${projectId}/upvote`, {
        method: "POST",
      })

      if (response.status === 401) {
        setSelectedProject((prev) => prev ? {
          ...prev,
          hasUpvoted: previousHasUpvoted,
          upvotes: previousUpvotes,
        } : null)
        return
      }

      if (!response.ok) {
        throw new Error("Failed to update upvote")
      }

      const data = await response.json()
      setSelectedProject((prev) => prev ? {
        ...prev,
        hasUpvoted: data.upvoted,
        upvotes: data.totalUpvotes,
      } : null)
    } catch (error) {
      console.error("Failed to toggle upvote", error)
      setSelectedProject((prev) => prev ? {
        ...prev,
        hasUpvoted: previousHasUpvoted,
        upvotes: previousUpvotes,
      } : null)
    } finally {
      setUpvotePending((prev) => {
        const { [projectId]: _removed, ...rest } = prev
        return rest
      })
    }
  }, [upvotePending, selectedProject])

  // Expose handleOpenModal to window for portfolio themes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__portfolioOpenModal = handleOpenModal
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__portfolioOpenModal
      }
    }
  }, [handleOpenModal])

  return (
    <>
      <PortfolioShareButton url={shareUrl} portfolioName={portfolio.displayName ?? undefined} />
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onToggleUpvote={handleToggleUpvote}
        upvotePending={selectedProject ? Boolean(upvotePending[selectedProject.id]) : false}
      />
    </>
  )
}

