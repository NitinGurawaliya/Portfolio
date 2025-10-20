/**
 * Custom hook for managing repository operations
 */

import { useState, useCallback } from "react"
import { Repository } from "@/types/portfolio.types"
import { extractMetadata } from "@/lib/utils/api.utils"

interface UseRepositoriesOptions {
  onRepoToggle?: (repoId: number) => void
  onDeployedUrlUpdate?: (repoId: number, url: string) => void
  onCustomNameUpdate?: (repoId: number, name: string) => void
  onCustomDescriptionUpdate?: (repoId: number, description: string) => void
  onGithubUrlUpdate?: (repoId: number, url: string) => void
  onRepoOrderUpdate?: (newOrder: number[]) => void
  onImportedProjectAdd?: (project: Repository) => void
}

export function useRepositories(options: UseRepositoriesOptions = {}) {
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  /**
   * Toggle repository selection
   */
  const toggleRepo = useCallback((repoId: number) => {
    options.onRepoToggle?.(repoId)
  }, [options])

  /**
   * Update deployed URL for a repository
   */
  const updateDeployedUrl = useCallback((repoId: number, url: string) => {
    options.onDeployedUrlUpdate?.(repoId, url)
  }, [options])

  /**
   * Update custom name for a repository
   */
  const updateCustomName = useCallback((repoId: number, name: string) => {
    options.onCustomNameUpdate?.(repoId, name)
  }, [options])

  /**
   * Update custom description for a repository
   */
  const updateCustomDescription = useCallback((repoId: number, description: string) => {
    options.onCustomDescriptionUpdate?.(repoId, description)
  }, [options])

  /**
   * Update GitHub URL for a repository
   */
  const updateGithubUrl = useCallback((repoId: number, url: string) => {
    options.onGithubUrlUpdate?.(repoId, url)
  }, [options])

  /**
   * Update repository order
   */
  const updateRepoOrder = useCallback((newOrder: number[]) => {
    options.onRepoOrderUpdate?.(newOrder)
  }, [options])

  /**
   * Move repository up in order
   */
  const moveRepoUp = useCallback((repoId: number, currentOrder: number[]) => {
    const currentIndex = currentOrder.indexOf(repoId)
    if (currentIndex > 0) {
      const newOrder = [...currentOrder]
      ;[newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]]
      updateRepoOrder(newOrder)
      return newOrder
    }
    return currentOrder
  }, [updateRepoOrder])

  /**
   * Move repository down in order
   */
  const moveRepoDown = useCallback((repoId: number, currentOrder: number[]) => {
    const currentIndex = currentOrder.indexOf(repoId)
    if (currentIndex < currentOrder.length - 1 && currentIndex !== -1) {
      const newOrder = [...currentOrder]
      ;[newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]]
      updateRepoOrder(newOrder)
      return newOrder
    }
    return currentOrder
  }, [updateRepoOrder])

  /**
   * Import project from URL
   */
  const importProjectFromUrl = useCallback(async (url: string) => {
    if (!url.trim()) return null

    setIsImporting(true)
    setImportError(null)

    try {
      const { data, error } = await extractMetadata(url.trim())

      if (error || !data) {
        throw new Error(error || 'Failed to extract metadata from URL')
      }

      const { projectData } = data as any

      if (options.onImportedProjectAdd) {
        options.onImportedProjectAdd(projectData)
      }

      return projectData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import project'
      setImportError(errorMessage)
      console.error("Error importing project from URL:", error)
      return null
    } finally {
      setIsImporting(false)
    }
  }, [options])

  /**
   * Remove repository
   */
  const removeRepo = useCallback((repoId: number, currentOrder: number[]) => {
    toggleRepo(repoId)
    const newOrder = currentOrder.filter(id => id !== repoId)
    updateRepoOrder(newOrder)
    return newOrder
  }, [toggleRepo, updateRepoOrder])

  return {
    isImporting,
    importError,
    toggleRepo,
    updateDeployedUrl,
    updateCustomName,
    updateCustomDescription,
    updateGithubUrl,
    updateRepoOrder,
    moveRepoUp,
    moveRepoDown,
    importProjectFromUrl,
    removeRepo,
  }
}

