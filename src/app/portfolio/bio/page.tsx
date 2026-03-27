"use client"

import { useSession } from "@/hooks/useSession"
import { usePortfolio } from "@/hooks/usePortfolio"
import { usePortfolioContext } from "@/contexts/PortfolioContext"
import { usePortfolioHandlers } from "@/hooks/usePortfolioHandlers"
import { HomeSection } from "@/components/dashboard/HomeSection"

export default function BioPage() {
  const { user } = useSession({ redirectOnAuthFailure: true })
  const { portfolio: contextPortfolio } = usePortfolioContext()
  
  // Use portfolio from context (shared with layout) - fallback to local if not available
  // CRITICAL: Always call hooks in same order - no conditional hook calls
  const localPortfolio = usePortfolio(user)
  const portfolio = contextPortfolio || localPortfolio
  
  // CRITICAL: Call usePortfolioHandlers BEFORE any early returns to maintain hook order
  // Pass safe defaults if portfolio is not available yet
  const handlers = usePortfolioHandlers(
    portfolio?.setPortfolioData || (() => {}),
    portfolio?.setSelectedRepos || (() => {}),
    portfolio?.setSkills || (() => {}),
    portfolio?.setSocials || (() => {}),
    portfolio?.setDeployedUrls || (() => {}),
    portfolio?.setCustomNames || (() => {}),
    portfolio?.setCustomDescriptions || (() => {}),
    portfolio?.setGithubUrls || (() => {}),
    portfolio?.setProjectCategories || (() => {}),
    portfolio?.setProjectStatuses || (() => {}),
    portfolio?.setProjectRevenues || (() => {}),
    portfolio?.setProjectMrrs || (() => {}),
    portfolio?.setProjectUsers || (() => {}),
    portfolio?.setProjectTechnologies || (() => {}),
    portfolio?.setImportedProjects || (() => {}),
    portfolio?.setRepoOrder || (() => {}),
    portfolio?.setSelectedTheme || (() => {}),
    portfolio?.originalData || null,
    user
  )
  
  // Early returns AFTER all hooks are called
  if (!user) {
    return null // Layout handles loading
  }

  if (!portfolio) {
    return <div className="p-4 text-center">Loading portfolio data...</div>
  }

  // Use portfolio data from context (already loaded by layout)
  // Pass isInitialLoad=false to ensure portfolioData is prioritized over GitHub fallback
  return (
    <HomeSection
      user={user}
      portfolioData={portfolio.portfolioData}
      onUpdate={handlers.handleUpdatePortfolioData}
      usernameAvailability={handlers.usernameAvailability}
      isInitialLoad={false}
      isLoading={portfolio.isLoadingPortfolio}
      experiences={portfolio.experiences}
      onExperiencesChange={portfolio.setExperiences}
      cvUrl={portfolio.cvUrl}
      setCvUrl={portfolio.setCvUrl}
      socials={portfolio.socials}
      onAddSocial={handlers.handleAddSocial}
      onRemoveSocial={handlers.handleRemoveSocial}
      onTogglePin={handlers.handleTogglePin}
      onUpdateSocial={handlers.handleUpdateSocial}
    />
  )
}

