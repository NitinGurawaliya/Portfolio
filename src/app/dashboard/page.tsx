"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { HomeSection } from "@/components/dashboard/HomeSection"
import { ReposSection } from "@/components/dashboard/ReposSection"
import { SkillsSection } from "@/components/dashboard/SkillsSection"
import { SocialsSection } from "@/components/dashboard/SocialsSection"

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

  // Change tracking state
  const [originalData, setOriginalData] = useState({
    portfolioData: {},
    selectedRepos: [] as number[],
    skills: [] as Skill[],
    socials: [] as Social[],
    deployedUrls: {} as Record<number, string>,
    importedProjects: [] as Repository[]
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Build live portfolio data for preview (unsaved changes reflected)
  const livePortfolio = useMemo(() => {
    if (!user) return null

    const allRepos: Repository[] = [...(user?.repositories || []), ...importedProjects]
    const selected: Repository[] = selectedRepos
      .map(id => allRepos.find(r => r.id === id))
      .filter((r): r is Repository => Boolean(r))

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
  }, [user, portfolioData, skills, socials, selectedRepos, deployedUrls, importedProjects])

  // Track changes to enable/disable publish button
  useEffect(() => {
    const currentData = {
      portfolioData,
      selectedRepos,
      skills,
      socials,
      deployedUrls,
      importedProjects
    }
    
    const hasChanges = JSON.stringify(currentData) !== JSON.stringify(originalData)
    setHasUnsavedChanges(hasChanges)
  }, [portfolioData, selectedRepos, skills, socials, deployedUrls, importedProjects, originalData])

  useEffect(() => {
    // Check for session cookie
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('github-session='))
    
    if (!sessionCookie) {
      router.push("/auth")
      return
    }
    
    try {
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie.split('=')[1]))
      setSession(sessionData)
      fetchUserData(sessionData.user.accessToken)
    } catch (error) {
      console.error("Error parsing session:", error)
      router.push("/auth")
    }
  }, [router])

  const loadExistingPortfolioData = async (username: string) => {
    try {
      const response = await fetch(`/api/portfolio/publish?username=${username}`)
      if (response.ok) {
        const result = await response.json()
        const portfolio = result.portfolio
        
        if (portfolio) {
          // Update portfolio data with saved data
          setPortfolioData({
            displayName: portfolio.displayName || "",
            jobTitle: portfolio.jobTitle || "",
            bio: portfolio.bio || "",
            profilePic: portfolio.profilePic || "",
            customUsername: portfolio.customUsername || "",
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
          
          // Set deployed URLs first
          if (portfolio.repositories && portfolio.repositories.length > 0) {
            console.log("Portfolio repositories from DB:", portfolio.repositories)
            
            const urls: Record<number, string> = {}
            portfolio.repositories.forEach((repo: any) => {
              const githubId = parseInt(repo.repository.githubId)
              console.log("Processing repo for deployed URL:", repo.repository.name, "GitHub ID:", githubId, "Deployed URL:", repo.deployedUrl)
              if (repo.deployedUrl) {
                urls[githubId] = repo.deployedUrl
              }
            })
            console.log("Final deployed URLs object:", urls)
            setDeployedUrls(urls)
            
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
            console.log("Setting imported projects:", importedProjects)
            setImportedProjects(importedProjects)
            
            // Set selected repos - keep the original logic but ensure imported projects are included
            const githubIds = portfolio.repositories.map((repo: any) => {
              const githubId = parseInt(repo.repository.githubId)
              console.log("Mapping repo:", repo.repository.name, "GitHub ID:", githubId, "Type:", typeof githubId)
              return githubId
            })
            console.log("Setting selected repos to:", githubIds)
            setSelectedRepos(githubIds)
          }
          
          // Set skills
          if (portfolio.skills && portfolio.skills.length > 0) {
            console.log("Loading skills from portfolio:", portfolio.skills)
            const formattedSkills = portfolio.skills.map((skill: any) => ({
              id: skill.id.toString(),
              name: skill.name,
              category: skill.category
            }))
            console.log("Formatted skills:", formattedSkills)
            setSkills(formattedSkills)
          } else {
            console.log("No skills found in portfolio data")
          }

          // Set original data for change tracking after loading
          setTimeout(() => {
            setOriginalData({
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
              importedProjects: importedProjects
            })
          }, 100)
        }
      }
    } catch (error) {
      console.error("Error loading existing portfolio data:", error)
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
        
        console.log("GitHub repositories fetched:", repositories.map((r:any) => ({ id: r.id, name: r.name, type: typeof r.id })))
        
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
        console.log("About to load existing portfolio data for:", userData.login)
        await loadExistingPortfolioData(userData.login)
        
        // Add a small delay to ensure state updates
        setTimeout(() => {
          console.log("After loading portfolio data - Skills:", skills.length, "Selected repos:", selectedRepos.length)
          console.log("Current skills state:", skills)
          console.log("Current selectedRepos state:", selectedRepos)
        }, 100)
      }
    } catch (error) {
      console.error("Error fetching GitHub data:", error)
    } finally {
      setLoading(false)
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
          importedProjects
        })
        setHasUnsavedChanges(false)
        
        // Show success message
        alert("🎉 Portfolio published successfully! All changes have been saved and are now live.")
      } else {
        throw new Error(result.error || "Failed to publish portfolio")
      }
    } catch (error) {
      console.error("Error publishing portfolio:", error)
      alert("Failed to publish portfolio. Please try again.")
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
            onToggleRepo={handleToggleRepo}
            onUpdateDeployedUrl={handleUpdateDeployedUrl}
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
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">No user data found</p>
          <button
            onClick={() => fetchUserData(session?.user?.accessToken)}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
          >
            Refresh Data
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      user={user} 
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      livePortfolio={livePortfolio}
      portfolioData={portfolioData}
      hasUnsavedChanges={hasUnsavedChanges}
      onPublish={handlePublishAll}
      isPublishing={isPublishing}
    >
      {renderActiveSection()}
    </DashboardLayout>
  )
}
