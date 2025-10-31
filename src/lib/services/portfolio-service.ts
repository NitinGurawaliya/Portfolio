import { User, Repository } from "@/interface"

/**
 * Portfolio को publish करता है
 */
export const publishPortfolio = async (data: {
  portfolioData: any
  selectedRepos: number[]
  skills: any[]
  socials: any[]
  deployedUrls: Record<number, string>
  customNames: Record<number, string>
  customDescriptions: Record<number, string>
  githubUrls: Record<number, string>
  selectedTheme: string
  repoOrder: number[]
  repositories: Repository[]
  userId: number
  userData: User | null
  logoOverrides?: Record<number, string>
  backgroundColor?: string | null
  backgroundPattern?: string | null
  experiences?: Array<{
    companyName: string
    companyUrl?: string | null
    faviconUrl?: string | null
    role?: string | null
    duration?: string | null
    description?: string | null
  }>
  cvUrl?: string | null
}) => {
  const response = await fetch("/api/portfolio/publish-all", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to publish portfolio")
  }

  return result
}

/**
 * Existing portfolio data load करता है
 */
export const loadPortfolioData = async (username: string) => {
  const response = await fetch(`/api/portfolio/publish?username=${username}`)
  
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to load portfolio data")
  }
  
  if (response.status === 404) {
    console.log("🔍 No portfolio found for username:", username)
    return null
  }
  
  const result = await response.json()
  console.log("🔍 API Response:", result)
  console.log("🔍 Portfolio data:", result.portfolio)
  console.log("🔍 Portfolio customUsername:", result.portfolio?.customUsername)
  
  return result.portfolio
}

/**
 * Username availability check करता है
 */
export const checkUsernameAvailability = async (username: string, currentUsername?: string, githubUsername?: string, currentUserId?: number) => {
  if (!username.trim()) {
    return {
      isChecking: false,
      isAvailable: null,
      message: ""
    }
  }

  // Check if the username is the current user's username (case insensitive)
  const trimmedNewUsername = username.trim().toLowerCase()
  const trimmedCurrentUsername = currentUsername?.trim().toLowerCase()
  const trimmedGithubUsername = githubUsername?.trim().toLowerCase()

  if ((trimmedCurrentUsername && trimmedNewUsername === trimmedCurrentUsername) || 
      (trimmedGithubUsername && trimmedNewUsername === trimmedGithubUsername)) {
    return {
      isChecking: false,
      isAvailable: true,
      message: "This is your current username"
    }
  }

  try {
    const res = await fetch("/api/portfolio/check-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, currentUserId })
    })
    const data = await res.json()

    if (!res.ok) {
      return {
        isChecking: false,
        isAvailable: null,
        message: data?.message || data?.error || "Error checking availability"
      }
    }

    return {
      isChecking: false,
      isAvailable: !!data.available,
      message: data.message || (data.available ? "Username available" : "Username already taken")
    }
  } catch (error) {
    return {
      isChecking: false,
      isAvailable: null,
      message: "Error checking availability"
    }
  }
}

/**
 * GitHub user data fetch करता है
 */
export const fetchGitHubData = async () => {
  const [userRes, reposRes] = await Promise.all([
    fetch("/api/github/user", { cache: "no-store" }),
    fetch("/api/github/repos", { cache: "no-store" }),
  ])
  
  if (!userRes.ok || !reposRes.ok) {
    throw new Error("GitHub fetch failed")
  }
  
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
    languages: repo.languages || [],
    stargazersCount: repo.stargazers_count,
    forksCount: repo.forks_count,
    isPrivate: repo.private,
    isFork: repo.fork,
    size: repo.size || 0,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
  }))

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
    repositories,
  }

  return user
}

/**
 * Session data fetch करता है - with secure validation
 */
export const fetchSession = async () => {
  const res = await fetch("/api/session", { cache: "no-store" })
  
  if (!res.ok) {
    throw new Error("No session or session invalid")
  }
  
  const data = await res.json()
  // Return session only if it's verified
  if (data.success && data.session) {
    return data.session
  }
  throw new Error("Session validation failed")
}

