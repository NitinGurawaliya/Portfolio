/**
 * Type definitions for portfolio data structures
 */

export interface User {
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

export interface Repository {
  id: number
  name: string
  fullName: string
  description: string
  htmlUrl: string
  homepage?: string
  language: string
  languages?: string[]
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

export interface Skill {
  id: string
  name: string
  category: string
}

export interface Social {
  id: number
  platform: string
  username: string
  url: string
  isPinned: boolean
}

export interface PortfolioData {
  displayName: string
  jobTitle: string
  bio: string
  profilePic: string
  customUsername: string
}

export interface UsernameAvailability {
  isChecking: boolean
  isAvailable: boolean | null
  message: string
}

export interface Portfolio {
  id: number
  displayName: string
  jobTitle?: string
  bio: string
  profilePic: string
  selectedTheme?: string
  skills: Skill[]
  socials: Social[]
  repositories: PortfolioRepository[]
  user: {
    githubUsername: string
    location: string
    company: string
    websiteUrl: string
  }
}

export interface PortfolioRepository {
  id: number
  deployedUrl: string
  customName?: string
  customDescription?: string
  isVisible: boolean
  repository: {
    id: number
    name: string
    description: string
    htmlUrl: string
    githubUrl?: string
    language: string
    stargazersCount: number
    forksCount: number
    isImported?: boolean
    favicon?: string
  }
}

