import { HomeSection } from "@/components/dashboard/HomeSection"
import { ReposSection } from "@/components/dashboard/ReposSection"
import { SkillsSection } from "@/components/dashboard/SkillsSection"
import { SocialsSection } from "@/components/dashboard/SocialsSection"
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection"
import { ShiplogSection } from "@/components/dashboard/ShiplogSection"
import ThemeSelector from "@/components/dashboard/ThemeSelector"
import { CustomDomainSection } from "@/components/dashboard/CustomDomainSection"
import { devLog, devWarn } from "@/lib/logger"

interface DashboardSectionRendererProps {
  activeSection: string
  user: any
  portfolio: any
  handlers: any
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
      const allRepositories = [
        ...portfolio.importedProjects,
        ...(user?.repositories || []),
      ]

      const enrichedRepositories = allRepositories.map((repo: any) => {
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

      const mergedRepositories = enrichedRepositories.reduce((acc, repo) => {
        const existingIndex = acc.findIndex((r: any) => r.id === repo.id)
        if (existingIndex === -1) {
          acc.push(repo)
        } else if (repo.portfolioRepositoryId && !acc[existingIndex].portfolioRepositoryId) {
          acc[existingIndex] = repo
        }
        return acc
      }, [] as any[])

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
          currentTheme={portfolio.selectedTheme as any}
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
