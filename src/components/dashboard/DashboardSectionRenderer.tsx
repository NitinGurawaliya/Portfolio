"use client"

import { devLog, devWarn } from "@/lib/logger"
import { HomeSection } from "@/components/dashboard/HomeSection"
import { ReposSection } from "@/components/dashboard/ReposSection"
import { SkillsSection } from "@/components/dashboard/SkillsSection"
import { SocialsSection } from "@/components/dashboard/SocialsSection"
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection"
import { ShiplogSection } from "@/components/dashboard/ShiplogSection"
import ThemeSelector from "@/components/dashboard/ThemeSelector"
import { CustomDomainSection } from "@/components/dashboard/CustomDomainSection"
import type { PortfolioData, Repository, Skill, Social, User, UsernameAvailability } from "@/interface"
import type { ThemeKey } from "@/lib/theme-config"

type RepositoryWithOg = Repository & { githubOgImage?: string | null }

type PortfolioViewModel = {
  originalData?: { id?: number } | null
  portfolioData: PortfolioData
  isLoadingPortfolio: boolean
  isInitialLoad: boolean
  experiences: unknown[]
  setExperiences: (experiences: unknown[]) => void
  cvUrl: string
  setCvUrl: (url: string) => void
  importedProjects: RepositoryWithOg[]
  selectedRepos: number[]
  deployedUrls: Record<number, string>
  customNames: Record<number, string>
  customDescriptions: Record<number, string>
  githubUrls: Record<number, string>
  projectCategories: Record<number, string>
  projectStatuses: Record<number, string>
  projectRevenues: Record<number, number>
  projectMrrs: Record<number, number>
  projectUsers: Record<number, number>
  projectTechnologies: Record<number, string>
  repoOrder: number[]
  analytics: unknown
  logoOverrides: Record<number, string>
  setLogoOverrides: (
    updater: (prev: Record<number, string>) => Record<number, string>
  ) => void
  skills: Skill[]
  socials: Social[]
  selectedTheme: ThemeKey
  backgroundColor: string | null
  backgroundPattern: string | null
  setBackgroundColor: (value: string | null) => void
  setBackgroundPattern: (value: string | null) => void
}

type DashboardHandlers = {
  usernameAvailability: UsernameAvailability
  handleUpdatePortfolioData: (data: Partial<PortfolioData>) => void
  handleToggleRepo: (repoId: number) => void
  handleUpdateDeployedUrl: (repoId: number, url: string) => void
  handleUpdateCustomName: (repoId: number, name: string) => void
  handleUpdateCustomDescription: (repoId: number, description: string) => void
  handleUpdateGithubUrl: (repoId: number, url: string) => void
  handleUpdateProjectCategory: (repoId: number, category: string | null) => void
  handleUpdateProjectStatus: (repoId: number, status: string | null) => void
  handleUpdateProjectRevenue: (repoId: number, revenue: number | null) => void
  handleUpdateProjectMrr: (repoId: number, mrr: number | null) => void
  handleUpdateProjectUsers: (repoId: number, users: number | null) => void
  handleUpdateProjectTechnologies: (repoId: number, technologies: string | null) => void
  handleUpdateRepoOrder: (order: number[]) => void
  handleAddImportedProject: (project: Repository) => void
  handleThemeChange: (theme: string) => void
  handleAddSkill: (skill: Omit<Skill, "id">) => void
  handleRemoveSkill: (skillId: string) => void
  handleAddSocial: (social: Omit<Social, "id">) => void
  handleRemoveSocial: (socialId: number) => void
  handleTogglePin: (socialId: number) => void
  handleUpdateSocial: (socialId: number, updates: Partial<Social>) => void
}

type Props = {
  activeSection: string
  user?: User | null
  portfolio: PortfolioViewModel
  handlers: DashboardHandlers
  portfolioId: number | null
  isPortfolioPublished: boolean
  onNavigateToSection: (section: string) => void
}

export function DashboardSectionRenderer({
  activeSection,
  user,
  portfolio,
  handlers,
  portfolioId,
  isPortfolioPublished,
  onNavigateToSection,
}: Props) {
  switch (activeSection) {
    case "home":
      return (
        <HomeSection
          user={user}
          portfolioData={portfolio.portfolioData}
          onUpdate={handlers.handleUpdatePortfolioData}
          usernameAvailability={handlers.usernameAvailability}
          isInitialLoad={portfolio.isLoadingPortfolio}
          isLoading={portfolio.isLoadingPortfolio}
          experiences={portfolio.experiences}
          onExperiencesChange={portfolio.setExperiences}
          cvUrl={portfolio.cvUrl}
          setCvUrl={portfolio.setCvUrl}
          onNavigateToSection={onNavigateToSection}
        />
      )
    case "shiplog":
      return <ShiplogSection />
    case "repos": {
      const allRepositories: RepositoryWithOg[] = [
        ...portfolio.importedProjects,
        ...((user?.repositories as RepositoryWithOg[] | undefined) || []),
      ]

      // Ensure all repositories have githubOgImage field
      const enrichedRepositories = allRepositories.map((repo) => {
        if (!repo.githubOgImage && !repo.isImported) {
          let githubOgImage: string | null = null

          if (repo.fullName) {
            const [owner, repoName] = repo.fullName.split("/")
            if (owner && repoName) {
              githubOgImage = `https://opengraph.githubassets.com/${owner}/${repoName}`
            }
          } else if (repo.htmlUrl) {
            try {
              const url = new URL(repo.htmlUrl)
              if (url.hostname === "github.com") {
                const pathParts = url.pathname.split("/").filter(Boolean)
                if (pathParts.length >= 2) {
                  const owner = pathParts[0]
                  const repoName = pathParts[1]
                  githubOgImage = `https://opengraph.githubassets.com/${owner}/${repoName}`
                }
              }
            } catch {
              // Ignore URL parsing errors
            }
          }

          if (githubOgImage) {
            return { ...repo, githubOgImage }
          }
        }
        return repo
      })

      const mergedRepositories = enrichedRepositories.reduce((acc: RepositoryWithOg[], repo) => {
        const existingIndex = acc.findIndex((r) => r.id === repo.id)
        if (existingIndex === -1) {
          acc.push(repo)
        } else if (repo.portfolioRepositoryId && !acc[existingIndex].portfolioRepositoryId) {
          acc[existingIndex] = repo
        }
        return acc
      }, [] as RepositoryWithOg[])

      // Get portfolio ID - try multiple sources
      const currentPortfolioId = portfolio.originalData?.id || portfolio.portfolioData?.id || undefined

      // Only log if portfolioId is missing and we're not in initial load
      if (!currentPortfolioId && portfolio.isInitialLoad === false) {
        devWarn("⚠️ Dashboard - Portfolio ID not found:", {
          originalDataId: portfolio.originalData?.id,
          portfolioDataId: portfolio.portfolioData?.id,
          portfolioData: portfolio.portfolioData,
          isLoading: portfolio.isLoadingPortfolio,
          isInitialLoad: portfolio.isInitialLoad,
        })
      }

      return (
        <ReposSection
          repositories={mergedRepositories}
          selectedRepos={portfolio.selectedRepos}
          deployedUrls={portfolio.deployedUrls}
          customNames={portfolio.customNames}
          customDescriptions={portfolio.customDescriptions}
          githubUrls={portfolio.githubUrls}
          projectCategories={portfolio.projectCategories}
          projectStatuses={portfolio.projectStatuses}
          projectRevenues={portfolio.projectRevenues}
          projectMrrs={portfolio.projectMrrs}
          projectUsers={portfolio.projectUsers}
          projectTechnologies={portfolio.projectTechnologies}
          repoOrder={portfolio.repoOrder}
          onToggleRepo={handlers.handleToggleRepo}
          onUpdateDeployedUrl={handlers.handleUpdateDeployedUrl}
          onUpdateCustomName={handlers.handleUpdateCustomName}
          onUpdateCustomDescription={handlers.handleUpdateCustomDescription}
          onUpdateGithubUrl={handlers.handleUpdateGithubUrl}
          onUpdateProjectCategory={handlers.handleUpdateProjectCategory}
          onUpdateProjectStatus={handlers.handleUpdateProjectStatus}
          onUpdateProjectRevenue={handlers.handleUpdateProjectRevenue}
          onUpdateProjectMrr={handlers.handleUpdateProjectMrr}
          onUpdateProjectUsers={handlers.handleUpdateProjectUsers}
          onUpdateProjectTechnologies={handlers.handleUpdateProjectTechnologies}
          onUpdateRepoOrder={handlers.handleUpdateRepoOrder}
          onAddImportedProject={handlers.handleAddImportedProject}
          analytics={portfolio.analytics}
          portfolioId={currentPortfolioId}
          onUpdateLogo={(repoId: number, logo: string | null) => {
            portfolio.setLogoOverrides((prev) => {
              if (logo === null) {
                const newState = { ...prev }
                delete newState[repoId]
                return newState
              }
              return {
                ...prev,
                [repoId]: logo,
              }
            })
          }}
          logoOverrides={portfolio.logoOverrides}
          isLoading={portfolio.isLoadingPortfolio}
          onNavigateToSection={onNavigateToSection}
        />
      )
    }
    case "skills":
      return (
        <SkillsSection
          skills={portfolio.skills}
          onAddSkill={handlers.handleAddSkill}
          onRemoveSkill={handlers.handleRemoveSkill}
          isLoading={portfolio.isLoadingPortfolio}
          onNavigateToSection={onNavigateToSection}
        />
      )
    case "socials":
      return (
        <SocialsSection
          socials={portfolio.socials}
          onAddSocial={handlers.handleAddSocial}
          onRemoveSocial={handlers.handleRemoveSocial}
          onTogglePin={handlers.handleTogglePin}
          onUpdateSocial={handlers.handleUpdateSocial}
          isLoading={portfolio.isLoadingPortfolio}
          onNavigateToSection={onNavigateToSection}
        />
      )
    case "analytics":
      devLog("🔍 Analytics Section - Portfolio ID:", portfolio.originalData?.id)
      return (
        <AnalyticsSection
          portfolioId={portfolio.originalData?.id || portfolio.portfolioData?.id || 0}
          analyticsData={portfolio.analytics}
        />
      )
    case "theme":
      return (
        <ThemeSelector
          currentTheme={portfolio.selectedTheme}
          userId={user?.id || 0}
          onThemeChange={handlers.handleThemeChange}
          portfolioId={portfolio.originalData?.id || portfolio.portfolioData.id}
          backgroundColor={portfolio.backgroundColor}
          backgroundPattern={portfolio.backgroundPattern}
          setBackgroundColor={portfolio.setBackgroundColor}
          setBackgroundPattern={portfolio.setBackgroundPattern}
        />
      )
    case "domain":
      return (
        <CustomDomainSection
          portfolioId={portfolioId || portfolio.originalData?.id || portfolio.portfolioData?.id || 0}
          isPublished={isPortfolioPublished}
        />
      )
    case "feed":
      return null
    default:
      return null
  }
}

