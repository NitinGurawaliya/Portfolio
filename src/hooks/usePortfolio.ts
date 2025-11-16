import { useState, useEffect, useMemo, useRef } from "react"
import { User, Skill, Social, Repository, PortfolioState, PortfolioData } from "@/interface"
import { devLog } from "@/lib/logger"
import {
  normalizeData,
  normalizeImportedProjects,
  mapPortfolioRepositories,
  formatImportedProjects,
  buildLivePortfolio
} from "@/lib/portfolio-utils"
import { loadPortfolioData } from "@/lib/services/portfolio-service"
import { loadBasicPortfolioData, loadSectionsData } from "@/lib/services/portfolio-service-optimized"

// Extend Window interface for change tracking
declare global {
  interface Window {
    _lastChangeTrackingEnabled?: number
  }
}

// Analytics data load करने का function
const loadAnalyticsData = async (portfolioId: number) => {
  try {
    // Fetch basic analytics
    const response = await fetch(`/api/analytics/stats?portfolioId=${portfolioId}`)
    const data = await response.json()
    
    // Fetch detailed analytics
    const detailedResponse = await fetch(`/api/analytics/detailed?portfolioId=${portfolioId}`)
    const detailedData = await detailedResponse.json()
    
    const combinedData = {
      ...data,
      detailed: detailedData
    }
    
    console.log("📊 Analytics data loaded:", combinedData)
    console.log("📊 Detailed analytics:", detailedData)
    return combinedData
  } catch (error) {
    console.error("Error loading analytics data:", error)
    return null
  }
}

export const usePortfolio = (user: User | null, initialPortfolioData?: PortfolioData) => {
  // State
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    displayName: "",
    jobTitle: "",
    bio: "",
    profilePic: "",
    customUsername: "",
  })
  const [selectedRepos, setSelectedRepos] = useState<number[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [socials, setSocials] = useState<Social[]>([])
  const [deployedUrls, setDeployedUrls] = useState<Record<number, string>>({})
  const [importedProjects, setImportedProjects] = useState<Repository[]>([])
  const [customNames, setCustomNames] = useState<Record<number, string>>({})
  const [customDescriptions, setCustomDescriptions] = useState<Record<number, string>>({})
  const [githubUrls, setGithubUrls] = useState<Record<number, string>>({})
  const [projectCategories, setProjectCategories] = useState<Record<number, string>>({})
  const [projectStatuses, setProjectStatuses] = useState<Record<number, string>>({})
  const [projectRevenues, setProjectRevenues] = useState<Record<number, number>>({})
  const [projectMrrs, setProjectMrrs] = useState<Record<number, number>>({})
  const [projectUsers, setProjectUsers] = useState<Record<number, number>>({})
  const [projectTechnologies, setProjectTechnologies] = useState<Record<number, string>>({})
  const [selectedTheme, setSelectedTheme] = useState<string>('light')
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null)
  const [backgroundPattern, setBackgroundPattern] = useState<string | null>(null)
  const [repoOrder, setRepoOrder] = useState<number[]>([])
  const [logoOverrides, setLogoOverrides] = useState<Record<number, string>>({})
  const [experiences, setExperiences] = useState<any[]>([])
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  
  const [originalData, setOriginalData] = useState<PortfolioState | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  // Start with false so UI shows immediately, set to true only when actually loading
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false)
  const [isPublishComplete, setIsPublishComplete] = useState(false)
  const publishCompleteTimestamp = useRef<number | null>(null)
  
  // Analytics state
  const [analytics, setAnalytics] = useState<{
    totalViews: number
    lastViewedAt: string | null
    dailyData: Array<{ date: string; count: number }>
  } | null>(null)

  // Helper function to create data object with consistent key order
  const createOrderedData = (data: any) => {
    return {
      id: data.id, // Add portfolio ID
      portfolioData: data.portfolioData,
      selectedRepos: data.selectedRepos,
      skills: data.skills,
      socials: data.socials,
      experiences: data.experiences,
      deployedUrls: data.deployedUrls,
      customNames: data.customNames,
      customDescriptions: data.customDescriptions,
      githubUrls: data.githubUrls,
        projectCategories: data.projectCategories,
        projectStatuses: data.projectStatuses,
        projectRevenues: data.projectRevenues,
        projectMrrs: data.projectMrrs,
        projectUsers: data.projectUsers,
        projectTechnologies: data.projectTechnologies,
      selectedTheme: data.selectedTheme,
      backgroundColor: data.backgroundColor,
      backgroundPattern: data.backgroundPattern,
      importedProjects: data.importedProjects,
      repoOrder: data.repoOrder
    }
  }

  // Build live portfolio data
  const livePortfolio = useMemo(() => buildLivePortfolio(
    user,
    portfolioData,
    skills,
    socials,
    selectedRepos,
    deployedUrls,
    importedProjects,
    selectedTheme,
    customNames,
    customDescriptions,
    projectCategories,
    projectStatuses,
    projectRevenues,
    projectMrrs,
    projectUsers,
    repoOrder,
    backgroundColor,
    backgroundPattern
  ), [user, portfolioData, skills, socials, selectedRepos, deployedUrls, importedProjects, selectedTheme, customNames, customDescriptions, projectCategories, projectStatuses, projectRevenues, projectMrrs, projectUsers, projectTechnologies, repoOrder, backgroundColor, backgroundPattern])

  // Track changes
  useEffect(() => {
    // Skip change detection during initial load or if no original data
    if (isInitialLoad) {
      console.log("📊 Skipping change detection - initial load")
      setHasUnsavedChanges(false)
      return
    }
    
    if (!originalData || isLoadingPortfolio) {
      console.log("📊 Skipping change detection - no original data or still loading")
      setHasUnsavedChanges(false)
      return
    }
    
    // Skip if change detection was just enabled (within 1000ms / 1 second)
    // This prevents false positives from child components initializing
    const skipIfRecentlyEnabled = () => {
      const now = Date.now()
      if (!window._lastChangeTrackingEnabled) {
        if (typeof window !== 'undefined') {
          window._lastChangeTrackingEnabled = now
        }
        return false
      }
      return (now - window._lastChangeTrackingEnabled) < 1000
    }
    
    if (skipIfRecentlyEnabled()) {
      console.log("📊 Skipping change detection - recently enabled (child components still initializing)")
      return
    }
    
    const normalizedImportedProjects = normalizeImportedProjects(importedProjects)
    
    const currentData = createOrderedData({
      portfolioData,
      selectedRepos: [...selectedRepos].sort(),
      skills: [...skills].sort((a, b) => a.id.localeCompare(b.id)),
      socials: [...socials].sort((a, b) => a.id - b.id),
      experiences: experiences.map(e => ({ ...e })),
      deployedUrls,
      customNames,
      customDescriptions,
      githubUrls,
        projectCategories,
        projectStatuses,
        projectRevenues,
        projectMrrs,
        projectUsers,
        projectTechnologies,
      importedProjects: normalizedImportedProjects.sort((a, b) => a.id - b.id),
      selectedTheme,
      backgroundColor,
      backgroundPattern,
      repoOrder: [...repoOrder],
    })
    
    const cleanCurrentData = normalizeData(createOrderedData({
      portfolioData: currentData.portfolioData,
      selectedRepos: [...(currentData.selectedRepos || [])].sort(),
      skills: [...(currentData.skills || [])].sort((a, b) => a.id.localeCompare(b.id)),
      socials: [...(currentData.socials || [])].sort((a, b) => a.id - b.id),
      experiences: currentData.experiences || [],
      deployedUrls: currentData.deployedUrls,
      customNames: currentData.customNames,
      customDescriptions: currentData.customDescriptions,
      githubUrls: currentData.githubUrls,
        projectCategories: currentData.projectCategories || {},
        projectStatuses: currentData.projectStatuses || {},
        projectRevenues: currentData.projectRevenues || {},
        projectMrrs: currentData.projectMrrs || {},
        projectUsers: currentData.projectUsers || {},
        projectTechnologies: currentData.projectTechnologies || {},
      importedProjects: [...(currentData.importedProjects || [])].sort((a, b) => a.id - b.id),
      selectedTheme: currentData.selectedTheme || 'light',
      backgroundColor: currentData.backgroundColor || null,
      backgroundPattern: currentData.backgroundPattern || null,
      repoOrder: currentData.repoOrder || [],
    }))
    
    const normalizedOriginalImportedProjects = (originalData.importedProjects || []).map(project => ({
      ...project,
      languages: project.languages || []
    }))
    
    const cleanOriginalData = normalizeData(createOrderedData({
      portfolioData: originalData.portfolioData,
      selectedRepos: [...(originalData.selectedRepos || [])].sort(),
      skills: [...(originalData.skills || [])].sort((a, b) => a.id.localeCompare(b.id)),
      socials: [...(originalData.socials || [])].sort((a, b) => a.id - b.id),
      experiences: (originalData as any).experiences || [],
      deployedUrls: originalData.deployedUrls,
      customNames: originalData.customNames,
      customDescriptions: originalData.customDescriptions,
      githubUrls: originalData.githubUrls,
        projectCategories: (originalData as any).projectCategories || {},
        projectStatuses: (originalData as any).projectStatuses || {},
        projectRevenues: (originalData as any).projectRevenues || {},
        projectMrrs: (originalData as any).projectMrrs || {},
        projectUsers: (originalData as any).projectUsers || {},
        projectTechnologies: (originalData as any).projectTechnologies || {},
      importedProjects: normalizedOriginalImportedProjects.sort((a, b) => a.id - b.id),
      selectedTheme: originalData.selectedTheme || 'light',
      backgroundColor: (originalData as any).backgroundColor || null,
      backgroundPattern: (originalData as any).backgroundPattern || null,
      repoOrder: originalData.repoOrder || [],
      cvUrl: cvUrl || null,
    }))
    
    // Add cvUrl to original data comparison
    const originalCvUrl = (originalData as any)?.cvUrl || null
    const cleanOriginalDataWithCv = { ...cleanOriginalData, cvUrl: originalCvUrl }
    const cleanCurrentDataWithCv = { ...cleanCurrentData, cvUrl: cvUrl || null }
    
    const hasChanges = JSON.stringify(cleanCurrentDataWithCv) !== JSON.stringify(cleanOriginalDataWithCv)
     
    console.log("📊 Change detection:", { 
      hasChanges, 
      isInitialLoad, 
      isPublishComplete,
      originalDataExists: !!originalData 
    })
     
    // Don't set changes during initial load
    if (isInitialLoad) {
      console.log("📊 Skipping change detection - isInitialLoad")
      setHasUnsavedChanges(false)
      return
    }
    
    // If publish is complete, handle carefully
    if (isPublishComplete) {
      // Check if enough time has passed since publish (ignore immediate false positives)
      const timeSincePublish = publishCompleteTimestamp.current 
        ? Date.now() - publishCompleteTimestamp.current 
        : Infinity
      
      // If changes detected and enough time has passed (2 seconds), user made a real change
      if (hasChanges && timeSincePublish > 2000) {
        console.log("📊 Real changes detected after publish - resetting isPublishComplete flag")
        setIsPublishComplete(false)
        publishCompleteTimestamp.current = null
        setHasUnsavedChanges(true)
        return
      }
      
      // If no changes or changes detected too soon after publish, keep button disabled
      if (!hasChanges) {
        console.log("📊 Skipping change detection - publish complete with no changes")
      } else {
        console.log("📊 Ignoring changes detected too soon after publish (likely false positive)")
      }
      setHasUnsavedChanges(false)
      return
    }
    
    // Normal change detection
    console.log("📊 Setting hasUnsavedChanges to:", hasChanges)
    setHasUnsavedChanges(hasChanges)
    }, [portfolioData, selectedRepos, skills, socials, deployedUrls, customNames, customDescriptions, githubUrls, projectCategories, projectStatuses, projectRevenues, projectMrrs, projectUsers, projectTechnologies, importedProjects, selectedTheme, backgroundColor, backgroundPattern, repoOrder, experiences, cvUrl, originalData, isInitialLoad, isPublishComplete])

  // Track if we're currently loading to prevent multiple simultaneous calls
  const isLoadingRef = useRef(false)
  
  // Load existing portfolio data
  const loadExistingData = async (username: string, initialData?: any) => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      console.log("⚠️ loadExistingData already in progress, skipping duplicate call")
      return
    }
    
    isLoadingRef.current = true
    console.log("🚀 loadExistingPortfolioData called with:", { username, initialData })
    console.log("🔍 Trying to load portfolio with username:", username)
    
    setIsLoadingPortfolio(true)
    
    try {
      // OPTIMIZATION: Load basic data first for instant home section display
      // Then load sections in parallel in background
      const [basicData, sectionsData] = await Promise.all([
        loadBasicPortfolioData().catch(() => null),
        loadSectionsData().catch(() => null)
      ])
      
      // If basic data exists, use it immediately
      if (basicData) {
        console.log("✅ Basic portfolio data loaded:", basicData.id)
        
        // Update portfolio data immediately for instant UI
        setPortfolioData({
          displayName: basicData.displayName || "",
          jobTitle: basicData.jobTitle || "",
          bio: basicData.bio || "",
          profilePic: basicData.profilePic || "",
          customUsername: basicData.customUsername || user?.githubUsername || "",
          id: basicData.id
        })
        
        // Set theme and customization if available
        if (basicData.selectedTheme !== undefined) {
          setSelectedTheme(basicData.selectedTheme || 'light')
        }
        if (basicData.backgroundColor !== undefined) {
          setBackgroundColor(basicData.backgroundColor)
        }
        if (basicData.backgroundPattern !== undefined) {
          setBackgroundPattern(basicData.backgroundPattern)
        }
        
        // Set experiences if available
        if (basicData.experiences) {
          setExperiences(basicData.experiences)
        }
        
        // Set CV URL if available
        if (basicData.cvUrl !== undefined) {
          setCvUrl(basicData.cvUrl)
        }
      }
      
      // If sections data exists, update sections
      if (sectionsData) {
        console.log("✅ Sections data loaded")
        
        if (sectionsData.skills) {
          setSkills(sectionsData.skills.map((skill: any) => ({
            id: skill.id.toString(),
            name: skill.name,
            category: skill.category || ""
          })))
        }
        
        if (sectionsData.socials) {
          setSocials(sectionsData.socials.map((social: any) => ({
            id: social.id,
            platform: social.platform,
            username: social.username,
            url: social.url,
            isPinned: social.isPinned
          })))
        }
        
          if (sectionsData.repositories) {
            const { urls, names, descriptions, githubUrls: gUrls, categories, statuses, revenues, mrrs, users: usersMap, technologies: techsMap } = mapPortfolioRepositories(sectionsData.repositories)
            
            setDeployedUrls(urls)
            setCustomNames(names)
            setCustomDescriptions(descriptions)
            setGithubUrls(gUrls)
            setProjectCategories(categories)
            setProjectStatuses(statuses)
            setProjectRevenues(revenues)
            setProjectMrrs(mrrs)
            setProjectUsers(usersMap)
            setProjectTechnologies(techsMap)
          
          const imported = formatImportedProjects(sectionsData.repositories)
          setImportedProjects(imported)
          
          const githubIds = sectionsData.repositories.map((repo: any) => 
            parseInt(repo.repository.githubId)
          )
          setSelectedRepos(githubIds)
          
          const loadedRepoOrder = sectionsData.repositories.map((repo: any) => 
            parseInt(repo.repository.githubId)
          )
          setRepoOrder(loadedRepoOrder)
        }
      }
      
      // Fallback: Try to load full portfolio if basic/sections APIs failed
      let portfolio = null
      if (!basicData && !sectionsData) {
        portfolio = await loadPortfolioData(username)
      }
      
      if (portfolio) {
        console.log("✅ Portfolio found with username:", username)
        console.log("🔍 Portfolio details:", {
          id: portfolio.id,
          customUsername: portfolio.customUsername,
          displayName: portfolio.displayName,
          userGithubUsername: portfolio.user?.githubUsername
        })
      } else {
        console.log("❌ No portfolio found with username:", username)
        
        // If no portfolio found, try with GitHub username as fallback
        if (user?.githubUsername && username !== user.githubUsername) {
          console.log("🔍 Trying fallback with GitHub username:", user.githubUsername)
          portfolio = await loadPortfolioData(user.githubUsername)
          
          if (portfolio) {
            console.log("✅ Portfolio found with GitHub username fallback:", user.githubUsername)
            console.log("🔍 Portfolio details:", {
              id: portfolio.id,
              customUsername: portfolio.customUsername,
              displayName: portfolio.displayName,
              userGithubUsername: portfolio.user?.githubUsername
            })
          } else {
            console.log("❌ No portfolio found with GitHub username fallback either")
          }
        }
      }
      
      if (portfolio) {
        console.log("🔍 Found existing portfolio:", portfolio)
        console.log("🔍 Portfolio customUsername:", portfolio.customUsername)
        
        // Update portfolio data
        setPortfolioData({
          displayName: portfolio.displayName || "",
          jobTitle: portfolio.jobTitle || "",
          bio: portfolio.bio || "",
          profilePic: portfolio.profilePic || "",
          customUsername: portfolio.customUsername || user?.githubUsername || "",
          id: portfolio.id // Add portfolio ID
        })
        
        // NEW: set experiences from API
        if ((portfolio as any).experiences) {
          setExperiences((portfolio as any).experiences)
        }
        
        console.log("🔍 Set portfolio data:", {
          displayName: portfolio.displayName || "",
          jobTitle: portfolio.jobTitle || "",
          bio: portfolio.bio || "",
          profilePic: portfolio.profilePic || "",
          customUsername: portfolio.customUsername || user?.githubUsername || "",
          id: portfolio.id
        })

        // Load social accounts
        if (portfolio.socials && portfolio.socials.length > 0) {
          setSocials(portfolio.socials.map((social: any) => ({
            id: social.id,
            platform: social.platform,
            username: social.username,
            url: social.url,
            isPinned: social.isPinned
          })))
        }
        
        // Load repository data
          if (portfolio.repositories && portfolio.repositories.length > 0) {
            devLog("Portfolio repositories from DB:", portfolio.repositories)
            
            const { urls, names, descriptions, githubUrls: gUrls, categories, statuses, revenues, mrrs, users: usersMap, technologies: techsMap } = mapPortfolioRepositories(portfolio.repositories)
            
            setDeployedUrls(urls)
            setCustomNames(names)
            setCustomDescriptions(descriptions)
            setGithubUrls(gUrls)
            setProjectCategories(categories)
            setProjectStatuses(statuses)
            setProjectRevenues(revenues)
            setProjectMrrs(mrrs)
            setProjectUsers(usersMap)
            setProjectTechnologies(techsMap)
          
          // Set imported projects
          const imported = formatImportedProjects(portfolio.repositories)
          setImportedProjects(imported)
          
          // Set selected repos
          const githubIds = portfolio.repositories.map((repo: any) => parseInt(repo.repository.githubId))
          setSelectedRepos(githubIds)
          
          // Set repo order
          const loadedRepoOrder = portfolio.repositories.map((repo: any) => parseInt(repo.repository.githubId))
          setRepoOrder(loadedRepoOrder)
        }
        
        // Set skills
        if (portfolio.skills && portfolio.skills.length > 0) {
          const formattedSkills = portfolio.skills.map((skill: any) => ({
            id: skill.id.toString(),
            name: skill.name,
            category: skill.category
          }))
          setSkills(formattedSkills)
        }

        // Set original data after loading (await this properly)
        const currentSelectedTheme = portfolio.selectedTheme || 'light'
        setSelectedTheme(currentSelectedTheme)
        
        // Set background customization
        if ((portfolio as any).backgroundColor !== undefined) {
          setBackgroundColor((portfolio as any).backgroundColor)
        }
        if ((portfolio as any).backgroundPattern !== undefined) {
          setBackgroundPattern((portfolio as any).backgroundPattern)
        }
        
        // Set CV URL
        if ((portfolio as any).cvUrl !== undefined) {
          setCvUrl((portfolio as any).cvUrl)
        }
        
          const mappedRepoData = mapPortfolioRepositories(portfolio.repositories || [])
          const originalDataToSet = normalizeData(createOrderedData({
          id: portfolio.id, // Add portfolio ID
          portfolioData: {
            displayName: portfolio.displayName || "",
            jobTitle: portfolio.jobTitle || "",
            bio: portfolio.bio || "",
            profilePic: portfolio.profilePic || "",
            customUsername: portfolio.customUsername || user?.githubUsername || "",
          },
          selectedRepos: portfolio.repositories ? portfolio.repositories.map((repo: any) => parseInt(repo.repository.githubId)).sort() : [],
          skills: portfolio.skills ? portfolio.skills.map((skill: any) => ({
            id: skill.id.toString(),
            name: skill.name,
            category: skill.category
          })).sort((a: Skill, b: Skill) => a.id.localeCompare(b.id)) : [],
          socials: portfolio.socials ? portfolio.socials.map((social: any) => ({
            id: social.id,
            platform: social.platform,
            username: social.username,
            url: social.url,
            isPinned: social.isPinned
          })).sort((a: Social, b: Social) => a.id - b.id) : [],
            deployedUrls: mappedRepoData.urls,
            customNames: mappedRepoData.names,
            customDescriptions: mappedRepoData.descriptions,
            githubUrls: mappedRepoData.githubUrls,
            projectCategories: mappedRepoData.categories,
            projectStatuses: mappedRepoData.statuses,
            projectRevenues: mappedRepoData.revenues,
            projectMrrs: mappedRepoData.mrrs,
            projectUsers: mappedRepoData.users,
            projectTechnologies: mappedRepoData.technologies,
          selectedTheme: currentSelectedTheme,
          backgroundColor: (portfolio as any).backgroundColor || null,
          backgroundPattern: (portfolio as any).backgroundPattern || null,
          cvUrl: (portfolio as any).cvUrl || null,
          importedProjects: formatImportedProjects(portfolio.repositories || []).sort((a, b) => a.id - b.id),
          repoOrder: portfolio.repositories ? portfolio.repositories.map((repo: any) => parseInt(repo.repository.githubId)) : [],
          // NEW: include experiences in original
          experiences: (portfolio as any).experiences || []
        }))
        
        console.log("💾 Setting original data from existing portfolio")
        console.log("🔍 Portfolio ID in originalData:", originalDataToSet.id)
        console.log("🔍 Portfolio object:", portfolio)
        console.log("🔍 Portfolio ID from API:", portfolio.id)
        console.log("🔍 Original data before normalize:", { id: portfolio.id })
        
        // Load analytics data along with portfolio data
        if (portfolio.id) {
          console.log("📊 Loading analytics data for portfolio ID:", portfolio.id)
          const analyticsData = await loadAnalyticsData(portfolio.id)
          if (analyticsData) {
            setAnalytics(analyticsData)
            console.log("✅ Analytics data loaded:", analyticsData)
          }
        }
        
        // Set originalData first, then enable change detection after a brief delay
        // This ensures originalData is fully set before change detection starts
        setOriginalData(originalDataToSet)
        setIsLoadingPortfolio(false)
        isLoadingRef.current = false
        console.log("✅ Initial load completed, enabling change tracking...")
        
        // Delay enabling change detection to ensure originalData is set
        // Use multiple frames to ensure all state updates have completed
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              setIsInitialLoad(false)
              // Mark the timestamp when change tracking is enabled
              if (typeof window !== 'undefined') {
                window._lastChangeTrackingEnabled = Date.now()
              }
              console.log("✅ Change tracking enabled")
            }, 100)
          })
        })
      } else if (basicData || sectionsData) {
        // Optimized API path - set original data from split APIs
        const currentTheme = selectedTheme || 'light'
          const sectionsRepoMap = sectionsData?.repositories ? mapPortfolioRepositories(sectionsData.repositories) : { urls: {}, names: {}, descriptions: {}, githubUrls: {}, categories: {}, statuses: {}, revenues: {}, mrrs: {}, users: {}, technologies: {} }
          const originalDataToSet = normalizeData(createOrderedData({
          id: basicData?.id || 0,
          portfolioData: {
            displayName: basicData?.displayName || "",
            jobTitle: basicData?.jobTitle || "",
            bio: basicData?.bio || "",
            profilePic: basicData?.profilePic || "",
            customUsername: basicData?.customUsername || user?.githubUsername || "",
          },
          selectedRepos: sectionsData?.repositories ? sectionsData.repositories.map((repo: any) => parseInt(repo.repository.githubId)).sort() : [],
          skills: sectionsData?.skills ? sectionsData.skills.map((skill: any) => ({
            id: skill.id.toString(),
            name: skill.name,
            category: skill.category || ""
          })).sort((a: Skill, b: Skill) => a.id.localeCompare(b.id)) : [],
          socials: sectionsData?.socials ? sectionsData.socials.map((social: any) => ({
            id: social.id,
            platform: social.platform,
            username: social.username,
            url: social.url,
            isPinned: social.isPinned
          })).sort((a: Social, b: Social) => a.id - b.id) : [],
            deployedUrls: sectionsRepoMap.urls,
            customNames: sectionsRepoMap.names,
            customDescriptions: sectionsRepoMap.descriptions,
            githubUrls: sectionsRepoMap.githubUrls,
            projectCategories: sectionsRepoMap.categories,
            projectStatuses: sectionsRepoMap.statuses,
            projectRevenues: sectionsRepoMap.revenues,
            projectMrrs: sectionsRepoMap.mrrs,
            projectUsers: sectionsRepoMap.users,
            projectTechnologies: sectionsRepoMap.technologies,
          selectedTheme: currentTheme,
          backgroundColor: backgroundColor || null,
          backgroundPattern: backgroundPattern || null,
          cvUrl: basicData?.cvUrl || null,
          importedProjects: sectionsData?.repositories ? formatImportedProjects(sectionsData.repositories).sort((a, b) => a.id - b.id) : [],
          repoOrder: sectionsData?.repositories ? sectionsData.repositories.map((repo: any) => parseInt(repo.repository.githubId)) : [],
          experiences: basicData?.experiences || []
        }))
        
        setOriginalData(originalDataToSet)
        setIsLoadingPortfolio(false)
        isLoadingRef.current = false
        
        // Load analytics if we have portfolio ID
        if (basicData?.id) {
          loadAnalyticsData(basicData.id).then(analyticsData => {
            if (analyticsData) {
              setAnalytics(analyticsData)
            }
          }).catch(() => {})
        }
        
        // Enable change tracking
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              setIsInitialLoad(false)
              if (typeof window !== 'undefined') {
                window._lastChangeTrackingEnabled = Date.now()
              }
            }, 100)
          })
        })
      } else {
        // No existing portfolio
        const currentPortfolioData = initialData || portfolioData
        const currentTheme = selectedTheme || 'light'
        setSelectedTheme(currentTheme)
        
        const initialDataToSet = normalizeData(createOrderedData({
          portfolioData: {
            displayName: currentPortfolioData.displayName || "",
            jobTitle: currentPortfolioData.jobTitle || "",
            bio: currentPortfolioData.bio || "",
            profilePic: currentPortfolioData.profilePic || "",
            customUsername: currentPortfolioData.customUsername || user?.githubUsername || "",
          },
          selectedRepos: [...selectedRepos].sort(),
          skills: [...skills].sort((a, b) => a.id.localeCompare(b.id)),
          socials: [...socials].sort((a, b) => a.id - b.id),
          deployedUrls: { ...deployedUrls },
          customNames: { ...customNames },
          customDescriptions: { ...customDescriptions },
          githubUrls: { ...githubUrls },
        projectCategories: { ...projectCategories },
        projectStatuses: { ...projectStatuses },
        projectRevenues: { ...projectRevenues },
        projectMrrs: { ...projectMrrs },
        projectUsers: { ...projectUsers },
        projectTechnologies: { ...projectTechnologies },
          selectedTheme: currentTheme,
          backgroundColor: backgroundColor || null,
          backgroundPattern: backgroundPattern || null,
          importedProjects: [...importedProjects].sort((a, b) => a.id - b.id),
          repoOrder: [...repoOrder],
          // NEW: no portfolio yet → empty experiences
          experiences: []
         }))
         
         // Set originalData first, then enable change detection after a brief delay
         setOriginalData(initialDataToSet)
         setIsLoadingPortfolio(false)
         isLoadingRef.current = false // Reset loading flag
         
        // Delay enabling change detection to ensure originalData is set
        requestAnimationFrame(() => {
          setTimeout(() => {
            setIsInitialLoad(false)
            // Mark the timestamp when change tracking is enabled
            if (typeof window !== 'undefined') {
              window._lastChangeTrackingEnabled = Date.now()
            }
          }, 50)
        })
      }
    } catch (error) {
       console.error("❌ Error loading existing portfolio data:", error)
       isLoadingRef.current = false // Reset loading flag
       // Fallback
       const currentPortfolioData = initialData || portfolioData
       const currentTheme = selectedTheme || 'light'
       setSelectedTheme(currentTheme)
       
       const fallbackData = normalizeData(createOrderedData({
         portfolioData: {
           displayName: currentPortfolioData.displayName || "",
           jobTitle: currentPortfolioData.jobTitle || "",
           bio: currentPortfolioData.bio || "",
           profilePic: currentPortfolioData.profilePic || "",
           customUsername: currentPortfolioData.customUsername || user?.githubUsername || "",
         },
         selectedRepos: [...selectedRepos].sort(),
         skills: [...skills].sort((a, b) => a.id.localeCompare(b.id)),
         socials: [...socials].sort((a, b) => a.id - b.id),
         deployedUrls: { ...deployedUrls },
         customNames: { ...customNames },
         customDescriptions: { ...customDescriptions },
         githubUrls: { ...githubUrls },
        projectCategories: { ...projectCategories },
        projectStatuses: { ...projectStatuses },
        projectRevenues: { ...projectRevenues },
        projectMrrs: { ...projectMrrs },
        projectUsers: { ...projectUsers },
        projectTechnologies: { ...projectTechnologies },
         selectedTheme: currentTheme,
         backgroundColor: backgroundColor || null,
         backgroundPattern: backgroundPattern || null,
         importedProjects: [...importedProjects].sort((a, b) => a.id - b.id),
         repoOrder: [...repoOrder],
         // NEW: fallback → empty experiences
         experiences: []
       }))
       
       // Set originalData first, then enable change detection after a brief delay
       setOriginalData(fallbackData)
       setIsLoadingPortfolio(false)
       isLoadingRef.current = false // Reset loading flag
       
      // Delay enabling change detection to ensure originalData is set
      requestAnimationFrame(() => {
        setTimeout(() => {
          setIsInitialLoad(false)
          // Mark the timestamp when change tracking is enabled
          if (typeof window !== 'undefined') {
            window._lastChangeTrackingEnabled = Date.now()
          }
        }, 50)
      })
    }
  }

  // Reset after publish
  const resetAfterPublish = () => {
    console.log("🔄 resetAfterPublish called")
    console.log("🔄 Current portfolio data:", portfolioData)
    
    const normalizedImportedProjects = importedProjects.map(project => ({
      ...project,
      languages: project.languages || []
    }))
    
    // Use the SAME normalization as change detection to ensure exact match
    const newOriginalData = normalizeData(createOrderedData({
      portfolioData: { ...portfolioData },
      selectedRepos: [...selectedRepos].sort(),
      skills: [...skills].sort((a, b) => a.id.localeCompare(b.id)),
      socials: [...socials].sort((a, b) => a.id - b.id),
      experiences: experiences.map(e => ({ ...e })),
      deployedUrls: { ...deployedUrls },
      customNames: { ...customNames },
      customDescriptions: { ...customDescriptions },
      githubUrls: { ...githubUrls },
        projectCategories: { ...projectCategories },
        projectStatuses: { ...projectStatuses },
        projectRevenues: { ...projectRevenues },
        projectMrrs: { ...projectMrrs },
        projectUsers: { ...projectUsers },
        projectTechnologies: { ...projectTechnologies },
      selectedTheme,
      backgroundColor,
      backgroundPattern,
      importedProjects: normalizedImportedProjects.sort((a, b) => a.id - b.id),
      repoOrder: [...repoOrder],
    }))
    
    console.log("🔄 Setting new original data (normalized):", newOriginalData)
    
    // Set publish complete flag and timestamp to prevent change detection from running
    setIsPublishComplete(true)
    publishCompleteTimestamp.current = Date.now()
    
    // Immediately set hasUnsavedChanges to false to disable publish button
    setHasUnsavedChanges(false)
    
    // Update originalData - this will trigger change detection, but it will be skipped due to isPublishComplete flag
    setOriginalData(newOriginalData)
    
    console.log("🔄 Publish complete - publish button disabled, isPublishComplete set to true")
    
    // Note: isPublishComplete will remain true until:
    // 1. User makes a real change (detected after 2 second grace period)
    // 2. This prevents false positives from normalization differences
  }

  return {
    // State
    portfolioData,
    selectedRepos,
    skills,
    socials,
    deployedUrls,
    importedProjects,
    customNames,
    customDescriptions,
    githubUrls,
      projectCategories,
      projectStatuses,
      projectRevenues,
      projectMrrs,
      projectUsers,
      projectTechnologies,
    selectedTheme,
    backgroundColor,
    backgroundPattern,
    repoOrder,
    logoOverrides,
    hasUnsavedChanges,
    isInitialLoad,
    isLoadingPortfolio,
    livePortfolio,
    originalData,
    analytics,
    cvUrl,
    
    // Setters
    setPortfolioData,
    setSelectedRepos,
    setSkills,
    setSocials,
    setDeployedUrls,
    setImportedProjects,
    setCustomNames,
    setCustomDescriptions,
    setGithubUrls,
      setProjectCategories,
      setProjectStatuses,
      setProjectRevenues,
      setProjectMrrs,
      setProjectUsers,
      setProjectTechnologies,
    setSelectedTheme,
    setBackgroundColor,
    setBackgroundPattern,
    setRepoOrder,
    setLogoOverrides,
    setExperiences,
    setCvUrl,
    
    // Methods
    loadExistingData,
    resetAfterPublish,
    experiences,
  }
}

