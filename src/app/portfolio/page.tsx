"use client"

import { usePortfolio } from "@/hooks/usePortfolio"
import { useSession } from "@/hooks/useSession"
import { usePortfolioContext } from "@/contexts/PortfolioContext"
import { PortfolioBioSection } from "@/components/portfolio/PortfolioBioSection"
import { PortfolioProjectsSection } from "@/components/portfolio/PortfolioProjectsSection"
import { PortfolioSocialsSection } from "@/components/portfolio/PortfolioSocialsSection"
import { GitHubActivity } from "@/components/GitHubActivity"
import { Github } from "lucide-react"

export default function PortfolioPage() {
  const { user } = useSession({ redirectOnAuthFailure: true })
  const context = usePortfolioContext()
  const { allRepositories, availableLanguages, portfolio: contextPortfolio } = context
  
  // Fallback: If portfolio not in context, create local instance (shouldn't happen)
  const localPortfolio = usePortfolio(user)
  const portfolio = contextPortfolio || localPortfolio
  
  if (!portfolio) {
    return <div>Loading...</div>
  }
  
  return (
    <>

      {!portfolio ? (
        <div className="p-4 text-center">Loading portfolio data...</div>
      ) : (
        <>
          {/* Bio Section - Always show content */}
          <PortfolioBioSection
            portfolioData={portfolio.portfolioData}
            skills={portfolio.skills}
            onUpdate={(updates) => portfolio.setPortfolioData({ ...portfolio.portfolioData, ...updates })}
            onSkillsChange={portfolio.setSkills}
            availableLanguages={availableLanguages}
          />

          {/* Socials Section - Always show (handles empty state internally) */}
          <PortfolioSocialsSection
            socials={portfolio.socials}
            onSocialsChange={portfolio.setSocials}
          />

          {/* Projects Section - Always show (handles empty state internally) */}
          <PortfolioProjectsSection
            selectedRepos={portfolio.selectedRepos}
            allRepositories={allRepositories}
            onAddProject={(project) => {
              portfolio.setImportedProjects([...portfolio.importedProjects, project])
              if (!portfolio.selectedRepos.includes(project.id)) {
                portfolio.setSelectedRepos([...portfolio.selectedRepos, project.id])
              }
            }}
            onReposChange={portfolio.setSelectedRepos}
          />
        </>
      )}

      {/* GitHub Activity Section - Always show header, skeleton for content */}
      {user?.githubUsername && (
        <div className="bg-white py-6 px-6">
          <div className="pb-4">
            <div className="text-lg font-semibold flex items-center gap-2 mb-1">
              <Github className="h-5 w-5 text-orange-500" />
              GitHub Activity
            </div>
            <p className="text-sm text-gray-600">
              Your contribution heatmap and pinned repositories
            </p>
          </div>
          <div>
            <GitHubActivity 
              username={user.githubUsername} 
              theme="light" 
            />
          </div>
        </div>
      )}
    </>
  )
}

