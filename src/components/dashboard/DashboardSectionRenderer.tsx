import { HomeSection } from "@/components/dashboard/HomeSection"
import { ReposSection } from "@/components/dashboard/ReposSection"
import { SkillsSection } from "@/components/dashboard/SkillsSection"
import { SocialsSection } from "@/components/dashboard/SocialsSection"
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection"
import { ShiplogSection } from "@/components/dashboard/ShiplogSection"
import ThemeSelector from "@/components/dashboard/ThemeSelector"
import { CustomDomainSection } from "@/components/dashboard/CustomDomainSection"
import type { ComponentProps, Dispatch, SetStateAction } from "react"
import type { ThemeKey } from "@/lib/theme-config"
import { devLog, devWarn } from "@/lib/logger"

type HomeSectionProps = ComponentProps<typeof HomeSection>
type ReposSectionProps = ComponentProps<typeof ReposSection>
type SkillsSectionProps = ComponentProps<typeof SkillsSection>
type SocialsSectionProps = ComponentProps<typeof SocialsSection>
type AnalyticsSectionProps = ComponentProps<typeof AnalyticsSection>
type RepositoryList = ReposSectionProps["repositories"]
type RepositoryItem = RepositoryList[number] & { githubOgImage?: string | null }

interface DashboardSectionPortfolio {
  portfolioData: HomeSectionProps["portfolioData"] & { id?: number }
  isLoadingPortfolio: boolean
  isInitialLoad: boolean
  experiences: HomeSectionProps["experiences"]
  setExperiences: NonNullable<HomeSectionProps["onExperiencesChange"]>
  cvUrl: HomeSectionProps["cvUrl"]
  setCvUrl: NonNullable<HomeSectionProps["setCvUrl"]>
  importedProjects: RepositoryList
  selectedRepos: ReposSectionProps["selectedRepos"]
  deployedUrls: ReposSectionProps["deployedUrls"]
  customNames: ReposSectionProps["customNames"]
  customDescriptions: ReposSectionProps["customDescriptions"]
  githubUrls: ReposSectionProps["githubUrls"]
  projectCategories: ReposSectionProps["projectCategories"]
  projectStatuses: ReposSectionProps["projectStatuses"]
  projectRevenues: ReposSectionProps["projectRevenues"]
  projectMrrs: ReposSectionProps["projectMrrs"]
  projectUsers: ReposSectionProps["projectUsers"]
  projectTechnologies: ReposSectionProps["projectTechnologies"]
  repoOrder: ReposSectionProps["repoOrder"]
  analytics: ReposSectionProps["analytics"] & AnalyticsSectionProps["analyticsData"]
  logoOverrides: ReposSectionProps["logoOverrides"] & Record<number, string>
  setLogoOverrides: Dispatch<SetStateAction<Record<number, string>>>
  skills: SkillsSectionProps["skills"]
  socials: SocialsSectionProps["socials"]
  selectedTheme: string
  backgroundColor: string | null
  backgroundPattern: string | null
  setBackgroundColor: (value: string | null) => void
  setBackgroundPattern: (value: string | null) => void
  originalData?: { id?: number } | null
}

interface DashboardSectionHandlers {
  handleUpdatePortfolioData: HomeSectionProps["onUpdate"]
  usernameAvailability: HomeSectionProps["usernameAvailability"]
  handleToggleRepo: ReposSectionProps["onToggleRepo"]
  handleUpdateDeployedUrl: ReposSectionProps["onUpdateDeployedUrl"]
  handleUpdateCustomName: ReposSectionProps["onUpdateCustomName"]
  handleUpdateCustomDescription: ReposSectionProps["onUpdateCustomDescription"]
  handleUpdateGithubUrl: ReposSectionProps["onUpdateGithubUrl"]
  handleUpdateProjectCategory: ReposSectionProps["onUpdateProjectCategory"]
  handleUpdateProjectStatus: ReposSectionProps["onUpdateProjectStatus"]
  handleUpdateProjectRevenue: ReposSectionProps["onUpdateProjectRevenue"]
  handleUpdateProjectMrr: ReposSectionProps["onUpdateProjectMrr"]
  handleUpdateProjectUsers: ReposSectionProps["onUpdateProjectUsers"]
  handleUpdateProjectTechnologies: ReposSectionProps["onUpdateProjectTechnologies"]
  handleUpdateRepoOrder: ReposSectionProps["onUpdateRepoOrder"]
  handleAddImportedProject: ReposSectionProps["onAddImportedProject"]
  handleAddSkill: SkillsSectionProps["onAddSkill"]
  handleRemoveSkill: SkillsSectionProps["onRemoveSkill"]
  handleAddSocial: SocialsSectionProps["onAddSocial"]
  handleRemoveSocial: SocialsSectionProps["onRemoveSocial"]
  handleTogglePin: SocialsSectionProps["onTogglePin"]
  handleUpdateSocial: SocialsSectionProps["onUpdateSocial"]
  handleThemeChange: (theme: string) => void
}

interface DashboardSectionRendererProps {
  activeSection: string
  user: {
    id?: number
    name?: string | null
    githubUsername?: string | null
    bio?: string | null
    avatarUrl?: string | null
    githubId?: string | number | null
    repositories?: unknown[]
  } | null
  portfolio: DashboardSectionPortfolio
  handlers: DashboardSectionHandlers
  portfolioId: number | null
  isPortfolioPublished: boolean
  onSectionChange: (section: string) => void
}

export function DashboardSectionRenderer({
  activeSection,
  user,
  portfolio,
  handlers,
  portfolioId,
  isPortfolioPublished,
  onSectionChange,
}: DashboardSectionRendererProps) {
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
          onNavigateToSection={onSectionChange}
        />
      )
    case "shiplog":
      return <ShiplogSection />
    case "repos": {
      const repositoriesFromUser = (user?.repositories || []) as RepositoryItem[]
      const allRepositories: RepositoryItem[] = [
        ...portfolio.importedProjects,
        ...repositoriesFromUser,
      ]

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
              // Ignore URL parsing errors.
            }
          }

          if (githubOgImage) {
            return { ...repo, githubOgImage }
          }
        }
        return repo
      })

      const mergedRepositories = enrichedRepositories.reduce<RepositoryList>((acc, repo) => {
        const existingIndex = acc.findIndex((r) => r.id === repo.id)
        if (existingIndex === -1) {
          acc.push(repo)
        } else if (repo.portfolioRepositoryId && !acc[existingIndex].portfolioRepositoryId) {
          acc[existingIndex] = repo
        }
        return acc
      }, [])

      const resolvedPortfolioId = portfolio.originalData?.id ||
        portfolio.portfolioData?.id ||
        undefined

      if (!resolvedPortfolioId && portfolio.isInitialLoad === false) {
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
          portfolioId={resolvedPortfolioId}
          onUpdateLogo={(repoId: number, logo: string | null) => {
            portfolio.setLogoOverrides((prev: Record<number, string>) => {
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
          onNavigateToSection={onSectionChange}
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
          onNavigateToSection={onSectionChange}
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
          onNavigateToSection={onSectionChange}
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
          currentTheme={portfolio.selectedTheme as ThemeKey}
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
