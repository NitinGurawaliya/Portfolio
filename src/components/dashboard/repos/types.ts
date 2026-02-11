export interface Repository {
  id: number
  portfolioRepositoryId?: number
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
  logo?: string
  siteName?: string
  keywords?: string
  author?: string
}

export interface PortfolioRepository {
  id: number
  deployedUrl: string
  customName?: string
  customDescription?: string
  isVisible: boolean
  name: string
  description: string
  language: string
  languages?: string[]
  stargazersCount: number
  forksCount: number
  updatedAt: string
  htmlUrl: string
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
    logo?: string
    homepage?: string
  }
  portfolioRepositoryId?: number
}

export interface RepoEditInitial {
  id: number
  url: string
  name: string
  description: string
  logo?: string | null
  category?: string | null
  status?: string | null
  revenue?: number | null
  mrr?: number | null
  users?: number | null
  technologies?: string | null
}

export interface ReposSectionProps {
  repositories: Repository[]
  selectedRepos: number[]
  deployedUrls: Record<number, string>
  customNames?: Record<number, string>
  customDescriptions?: Record<number, string>
  githubUrls?: Record<number, string>
  projectCategories?: Record<number, string>
  projectStatuses?: Record<number, string>
  projectRevenues?: Record<number, number>
  projectMrrs?: Record<number, number>
  projectUsers?: Record<number, number>
  projectTechnologies?: Record<number, string>
  repoOrder?: number[]
  onToggleRepo: (repoId: number) => void
  onUpdateDeployedUrl: (repoId: number, url: string) => void
  onUpdateCustomName: (repoId: number, name: string) => void
  onUpdateCustomDescription: (repoId: number, description: string) => void
  onUpdateGithubUrl?: (repoId: number, url: string) => void
  onUpdateProjectCategory?: (repoId: number, category: string | null) => void
  onUpdateProjectStatus?: (repoId: number, status: string | null) => void
  onUpdateProjectRevenue?: (repoId: number, value: number | null) => void
  onUpdateProjectMrr?: (repoId: number, value: number | null) => void
  onUpdateProjectUsers?: (repoId: number, value: number | null) => void
  onUpdateProjectTechnologies?: (repoId: number, value: string | null) => void
  onUpdateRepoOrder: (newOrder: number[]) => void
  onAddImportedProject?: (project: Repository) => void
  analytics?: unknown
  portfolioId?: number
  onUpdateLogo?: (repoId: number, logo: string | null) => void
  logoOverrides?: Record<number, string>
  isLoading?: boolean
  onNavigateToSection?: (section: string) => void
}
