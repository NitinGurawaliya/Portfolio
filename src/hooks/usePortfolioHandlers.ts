import { Skill, Social, Repository, UsernameAvailability, PortfolioData } from "@/interface"
import { checkUsernameAvailability } from "@/lib/services/portfolio-service"
import { useState, Dispatch, SetStateAction } from "react"

export const usePortfolioHandlers = (
  setPortfolioData: React.Dispatch<React.SetStateAction<PortfolioData>>,
  setSelectedRepos: React.Dispatch<React.SetStateAction<number[]>>,
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>,
  setSocials: React.Dispatch<React.SetStateAction<Social[]>>,
  setDeployedUrls: React.Dispatch<React.SetStateAction<Record<number, string>>>,
  setCustomNames: React.Dispatch<React.SetStateAction<Record<number, string>>>,
  setCustomDescriptions: React.Dispatch<React.SetStateAction<Record<number, string>>>,
  setGithubUrls: React.Dispatch<React.SetStateAction<Record<number, string>>>,
  setProjectCategories: React.Dispatch<React.SetStateAction<Record<number, string>>>,
  setProjectStatuses: React.Dispatch<React.SetStateAction<Record<number, string>>>,
  setProjectRevenues: React.Dispatch<React.SetStateAction<Record<number, number>>>,
  setProjectMrrs: React.Dispatch<React.SetStateAction<Record<number, number>>>,
  setProjectUsers: React.Dispatch<React.SetStateAction<Record<number, number>>>,
  setProjectTechnologies: React.Dispatch<React.SetStateAction<Record<number, string>>>,
  setImportedProjects: React.Dispatch<React.SetStateAction<Repository[]>>,
  setRepoOrder: React.Dispatch<React.SetStateAction<number[]>>,
  setSelectedTheme: React.Dispatch<React.SetStateAction<string>>,
  originalData: any,
  user?: any
) => {
  const [usernameAvailability, setUsernameAvailability] = useState<UsernameAvailability>({
    isChecking: false,
    isAvailable: null,
    message: ""
  })

  const handleUpdatePortfolioData = (data: Partial<PortfolioData>) => {
    setPortfolioData(prev => ({ ...prev, ...data }))

    // Check username availability ONLY if customUsername field changed
    if (data.customUsername !== undefined) {
      if (data.customUsername.trim()) {
        const newUsername = data.customUsername.trim().toLowerCase()
        const originalCustomUsername = originalData?.portfolioData?.customUsername?.trim().toLowerCase()
        const githubUsername = user?.githubUsername?.trim().toLowerCase()
        
        // Debug: Username comparison (temporary for testing)
        console.log("🔍 Username comparison:", { 
          newUsername, 
          originalCustomUsername, 
          githubUsername,
          originalData: originalData?.portfolioData 
        })
        
        // Check if username matches original custom username or GitHub username
        const isCurrentUsername = newUsername === originalCustomUsername || 
                                  newUsername === githubUsername
        
        console.log("🔍 Current username check result:", { 
          newUsername, 
          originalCustomUsername, 
          githubUsername,
          isCurrentUsername 
        })
        
        if (isCurrentUsername) {
          setUsernameAvailability({
            isChecking: false,
            isAvailable: true,
            message: "This is your current username"
          })
        } else {
          handleCheckUsernameAvailability(newUsername)
        }
      } else {
        // Empty username - clear availability
        setUsernameAvailability({
          isChecking: false,
          isAvailable: null,
          message: ""
        })
      }
    }
  }
  
  const handleCheckUsernameAvailability = async (username: string) => {
    if (!username.trim()) {
      setUsernameAvailability({
        isChecking: false,
        isAvailable: null,
        message: ""
      })
      return
    }
    
    setUsernameAvailability({
      isChecking: true,
      isAvailable: null,
      message: "Checking availability..."
    })
    
    const result = await checkUsernameAvailability(
      username,
      originalData?.portfolioData?.customUsername,
      user?.githubUsername,
      user?.id
    )
    
    setUsernameAvailability(result)
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
    setCustomNames(prev => ({ ...prev, [repoId]: name }))
  }

  const handleUpdateCustomDescription = (repoId: number, description: string) => {
    setCustomDescriptions(prev => ({ ...prev, [repoId]: description }))
  }

  const handleUpdateProjectCategory = (repoId: number, category: string | null) => {
    setProjectCategories(prev => {
      const next = { ...prev }
      const normalized = category?.trim() || ""
      if (!normalized) {
        delete next[repoId]
        return next
      }
      next[repoId] = normalized
      return next
    })
  }

  const handleUpdateProjectStatus = (repoId: number, status: string | null) => {
    setProjectStatuses(prev => {
      const next = { ...prev }
      const normalized = status?.trim() || ""
      if (!normalized) {
        delete next[repoId]
        return next
      }
      next[repoId] = normalized
      return next
    })
  }

  const handleUpdateNumericInsight = (
    repoId: number,
    value: number | null | undefined,
    setter: Dispatch<SetStateAction<Record<number, number>>>
  ) => {
    setter(prev => {
      const next = { ...prev }
      if (value === null || value === undefined || Number.isNaN(value)) {
        delete next[repoId]
        return next
      }
      next[repoId] = value
      return next
    })
  }

  const handleUpdateProjectRevenue = (repoId: number, revenue?: number | null) => {
    handleUpdateNumericInsight(repoId, revenue ?? null, setProjectRevenues)
  }

  const handleUpdateProjectMrr = (repoId: number, mrr?: number | null) => {
    handleUpdateNumericInsight(repoId, mrr ?? null, setProjectMrrs)
  }

  const handleUpdateProjectUsers = (repoId: number, users?: number | null) => {
    handleUpdateNumericInsight(repoId, users ?? null, setProjectUsers)
  }

  const handleUpdateProjectTechnologies = (repoId: number, technologies?: string | null) => {
    setProjectTechnologies(prev => {
      const next = { ...prev }
      const normalized = technologies?.trim() || ""
      if (!normalized) {
        delete next[repoId]
        return next
      }
      next[repoId] = normalized
      return next
    })
  }

  const handleUpdateGithubUrl = (repoId: number, url: string) => {
    setGithubUrls(prev => ({
      ...prev,
      [repoId]: url
    }))
  }

  const handleUpdateRepoOrder = (newOrder: number[]) => {
    setRepoOrder(newOrder)
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
    console.log("📦 Adding imported project to state:", project)
    setImportedProjects(prev => {
      const newProjects = [...prev, project]
      console.log("📦 Updated importedProjects:", newProjects)
      return newProjects
    })
    setSelectedRepos(prev => {
      const newSelected = [...prev, project.id]
      console.log("📦 Updated selectedRepos:", newSelected)
      return newSelected
    })
    setRepoOrder(prev => {
      const newOrder = [...prev, project.id]
      console.log("📦 Updated repoOrder:", newOrder)
      return newOrder
    })
    // Set deployedUrl if project has homepage or htmlUrl
    if (project.homepage || project.htmlUrl) {
      const deployedUrl = project.homepage || project.htmlUrl || ""
      if (deployedUrl) {
        setDeployedUrls(prev => ({
          ...prev,
          [project.id]: deployedUrl
        }))
        console.log("📦 Set deployedUrl for project:", project.id, deployedUrl)
      }
    }
  }

  const handleAddSocial = (social: Omit<Social, 'id'>) => {
    const newSocial: Social = {
      ...social,
      id: Date.now()
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


  return {
    usernameAvailability,
    handleUpdatePortfolioData,
    handleToggleRepo,
    handleUpdateDeployedUrl,
    handleUpdateCustomName,
    handleUpdateCustomDescription,
      handleUpdateProjectCategory,
      handleUpdateProjectStatus,
      handleUpdateProjectRevenue,
      handleUpdateProjectMrr,
      handleUpdateProjectUsers,
      handleUpdateProjectTechnologies,
    handleUpdateGithubUrl,
    handleUpdateRepoOrder,
    handleAddSkill,
    handleRemoveSkill,
    handleAddImportedProject,
    handleAddSocial,
    handleRemoveSocial,
    handleTogglePin,
    handleUpdateSocial,
    handleThemeChange,
  }
}

