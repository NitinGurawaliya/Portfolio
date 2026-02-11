import { Activity, Code2, DollarSign, Tag, TrendingUp, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface RepositoryLike {
  id: number
  name: string
  fullName?: string
  description: string
  htmlUrl: string
  language?: string
  languages?: string[]
  stargazersCount?: number
  forksCount?: number
  isPrivate?: boolean
  isFork?: boolean
  size?: number
  createdAt?: string
  updatedAt?: string
  pushedAt?: string
  isImported?: boolean
  favicon?: string | null
  logo?: string | null
  githubOgImage?: string | null
  homepage?: string
}

export interface ProjectInsightsPayload {
  category?: string | null
  status?: string | null
  revenue?: number | null
  mrr?: number | null
  users?: number | null
  technologies?: string | null
}

export const CATEGORY_OPTIONS = [
  "SaaS",
  "AI/ML",
  "Developer Tool",
  "Marketing",
  "E-commerce",
  "Open Source",
  "Consumer",
  "Community",
]

export const STATUS_OPTIONS = ["Building", "Live", "On Hold", "Sunsetting", "Idea"]

export type ProjectMetricId = "category" | "techstack" | "status" | "revenue" | "mrr" | "users"

export interface ProjectMetricOption {
  id: ProjectMetricId
  label: string
  icon: LucideIcon
}

export const PROJECT_METRICS: ProjectMetricOption[] = [
  { id: "category", label: "Category", icon: Tag },
  { id: "techstack", label: "Tech Stack", icon: Code2 },
  { id: "status", label: "Status", icon: Activity },
  { id: "revenue", label: "Annual Revenue", icon: DollarSign },
  { id: "mrr", label: "MRR", icon: TrendingUp },
  { id: "users", label: "Active Users", icon: Users },
]
