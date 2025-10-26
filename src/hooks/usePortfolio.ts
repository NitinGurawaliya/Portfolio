import { useState, useEffect, useMemo } from "react"
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
  const [selectedTheme, setSelectedTheme] = useState<string>('light')
  const [repoOrder, setRepoOrder] = useState<number[]>([])
  
  const [originalData, setOriginalData] = useState<PortfolioState | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true)
  
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
      deployedUrls: data.deployedUrls,
      customNames: data.customNames,
      customDescriptions: data.customDescriptions,
      githubUrls: data.githubUrls,
      selectedTheme: data.selectedTheme,
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
    repoOrder
  ), [user, portfolioData, skills, socials, selectedRepos, deployedUrls, importedProjects, selectedTheme, customNames, customDescriptions, repoOrder])

  // Track changes
  useEffect(() => {
    // Skip change detection during initial load or if no original data
    if (isInitialLoad) {
      console.log("📊 Skipping change detection - initial load")
      setHasUnsavedChanges(false)
      return
    }
    
    if (!originalData) {
      console.log("📊 Skipping change detection - no original data")
      setHasUnsavedChanges(false)
      return
    }
    
    const normalizedImportedProjects = normalizeImportedProjects(importedProjects)
    
    const currentData = createOrderedData({
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
    
    const cleanCurrentData = normalizeData(createOrderedData({
      portfolioData: currentData.portfolioData,
      selectedRepos: [...(currentData.selectedRepos || [])].sort(),
      skills: [...(currentData.skills || [])].sort((a, b) => a.id.localeCompare(b.id)),
      socials: [...(currentData.socials || [])].sort((a, b) => a.id - b.id),
      deployedUrls: currentData.deployedUrls,
      customNames: currentData.customNames,
      customDescriptions: currentData.customDescriptions,
      githubUrls: currentData.githubUrls,
      importedProjects: [...(currentData.importedProjects || [])].sort((a, b) => a.id - b.id),
      selectedTheme: currentData.selectedTheme || 'light',
      repoOrder: currentData.repoOrder || []
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
      deployedUrls: originalData.deployedUrls,
      customNames: originalData.customNames,
      customDescriptions: originalData.customDescriptions,
      githubUrls: originalData.githubUrls,
      importedProjects: normalizedOriginalImportedProjects.sort((a, b) => a.id - b.id),
      selectedTheme: originalData.selectedTheme || 'light',
      repoOrder: originalData.repoOrder || []
    }))
    
         const hasChanges = JSON.stringify(cleanCurrentData) !== JSON.stringify(cleanOriginalData)
     
     // Only update hasUnsavedChanges if we're not in initial load
     if (isInitialLoad) {
       console.log("📊 Skipping change detection - initial load in progress")
       return
     }
     
     console.log("📊 Change detection:", { 
       hasChanges, 
       isInitialLoad, 
       originalDataExists: !!originalData 
     })
     
     // Update hasUnsavedChanges based on detection
     console.log("📊 Setting hasUnsavedChanges to:", hasChanges)
     setHasUnsavedChanges(hasChanges)
  }, [portfolioData, selectedRepos, skills, socials, deployedUrls, customNames, customDescriptions, githubUrls, importedProjects, selectedTheme, repoOrder, originalData, isInitialLoad])

  // Load existing portfolio data
  const loadExistingData = async (username: string, initialData?: any) => {
    console.log("🚀 loadExistingPortfolioData called with:", { username, initialData })
    console.log("🔍 Trying to load portfolio with username:", username)
    
    setIsLoadingPortfolio(true)
    
    try {
      // Try to load portfolio with the provided username
      let portfolio = await loadPortfolioData(username)
      
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
          
          const { urls, names, descriptions, githubUrls: gUrls } = mapPortfolioRepositories(portfolio.repositories)
          
          setDeployedUrls(urls)
          setCustomNames(names)
          setCustomDescriptions(descriptions)
          setGithubUrls(gUrls)
          
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
          deployedUrls: mapPortfolioRepositories(portfolio.repositories || []).urls,
          customNames: mapPortfolioRepositories(portfolio.repositories || []).names,
          customDescriptions: mapPortfolioRepositories(portfolio.repositories || []).descriptions,
          githubUrls: mapPortfolioRepositories(portfolio.repositories || []).githubUrls,
          selectedTheme: currentSelectedTheme,
          importedProjects: formatImportedProjects(portfolio.repositories || []).sort((a, b) => a.id - b.id),
          repoOrder: portfolio.repositories ? portfolio.repositories.map((repo: any) => parseInt(repo.repository.githubId)) : []
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
        
        // Set both originalData and isInitialLoad in the same render cycle
        setOriginalData(originalDataToSet)
        setIsInitialLoad(false)
        setIsLoadingPortfolio(false)
        console.log("✅ Initial load completed, change tracking enabled")
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
          selectedTheme: currentTheme,
          importedProjects: [...importedProjects].sort((a, b) => a.id - b.id),
                     repoOrder: [...repoOrder]
         }))
         
         // Set both originalData and isInitialLoad in the same render cycle
         setOriginalData(initialDataToSet)
         setIsInitialLoad(false)
         setIsLoadingPortfolio(false)
       }
     } catch (error) {
       console.error("❌ Error loading existing portfolio data:", error)
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
         selectedTheme: currentTheme,
         importedProjects: [...importedProjects].sort((a, b) => a.id - b.id),
         repoOrder: [...repoOrder]
       }))
       
       // Set both originalData and isInitialLoad in the same render cycle
       setOriginalData(fallbackData)
       setIsInitialLoad(false)
       setIsLoadingPortfolio(false)
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
      deployedUrls: { ...deployedUrls },
      customNames: { ...customNames },
      customDescriptions: { ...customDescriptions },
      githubUrls: { ...githubUrls },
      selectedTheme,
      importedProjects: normalizedImportedProjects.sort((a, b) => a.id - b.id),
      repoOrder: [...repoOrder]
    }))
    
    console.log("🔄 Setting new original data (normalized):", newOriginalData)
    
    // Immediately set hasUnsavedChanges to false to disable publish button
    setHasUnsavedChanges(false)
    
    // Update originalData - this will trigger change detection which will see no changes
    setOriginalData(newOriginalData)
    
    console.log("🔄 Publish complete - publish button disabled")
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
    selectedTheme,
    repoOrder,
    hasUnsavedChanges,
    isInitialLoad,
    isLoadingPortfolio,
    livePortfolio,
    originalData,
    analytics,
    
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
    setSelectedTheme,
    setRepoOrder,
    
    // Methods
    loadExistingData,
    resetAfterPublish,
  }
}

