import { Repository, Skill, Social } from "@/interface"

/**
 * Data को normalize करता है - null/undefined values remove करता है
 */
export const normalizeData = (data: any) => {
  console.log("🔍 DEBUG: normalizeData input:", data)
  const result = JSON.parse(JSON.stringify(data, (key, value) => {
    // Remove null/undefined
    if (value === null || value === undefined) return undefined
    // Don't remove empty strings for portfolioData properties
    if (value === "" && key !== "displayName" && key !== "jobTitle" && key !== "bio" && key !== "profilePic" && key !== "customUsername") return undefined
    // Don't remove id field even if it's 0
    if (key === "id" && (value === 0 || value === "0")) return value
    // Remove empty objects/arrays
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value) && value.length === 0) return undefined
      if (!Array.isArray(value) && Object.keys(value).length === 0) return undefined
    }
    return value
  }))
  console.log("🔍 DEBUG: normalizeData output:", result)
  return result
}

/**
 * Imported projects को normalize करता है - languages field ensure करता है
 */
export const normalizeImportedProjects = (projects: Repository[]) => {
  return projects.map(project => ({
    ...project,
    languages: project.languages || []
  }))
}

/**
 * Success notification के लिए sound play करता है
 */
export const playNotificationSound = () => {
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

/**
 * Repository languages को parse करता है
 */
export const parseRepositoryLanguages = (repo: any): string[] => {
  let languages: string[] = []
  if (repo.repository.languages) {
    try {
      languages = JSON.parse(repo.repository.languages)
    } catch (e) {
      languages = repo.repository.language ? [repo.repository.language] : []
    }
  } else if (repo.repository.language) {
    languages = [repo.repository.language]
  }
  return languages
}

/**
 * Portfolio repositories को map करता है database format से
 */
export const mapPortfolioRepositories = (portfolioRepos: any[]) => {
  const urls: Record<number, string> = {}
  const names: Record<number, string> = {}
  const descriptions: Record<number, string> = {}
  const githubUrls: Record<number, string> = {}
  
  portfolioRepos.forEach((repo: any) => {
    const githubId = parseInt(repo.repository.githubId)
    
    if (repo.deployedUrl) {
      urls[githubId] = repo.deployedUrl
    }
    if (repo.customName) {
      names[githubId] = repo.customName
    }
    if (repo.customDescription) {
      descriptions[githubId] = repo.customDescription
    }
    if (repo.repository.githubUrl) {
      githubUrls[githubId] = repo.repository.githubUrl
    }
  })
  
  return { urls, names, descriptions, githubUrls }
}

/**
 * Imported projects को format करता है database data से
 */
export const formatImportedProjects = (portfolioRepos: any[]): Repository[] => {
  return portfolioRepos
    .map((repo: any) => {
      const languages = parseRepositoryLanguages(repo)
      const githubId = parseInt(repo.repository.githubId)
      
      return {
        id: githubId, // Use GitHub ID as the main ID
        githubId: githubId, // Also store as githubId property
        name: repo.repository.name,
        fullName: repo.repository.fullName || repo.repository.name,
        description: repo.repository.description || "",
        htmlUrl: repo.repository.htmlUrl,
        homepage: repo.deployedUrl || "",
        language: repo.repository.language || "",
        languages: languages,
        stargazersCount: repo.repository.stargazersCount || 0,
        forksCount: repo.repository.forksCount || 0,
        isPrivate: repo.repository.isPrivate || false,
        isFork: repo.repository.isFork || false,
        size: repo.repository.size || 0,
        createdAt: repo.repository.createdAt,
        updatedAt: repo.repository.updatedAt,
        pushedAt: repo.repository.pushedAt || repo.repository.updatedAt,
        favicon: repo.repository.favicon,
        logo: repo.repository.logo,
        githubUrl: repo.repository.githubUrl,
        isImported: true
      }
    })
}

/**
 * Portfolio data को build करता है live preview के लिए
 */
export const buildLivePortfolio = (
  user: any,
  portfolioData: any,
  skills: Skill[],
  socials: Social[],
  selectedRepos: number[],
  deployedUrls: Record<number, string>,
  importedProjects: Repository[],
  selectedTheme: string,
  customNames: Record<number, string>,
  customDescriptions: Record<number, string>,
  repoOrder: number[]
) => {
  if (!user) return null

  // Use database repositories (importedProjects) as the primary source since they have favicon/logo data
  // Fall back to GitHub repositories only if not found in database
  const allRepos: Repository[] = [...importedProjects, ...(user?.repositories || [])]
  const mergedRepos = allRepos.reduce((acc, repo) => {
    const existingIndex = acc.findIndex(r => r.id === repo.id)
    if (existingIndex === -1) {
      acc.push(repo)
    }
    // If repository already exists, keep the first one (database version has priority)
    return acc
  }, [] as Repository[])
  
  const selected: Repository[] = selectedRepos
    .map(id => mergedRepos.find(r => r.id === id))
    .filter((r): r is Repository => Boolean(r))

  // Sort repositories according to repoOrder
  const sortedRepos = repoOrder.length > 0 
    ? [...selected].sort((a, b) => {
        const indexA = repoOrder.indexOf(a.id)
        const indexB = repoOrder.indexOf(b.id)
        if (indexA === -1 && indexB === -1) return 0
        if (indexA === -1) return 1
        if (indexB === -1) return -1
        return indexA - indexB
      })
    : selected

  const repositories = sortedRepos.map(repo => ({
    id: repo.id, // This is the database repository ID
    deployedUrl: deployedUrls[repo.id] || repo.homepage || "",
    isVisible: true,
    customName: customNames[repo.id] || null,
    customDescription: customDescriptions[repo.id] || null,
    repository: {
      id: repo.githubId || repo.id, // Use GitHub ID if available, otherwise use repo.id (which should be GitHub ID from formatImportedProjects)
      githubId: repo.githubId || repo.id, // Add GitHub ID
      name: repo.name,
      description: repo.description,
      htmlUrl: repo.htmlUrl,
      language: repo.language,
      languages: repo.languages ? JSON.stringify(repo.languages) : null,
      stargazersCount: repo.stargazersCount,
      forksCount: repo.forksCount,
      favicon: repo.favicon,
      logo: repo.logo,
      githubUrl: repo.githubUrl,
      isImported: repo.isImported
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
    customUsername: portfolioData.customUsername,
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
}

