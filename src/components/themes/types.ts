import type { ComponentType } from "react"
import type { PortfolioShiplog, Skill, Social } from "@/interface"

export interface ThemeConfig {
  name: string
  colors: {
    background: string
    text: string
    accent: string
    cardBg?: string
    border?: string
  }
  layout: string
  previewImage: string
  description?: string
}

export interface PortfolioExperience {
  id?: number
  companyName?: string | null
  companyUrl?: string | null
  faviconUrl?: string | null
  role?: string | null
  duration?: string | null
  description?: string | null
}

export interface ThemeRepositoryDetails {
  id: number
  name: string
  description?: string | null
  htmlUrl?: string | null
  githubUrl?: string | null
  language?: string | null
  languages?: string[] | string | null
  stargazersCount?: number | null
  forksCount?: number | null
  favicon?: string | null
  logo?: string | null
  fullName?: string | null
  siteName?: string | null
  pushedAt?: string | Date | null
  isImported?: boolean | null
}

export interface ThemePortfolioRepository {
  id: number
  deployedUrl?: string | null
  customName?: string | null
  customDescription?: string | null
  isVisible: boolean
  technologies?: string | null
  projectCategory?: string | null
  projectStatus?: string | null
  projectRevenue?: number | null
  projectMrr?: number | null
  projectUsers?: number | null
  repository: ThemeRepositoryDetails
}

export interface ThemePortfolioData {
  id: number
  displayName: string
  jobTitle?: string
  bio: string
  profilePic: string
  customUsername?: string | null
  skills: Skill[]
  socials: Social[]
  repositories: ThemePortfolioRepository[]
  experiences?: PortfolioExperience[]
  backgroundColor?: string | null
  backgroundPattern?: string | null
  cvUrl?: string | null
  shiplogs?: PortfolioShiplog[]
  user: {
    githubUsername: string
    location: string
    company: string
    websiteUrl?: string | null
  }
}

export type SocialIconComponent = ComponentType<{ className?: string }>
