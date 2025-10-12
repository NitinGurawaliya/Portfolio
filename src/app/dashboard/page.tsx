"use client"

import { useRouter } from "next/navigation"
import { devLog } from "@/lib/logger"
import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { HomeSection } from "@/components/dashboard/HomeSection"
import { ReposSection } from "@/components/dashboard/ReposSection"
import { SkillsSection } from "@/components/dashboard/SkillsSection"
import { SocialsSection } from "@/components/dashboard/SocialsSection"
import ThemeSelector from "@/components/dashboard/ThemeSelector"
import { DevFolioLoader } from "@/components/ui/DevFolioLoader"
import toast, { Toaster } from "react-hot-toast"

interface User {
  id: number
  name: string
  email: string
  githubUsername: string
  avatarUrl: string
  bio: string
  location: string
  websiteUrl: string
  twitterUsername: string
  company: string
  publicRepos: number
  followers: number
  following: number
  repositories: Repository[]
}

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
  favicon?: string
  siteName?: string
  keywords?: string
  author?: string
}

interface Skill {
  id: string
  name: string
  category: string
}

interface Social {
  id: number
  platform: string
  username: string
  url: string
  isPinned: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [activeSection, setActiveSection] = useState("home")
  
  // Portfolio data state
  const [portfolioData, setPortfolioData] = useState({
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
  const [selectedTheme, setSelectedTheme] = useState<string>('dark')

  // Change tracking state
  const [originalData, setOriginalData] = useState<{
    portfolioData: any
    selectedRepos: number[]
    skills: Skill[]
    socials: Social[]
    deployedUrls: Record<number, string>
    customNames: Record<number, string>
    customDescriptions: Record<number, string>
    githubUrls: Record<number, string>
    importedProjects: Repository[]
    selectedTheme: string
  } | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Build live portfolio data for preview (unsaved changes reflected)
  const livePortfolio = useMemo(() => {
    if (!user) return null

    const allRepos: Repository[] = [...(user?.repositories || []), ...importedProjects]
    const selected: Repository[] = [
      // Include selected GitHub repos
      ...selectedRepos
        .map(id => allRepos.find(r => r.id === id))
        .filter((r): r is Repository => Boolean(r)),
      // Include all imported projects (they are automatically selected)
      ...importedProjects
    ].filter((repo, index, self) => 
      // Remove duplicates based on repo.id
      index === self.findIndex(r => r.id === repo.id)
    )

    const repositories = selected.map(repo => ({
      id: repo.id,
      deployedUrl: deployedUrls[repo.id] || repo.homepage || "",
      isVisible: true,
      repository: {
        id: repo.id,
        name: repo.name,
        description: repo.description,
        htmlUrl: repo.htmlUrl,
        language: repo.language,
        stargazersCount: repo.stargazersCount,
        forksCount: repo.forksCount,
      }
    }))

    const skillsForPreview = skills.map((s, index) => ({
      id: parseInt(s.id) || index + 1,
      name: s.name,
      category: s.category,
    }))

    return {
      id: user.id,
      displayName: portfolioData.displayName,
      bio: portfolioData.bio,
      profilePic: portfolioData.profilePic,
      selectedTheme: selectedTheme,
      skills: skillsForPreview,
      socials: socials,
      repositories,
      user: {
        githubUsername: user.githubUsername,
        location: user.location,
        company: user.company,
        websiteUrl: user.websiteUrl,
      }
    }
  }, [user, portfolioData, skills, socials, selectedRepos, deployedUrls, importedProjects, selectedTheme])

  // Track changes to enable/disable publish button
  useEffect(() => {
    console.log("🔍 Change tracking effect triggered:", {
      isInitialLoad,
      hasOriginalData: !!originalData,
      originalDataKeys: originalData ? Object.keys(originalData) : null,
      portfolioData,
      selectedRepos: selectedRepos.length,
      skills: skills.length,
      socials: socials.length,
      deployedUrls: Object.keys(deployedUrls).length,
      importedProjects: importedProjects.length
    })
    
    // Don't track changes during initial load or if we don't have original data
    if (isInitialLoad || !originalData) {
      console.log("⏸️ Skipping change tracking - initial load:", isInitialLoad, "no original data:", !originalData)
      console.log("🔍 OriginalData details:", originalData)
      setHasUnsavedChanges(false) // Ensure publish button is disabled during initial load
      return
    }
    
        const currentData = {
          portfolioData,
          selectedRepos: [...selectedRepos].sort(), // Sort for consistent comparison
          skills: [...skills].sort((a, b) => a.id.localeCompare(b.id)),
          socials: [...socials].sort((a, b) => a.id - b.id),
          deployedUrls,
          customNames,
          customDescriptions,
          githubUrls,
          importedProjects: [...importedProjects].sort((a, b) => a.id - b.id),
          selectedTheme
        }
    
        // Helper function to clean and normalize data
        const normalizeData = (data: any) => {
          return JSON.parse(JSON.stringify(data, (key, value) => {
            // Remove null/undefined
            if (value === null || value === undefined) return undefined
            // Don't remove empty strings for portfolioData properties to maintain structure
            if (value === "" && key !== "displayName" && key !== "jobTitle" && key !== "bio" && key !== "profilePic" && key !== "customUsername") return undefined
            // Remove empty objects/arrays
            if (typeof value === 'object' && value !== null) {
              if (Array.isArray(value) && value.length === 0) return undefined
              if (!Array.isArray(value) && Object.keys(value).length === 0) return undefined
            }
            return value
          }))
        }
    
        const cleanCurrentData = normalizeData({
          ...currentData,
          selectedRepos: [...(currentData.selectedRepos || [])].sort(),
          skills: [...(currentData.skills || [])].sort((a, b) => a.id.localeCompare(b.id)),
          socials: [...(currentData.socials || [])].sort((a, b) => a.id - b.id),
          importedProjects: [...(currentData.importedProjects || [])].sort((a, b) => a.id - b.id),
          selectedTheme: currentData.selectedTheme || 'dark'
        })
        const cleanOriginalData = normalizeData({
          ...originalData,
          selectedRepos: [...(originalData.selectedRepos || [])].sort(),
          skills: [...(originalData.skills || [])].sort((a, b) => a.id.localeCompare(b.id)),
          socials: [...(originalData.socials || [])].sort((a, b) => a.id - b.id),
          importedProjects: [...(originalData.importedProjects || [])].sort((a, b) => a.id - b.id),
          selectedTheme: originalData.selectedTheme || 'dark'
        })
    
    const hasChanges = JSON.stringify(cleanCurrentData) !== JSON.stringify(cleanOriginalData)
    console.log("📊 Change detection:", { 
      hasChanges, 
      cleanCurrentDataString: JSON.stringify(cleanCurrentData), 
      cleanOriginalDataString: JSON.stringify(cleanOriginalData),
      cleanCurrentData,
      cleanOriginalData
    })
    setHasUnsavedChanges(hasChanges)
  }, [portfolioData, selectedRepos, skills, socials, deployedUrls, customNames, customDescriptions, githubUrls, importedProjects, selectedTheme, originalData, isInitialLoad])

  useEffect(() => {
    // Fetch session from server (httpOnly cookie)
    fetch("/api/session", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("No session")
        const data = await res.json()
        setSession(data.session)
        return data.session
      })
      .then(async () => {
        // Fetch GitHub data via server proxy endpoints
        const [userRes, reposRes] = await Promise.all([
          fetch("/api/github/user", { cache: "no-store" }),
          fetch("/api/github/repos", { cache: "no-store" }),
        ])
        if (!userRes.ok || !reposRes.ok) throw new Error("GitHub fetch failed")
        const userData = await userRes.json()
        const reposData = await reposRes.json()

        const repositories = reposData.map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || "",
          htmlUrl: repo.html_url,
          homepage: repo.homepage || "",
          language: repo.language || "",
          stargazersCount: repo.stargazers_count,
          forksCount: repo.forks_count,
          isPrivate: repo.private,
          isFork: repo.fork,
          size: repo.size || 0,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
          pushedAt: repo.pushed_at,
        }))

        const builtUser: User = {
          id: userData.id,
          name: userData.name || userData.login,
          email: userData.email || "",
          githubUsername: userData.login,
          avatarUrl: userData.avatar_url,
          bio: userData.bio || "",
          location: userData.location || "",
          websiteUrl: userData.blog || "",
          twitterUsername: userData.twitter_username || "",
          company: userData.company || "",
          publicRepos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
          repositories,
        }

        setUser(builtUser)

        const initialPortfolioData = {
          displayName: userData.name || userData.login,
          jobTitle: "",
          bio: userData.bio || "",
          profilePic: userData.avatar_url,
          customUsername: userData.login,
        }
        
        setPortfolioData(initialPortfolioData)
        console.log("🔍 Set portfolio data, about to call loadExistingPortfolioData")

        await loadExistingPortfolioData(userData.login, initialPortfolioData)
        console.log("🔍 loadExistingPortfolioData completed")
      })
      .catch(() => {
        router.push("/auth")
      })
      .finally(() => setLoading(false))
  }, [router])

  const loadExistingPortfolioData = async (username: string, initialPortfolioData?: any) => {
    console.log("🚀 loadExistingPortfolioData called with:", { username, initialPortfolioData })
    try {
      const response = await fetch(`/api/portfolio/publish?username=${username}`)
      console.log("📡 Portfolio fetch response:", response.status, response.ok)
      
      if (response.ok) {
        const result = await response.json()
        const portfolio = result.portfolio
        console.log("🔍 Found existing portfolio:", !!portfolio)
        
        if (portfolio) {
          // Update portfolio data with saved data
          setPortfolioData({
            displayName: portfolio.displayName || "",
            jobTitle: portfolio.jobTitle || "",
            bio: portfolio.bio || "",
            profilePic: portfolio.profilePic || "",
            customUsername: portfolio.customUsername || "",
          })

          // Theme will be set later in the setTimeout to avoid change tracking issues

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
          
          // Set deployed URLs, custom names, and descriptions
          if (portfolio.repositories && portfolio.repositories.length > 0) {
            devLog("Portfolio repositories from DB:", portfolio.repositories)
            
            const urls: Record<number, string> = {}
            const names: Record<number, string> = {}
            const descriptions: Record<number, string> = {}
            const githubUrls: Record<number, string> = {}
            
            portfolio.repositories.forEach((repo: any) => {
              const githubId = parseInt(repo.repository.githubId)
              devLog("Processing repo:", repo.repository.name, "GitHub ID:", githubId, "Deployed URL:", repo.deployedUrl, "GitHub URL:", repo.repository.githubUrl)
              
              if (repo.deployedUrl) {
                urls[githubId] = repo.deployedUrl
              }
              // Only set custom names/descriptions if they exist (not default values)
              if (repo.customName) {
                names[githubId] = repo.customName
              }
              if (repo.customDescription) {
                descriptions[githubId] = repo.customDescription
              }
              // Load GitHub URL for imported projects
              if (repo.repository.githubUrl) {
                githubUrls[githubId] = repo.repository.githubUrl
              }
            })
            
            devLog("Final deployed URLs object:", urls)
            devLog("Final custom names object:", names)
            devLog("Final custom descriptions object:", descriptions)
            devLog("Final GitHub URLs object:", githubUrls)
            
            setDeployedUrls(urls)
            setCustomNames(names)
            setCustomDescriptions(descriptions)
            setGithubUrls(githubUrls)
            
            // Set imported projects (URL-imported repositories)
            const importedProjects = portfolio.repositories
              .filter((repo: any) => repo.repository.isImported)
              .map((repo: any) => ({
                id: parseInt(repo.repository.githubId),
                name: repo.repository.name,
                fullName: repo.repository.fullName || repo.repository.name,
                description: repo.repository.description || "",
                htmlUrl: repo.repository.htmlUrl,
                homepage: repo.deployedUrl || "",
                language: repo.repository.language || "Web Project",
                stargazersCount: repo.repository.stargazersCount || 0,
                forksCount: repo.repository.forksCount || 0,
                isPrivate: repo.repository.isPrivate || false,
                isFork: repo.repository.isFork || false,
                size: repo.repository.size || 0,
                createdAt: repo.repository.createdAt,
                updatedAt: repo.repository.updatedAt,
                pushedAt: repo.repository.pushedAt || repo.repository.updatedAt,
                isImported: true
              }))
            devLog("Setting imported projects:", importedProjects)
            setImportedProjects(importedProjects)
            
            // Set selected repos - keep the original logic but ensure imported projects are included
            const githubIds = portfolio.repositories.map((repo: any) => {
              const githubId = parseInt(repo.repository.githubId)
              devLog("Mapping repo:", repo.repository.name, "GitHub ID:", githubId, "Type:", typeof githubId)
              return githubId
            })
            devLog("Setting selected repos to:", githubIds)
            setSelectedRepos(githubIds)
          }
          
          // Set skills
          if (portfolio.skills && portfolio.skills.length > 0) {
            devLog("Loading skills from portfolio:", portfolio.skills)
            const formattedSkills = portfolio.skills.map((skill: any) => ({
              id: skill.id.toString(),
              name: skill.name,
              category: skill.category
            }))
            devLog("Formatted skills:", formattedSkills)
            setSkills(formattedSkills)
          } else {
            devLog("No skills found in portfolio data")
          }

          // Set original data for change tracking after loading
          setTimeout(() => {
            const currentSelectedTheme = portfolio.selectedTheme || 'dark'
            setSelectedTheme(currentSelectedTheme) // Make sure theme state matches DB
            
            const originalDataToSet = {
              portfolioData: {
                displayName: portfolio.displayName || "",
                jobTitle: portfolio.jobTitle || "",
                bio: portfolio.bio || "",
                profilePic: portfolio.profilePic || "",
                customUsername: portfolio.customUsername || "",
              },
              selectedRepos: portfolio.repositories ? portfolio.repositories.map((repo: any) => parseInt(repo.repository.githubId)) : [],
              skills: portfolio.skills ? portfolio.skills.map((skill: any) => ({
                id: skill.id.toString(),
                name: skill.name,
                category: skill.category
              })) : [],
              socials: portfolio.socials ? portfolio.socials.map((social: any) => ({
                id: social.id,
                platform: social.platform,
                username: social.username,
                url: social.url,
                isPinned: social.isPinned
              })) : [],
              deployedUrls: portfolio.repositories ? (() => {
                const urls: Record<number, string> = {}
                portfolio.repositories.forEach((repo: any) => {
                  const githubId = parseInt(repo.repository.githubId)
                  if (repo.deployedUrl) {
                    urls[githubId] = repo.deployedUrl
                  }
                })
                return urls
              })() : {},
              customNames: portfolio.repositories ? (() => {
                const names: Record<number, string> = {}
                portfolio.repositories.forEach((repo: any) => {
                  const githubId = parseInt(repo.repository.githubId)
                  if (repo.customName) {
                    names[githubId] = repo.customName
                  }
                })
                return names
              })() : {},
              customDescriptions: portfolio.repositories ? (() => {
                const descriptions: Record<number, string> = {}
                portfolio.repositories.forEach((repo: any) => {
                  const githubId = parseInt(repo.repository.githubId)
                  if (repo.customDescription) {
                    descriptions[githubId] = repo.customDescription
                  }
                })
                return descriptions
              })() : {},
              githubUrls: portfolio.repositories ? (() => {
                const urls: Record<number, string> = {}
                portfolio.repositories.forEach((repo: any) => {
                  const githubId = parseInt(repo.repository.githubId)
                  if (repo.repository.githubUrl) {
                    urls[githubId] = repo.repository.githubUrl
                  }
                })
                return urls
              })() : {},
              importedProjects: portfolio.repositories ? portfolio.repositories
                .filter((repo: any) => repo.repository.isImported)
                .map((repo: any) => ({
                  id: parseInt(repo.repository.githubId),
                  name: repo.repository.name,
                  fullName: repo.repository.fullName || repo.repository.name,
                  description: repo.repository.description || "",
                  htmlUrl: repo.repository.htmlUrl,
                  homepage: repo.deployedUrl || "",
                  language: repo.repository.language || "Web Project",
                  stargazersCount: repo.repository.stargazersCount || 0,
                  forksCount: repo.repository.forksCount || 0,
                  isPrivate: repo.repository.isPrivate || false,
                  isFork: repo.repository.isFork || false,
                  size: repo.repository.size || 0,
                  createdAt: repo.repository.createdAt,
                  updatedAt: repo.repository.updatedAt,
                  pushedAt: repo.repository.pushedAt || repo.repository.updatedAt,
                  isImported: true
                })) : [],
              selectedTheme: currentSelectedTheme
            }
            
            console.log("💾 Setting original data from existing portfolio:", originalDataToSet)
            setOriginalData(originalDataToSet)
            setIsInitialLoad(false)
            console.log("✅ Initial load completed, change tracking enabled")
          }, 200) // Increased timeout to ensure all state updates are complete
        } else {
          console.log("🔍 No existing portfolio found in response")
        }
      } else {
        // No existing portfolio data, set initial data and mark as loaded
        console.log("📝 No existing portfolio data found (404), setting initial data")
          console.log("🔍 Current state before setting initial data:", {
            portfolioData,
            selectedRepos,
            skills,
            socials,
            deployedUrls,
            customNames,
            customDescriptions,
            githubUrls,
            importedProjects
          })
          setTimeout(() => {
          const currentPortfolioData = initialPortfolioData || portfolioData
          console.log("🔍 Using portfolio data:", currentPortfolioData)
          
          // Ensure theme state is properly initialized
          const currentTheme = selectedTheme || 'dark'
          setSelectedTheme(currentTheme)
          
          const initialData = {
            portfolioData: {
              displayName: currentPortfolioData.displayName || "",
              jobTitle: currentPortfolioData.jobTitle || "",
              bio: currentPortfolioData.bio || "",
              profilePic: currentPortfolioData.profilePic || "",
              customUsername: currentPortfolioData.customUsername || "",
            },
            selectedRepos: [...selectedRepos],
            skills: [...skills],
            socials: [...socials],
            deployedUrls: { ...deployedUrls },
            customNames: { ...customNames },
            customDescriptions: { ...customDescriptions },
            githubUrls: { ...githubUrls },
            selectedTheme: currentTheme,
            importedProjects: [...importedProjects]
          }
            console.log("💾 Setting initial data (no existing portfolio):", initialData)
            setOriginalData(initialData)
            setIsInitialLoad(false)
            console.log("✅ Initial load completed (no existing data), change tracking enabled")
            console.log("🔍 After setOriginalData - originalData should be set, isInitialLoad:", false)
          }, 200)
      }
    } catch (error) {
      console.error("❌ Error loading existing portfolio data:", error)
      // Even if there's an error, mark as loaded to prevent infinite loading
      setTimeout(() => {
        const currentPortfolioData = initialPortfolioData || portfolioData
        // Ensure theme state is properly initialized
        const currentTheme = selectedTheme || 'dark'
        setSelectedTheme(currentTheme)
        
        const fallbackData = {
          portfolioData: {
            displayName: currentPortfolioData.displayName || "",
            jobTitle: currentPortfolioData.jobTitle || "",
            bio: currentPortfolioData.bio || "",
            profilePic: currentPortfolioData.profilePic || "",
            customUsername: currentPortfolioData.customUsername || "",
          },
          selectedRepos: [...selectedRepos],
          skills: [...skills],
          socials: [...socials],
          deployedUrls: { ...deployedUrls },
          customNames: { ...customNames },
          customDescriptions: { ...customDescriptions },
          githubUrls: { ...githubUrls },
          selectedTheme: currentTheme,
          importedProjects: [...importedProjects]
        }
        console.log("💾 Setting fallback data due to error:", fallbackData)
        setOriginalData(fallbackData)
        setIsInitialLoad(false)
        console.log("✅ Initial load completed (error fallback), change tracking enabled")
      }, 200)
    }
  }

  const fetchUserData = async (accessToken: string) => {
    try {
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/vnd.github.v3+json",
        },
      })
      
      const reposResponse = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/vnd.github.v3+json",
        },
      })
      
      if (userResponse.ok && reposResponse.ok) {
        const userData = await userResponse.json()
        const reposData = await reposResponse.json()
        
        const repositories = reposData.map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || "",
          htmlUrl: repo.html_url,
          homepage: repo.homepage || "",
          language: repo.language || "",
          stargazersCount: repo.stargazers_count,
          forksCount: repo.forks_count,
          isPrivate: repo.private,
          isFork: repo.fork,
          size: repo.size || 0,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
          pushedAt: repo.pushed_at,
        }))
        
          devLog("GitHub repositories fetched:", repositories.map((r:any) => ({ id: r.id, name: r.name, type: typeof r.id })))
        
        const user: User = {
          id: userData.id,
          name: userData.name || userData.login,
          email: userData.email || "",
          githubUsername: userData.login,
          avatarUrl: userData.avatar_url,
          bio: userData.bio || "",
          location: userData.location || "",
          websiteUrl: userData.blog || "",
          twitterUsername: userData.twitter_username || "",
          company: userData.company || "",
          publicRepos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
          repositories: repositories
        }
        
        setUser(user)
        
        // Initialize portfolio data with GitHub data
        setPortfolioData({
          displayName: userData.name || userData.login,
          jobTitle: "",
          bio: userData.bio || "",
          profilePic: userData.avatar_url,
          customUsername: userData.login,
        })

        // Load existing portfolio data from database
        devLog("About to load existing portfolio data for:", userData.login)
        await loadExistingPortfolioData(userData.login)
        
        // Add a small delay to ensure state updates
        setTimeout(() => {
          devLog("After loading portfolio data - Skills:", skills.length, "Selected repos:", selectedRepos.length)
          devLog("Current skills state:", skills)
          devLog("Current selectedRepos state:", selectedRepos)
        }, 100)
      }
    } catch (error) {
      console.error("Error fetching GitHub data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Sound notification function - Success chime
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create a pleasant success chime (C-E-G chord)
      const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.05)
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.05)
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + index * 0.05 + 0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.05 + 0.8)
        
        oscillator.start(audioContext.currentTime + index * 0.05)
        oscillator.stop(audioContext.currentTime + index * 0.05 + 0.8)
      })
    } catch (error) {
      console.log("Could not play notification sound:", error)
    }
  }

  const handlePublishAll = async () => {
    setIsPublishing(true)
    try {
      const allRepositories = [...(user?.repositories || []), ...importedProjects]
      
      const response = await fetch("/api/portfolio/publish-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portfolioData,
          selectedRepos,
          skills,
          socials,
          deployedUrls,
          customNames,
          customDescriptions,
          githubUrls,
          selectedTheme,
          repositories: allRepositories,
          userId: user?.id,
          userData: user
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Update original data to match current data (no more unsaved changes)
        setOriginalData({
          portfolioData,
          selectedRepos,
          skills,
          socials,
          deployedUrls,
          customNames,
          customDescriptions,
          githubUrls,
          selectedTheme,
          importedProjects
        })
        setHasUnsavedChanges(false)
        setIsInitialLoad(false)
        
        // Show success toast and play sound
        toast.success("🎉 Portfolio published successfully!", {
          duration: 3000,
          position: "top-left",
          style: {
            background: "#f97316",
            color: "#fff",
            fontWeight: "500",
            border: "1px solid #ea580c",
            borderRadius: "8px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f97316",
          },
        })
        
        // Play notification sound
        playNotificationSound()
      } else {
        throw new Error(result.error || "Failed to publish portfolio")
      }
    } catch (error) {
      console.error("Error publishing portfolio:", error)
      
      // Show error toast
      toast.error("Failed to publish portfolio. Please try again.", {
        duration: 3000,
        position: "top-left",
        style: {
          background: "#dc2626",
          color: "#fff",
          fontWeight: "500",
          border: "1px solid #b91c1c",
          borderRadius: "8px",
        },
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUpdatePortfolioData = (data: any) => {
    setPortfolioData(prev => ({ ...prev, ...data }))
  }

  const handleToggleRepo = (repoId: number) => {
    setSelectedRepos(prev => 
      prev.includes(repoId) 
        ? prev.filter(id => id !== repoId)
        : [...prev, repoId]
    )
  }

  const handleUpdateDeployedUrl = (repoId: number, url: string) => {
    setDeployedUrls(prev => ({ ...prev, [repoId]: url }))
  }

  const handleUpdateCustomName = (repoId: number, name: string) => {
    setCustomNames(prev => ({
      ...prev,
      [repoId]: name
    }))
  }

  const handleUpdateCustomDescription = (repoId: number, description: string) => {
    setCustomDescriptions(prev => ({
      ...prev,
      [repoId]: description
    }))
  }

  const handleUpdateGithubUrl = (repoId: number, url: string) => {
    setGithubUrls(prev => ({
      ...prev,
      [repoId]: url
    }))
  }

  const handleAddSkill = (skill: Omit<Skill, 'id'>) => {
    const newSkill: Skill = {
      ...skill,
      id: Date.now().toString()
    }
    setSkills(prev => [...prev, newSkill])
  }

  const handleRemoveSkill = (skillId: string) => {
    setSkills(prev => prev.filter(skill => skill.id !== skillId))
  }

  const handleAddImportedProject = (project: Repository) => {
    setImportedProjects(prev => [...prev, project])
    // Also add to selectedRepos so it appears in the UI
    setSelectedRepos(prev => [...prev, project.id])
  }

  const handleAddSocial = (social: Omit<Social, 'id'>) => {
    const newSocial: Social = {
      ...social,
      id: Date.now() // Temporary ID, will be replaced by database
    }
    setSocials(prev => [...prev, newSocial])
  }

  const handleRemoveSocial = (socialId: number) => {
    setSocials(prev => prev.filter(social => social.id !== socialId))
  }

  const handleTogglePin = (socialId: number) => {
    setSocials(prev => prev.map(social => 
      social.id === socialId 
        ? { ...social, isPinned: !social.isPinned }
        : social
    ))
  }

  const handleUpdateSocial = (socialId: number, updates: Partial<Social>) => {
    setSocials(prev => prev.map(social => 
      social.id === socialId 
        ? { ...social, ...updates }
        : social
    ))
  }

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme)
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "home":
        return (
          <HomeSection 
            user={user} 
            portfolioData={portfolioData}
            onUpdate={handleUpdatePortfolioData}
          />
        )
      case "repos":
        return (
          <ReposSection
            repositories={[...(user?.repositories || []), ...importedProjects]}
            selectedRepos={selectedRepos}
            deployedUrls={deployedUrls}
            customNames={customNames}
            customDescriptions={customDescriptions}
            githubUrls={githubUrls}
            onToggleRepo={handleToggleRepo}
            onUpdateDeployedUrl={handleUpdateDeployedUrl}
            onUpdateCustomName={handleUpdateCustomName}
            onUpdateCustomDescription={handleUpdateCustomDescription}
            onUpdateGithubUrl={handleUpdateGithubUrl}
            onAddImportedProject={handleAddImportedProject}
          />
        )
      case "skills":
        return (
          <SkillsSection
            skills={skills}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
          />
        )
      case "socials":
        return (
          <SocialsSection
            socials={socials}
            onAddSocial={handleAddSocial}
            onRemoveSocial={handleRemoveSocial}
            onTogglePin={handleTogglePin}
            onUpdateSocial={handleUpdateSocial}
          />
        )
      case "theme":
        return (
          <ThemeSelector
            currentTheme={selectedTheme as any}
            userId={user?.id || 0}
            onThemeChange={handleThemeChange}
          />
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <DevFolioLoader size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">No user data found</p>
        </div>
      </div>
    )
  }

          return (
            <>
              <Toaster 
                position="top-left"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#f97316',
                    color: '#fff',
                    border: '1px solid #ea580c',
                    borderRadius: '8px',
                    fontWeight: '500',
                  },
                }}
              />
              <DashboardLayout 
                user={user} 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                livePortfolio={livePortfolio}
                portfolioData={portfolioData}
                hasUnsavedChanges={hasUnsavedChanges && !isInitialLoad}
                onPublish={handlePublishAll}
                isPublishing={isPublishing}
              >
                {renderActiveSection()}
              </DashboardLayout>
            </>
          )
}
