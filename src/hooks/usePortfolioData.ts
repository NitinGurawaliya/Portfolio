/**
 * Custom hook for managing portfolio data and state
 */

import { useState, useEffect, useCallback } from "react"
import { 
  PortfolioData, 
  Skill, 
  Social, 
  Repository, 
  UsernameAvailability 
} from "@/types/portfolio.types"
import { 
  normalizeData, 
  normalizeImportedProjects, 
  hasDataChanged 
} from "@/lib/utils/data-normalization.utils"
import { checkUsernameAvailability } from "@/lib/utils/api.utils"

interface UsePortfolioDataOptions {
  initialPortfolioData?: PortfolioData
  initialSelectedRepos?: number[]
  initialSkills?: Skill[]
  initialSocials?: Social[]
  initialDeployedUrls?: Record<number, string>
  initialCustomNames?: Record<number, string>
  initialCustomDescriptions?: Record<number, string>
  initialGithubUrls?: Record<number, string>
  initialImportedProjects?: Repository[]
  initialSelectedTheme?: string
  initialRepoOrder?: number[]
}

export function usePortfolioData(options: UsePortfolioDataOptions = {}) {
  // Portfolio data state
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    displayName: "",
    jobTitle: "",
    bio: "",
    profilePic: "",
    customUsername: "",
    ...options.initialPortfolioData
  })

  const [selectedRepos, setSelectedRepos] = useState<number[]>(options.initialSelectedRepos || [])
  const [skills, setSkills] = useState<Skill[]>(options.initialSkills || [])
  const [socials, setSocials] = useState<Social[]>(options.initialSocials || [])
  const [deployedUrls, setDeployedUrls] = useState<Record<number, string>>(options.initialDeployedUrls || {})
  const [customNames, setCustomNames] = useState<Record<number, string>>(options.initialCustomNames || {})
  const [customDescriptions, setCustomDescriptions] = useState<Record<number, string>>(options.initialCustomDescriptions || {})
  const [githubUrls, setGithubUrls] = useState<Record<number, string>>(options.initialGithubUrls || {})
  const [importedProjects, setImportedProjects] = useState<Repository[]>(options.initialImportedProjects || [])
  const [selectedTheme, setSelectedTheme] = useState<string>(options.initialSelectedTheme || 'dark')
  const [repoOrder, setRepoOrder] = useState<number[]>(options.initialRepoOrder || [])

  // Username availability state
  const [usernameAvailability, setUsernameAvailability] = useState<UsernameAvailability>({
    isChecking: false,
    isAvailable: null,
    message: ""
  })

  // Change tracking state
  const [originalData, setOriginalData] = useState<any>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  /**
   * Update portfolio data
   */
  const updatePortfolioData = useCallback((updates: Partial<PortfolioData>) => {
    setPortfolioData(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Check username availability
   */
  const checkUsername = useCallback(async (username: string, currentUsername?: string) => {
    if (!username.trim()) {
      setUsernameAvailability({
        isChecking: false,
        isAvailable: null,
        message: ""
      })
      return
    }

    if (currentUsername === username.trim()) {
      setUsernameAvailability({
        isChecking: false,
        isAvailable: true,
        message: "This is your current username"
      })
      return
    }

    setUsernameAvailability({
      isChecking: true,
      isAvailable: null,
      message: "Checking availability..."
    })

    try {
      const { isAvailable, isTaken } = await checkUsernameAvailability(username)

      setUsernameAvailability({
        isChecking: false,
        isAvailable: isAvailable,
        message: isAvailable ? "Username available" : (isTaken ? "Username already taken" : "Error checking availability")
      })
    } catch (error) {
      setUsernameAvailability({
        isChecking: false,
        isAvailable: null,
        message: "Error checking availability"
      })
    }
  }, [])

  /**
   * Set original data for change tracking
   */
  const setOriginalPortfolioData = useCallback((data: any) => {
    setOriginalData(data)
    setIsInitialLoad(false)
  }, [])

  /**
   * Track changes
   */
  useEffect(() => {
    if (isInitialLoad || !originalData) {
      setHasUnsavedChanges(false)
      return
    }

    const normalizedImportedProjects = normalizeImportedProjects(importedProjects)

    const currentData = normalizeData({
      portfolioData,
      selectedRepos: [...selectedRepos].sort(),
      skills: [...skills].sort((a, b) => a.id.localeCompare(b.id)),
      socials: [...socials].sort((a, b) => a.id - b.id),
      deployedUrls,
      customNames,
      customDescriptions,
      githubUrls,
      importedProjects: normalizedImportedProjects.sort((a, b) => a.id - b.id),
      selectedTheme,
      repoOrder: [...repoOrder]
    })

    const normalizedOriginalImportedProjects = normalizeImportedProjects(originalData.importedProjects || [])

    const originalDataNormalized = normalizeData({
      ...originalData,
      selectedRepos: [...(originalData.selectedRepos || [])].sort(),
      skills: [...(originalData.skills || [])].sort((a, b) => a.id.localeCompare(b.id)),
      socials: [...(originalData.socials || [])].sort((a, b) => a.id - b.id),
      importedProjects: normalizedOriginalImportedProjects.sort((a, b) => a.id - b.id),
      selectedTheme: originalData.selectedTheme || 'dark',
      repoOrder: originalData.repoOrder || []
    })

    const hasChanges = hasDataChanged(currentData, originalDataNormalized)
    setHasUnsavedChanges(hasChanges)
  }, [
    portfolioData,
    selectedRepos,
    skills,
    socials,
    deployedUrls,
    customNames,
    customDescriptions,
    githubUrls,
    importedProjects,
    selectedTheme,
    repoOrder,
    originalData,
    isInitialLoad
  ])

  return {
    // State
    portfolioData,
    selectedRepos,
    skills,
    socials,
    deployedUrls,
    customNames,
    customDescriptions,
    githubUrls,
    importedProjects,
    selectedTheme,
    repoOrder,
    usernameAvailability,
    hasUnsavedChanges,
    isInitialLoad,

    // Setters
    setPortfolioData,
    setSelectedRepos,
    setSkills,
    setSocials,
    setDeployedUrls,
    setCustomNames,
    setCustomDescriptions,
    setGithubUrls,
    setImportedProjects,
    setSelectedTheme,
    setRepoOrder,

    // Methods
    updatePortfolioData,
    checkUsername,
    setOriginalPortfolioData,
  }
}

