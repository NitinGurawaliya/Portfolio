"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "@/hooks/useSession"
import { usePortfolio } from "@/hooks/usePortfolio"
import { DevFolioLoader } from "@/components/ui/DevFolioLoader"
import toast, { Toaster } from "react-hot-toast"
import { publishPortfolio } from "@/lib/services/portfolio-service"
import { successToastConfig, errorToastConfig } from "@/lib/utils"
import { PortfolioNavbar } from "@/components/portfolio/PortfolioNavbar"
import { ThemeSelectorPanel } from "@/components/portfolio/ThemeSelectorPanel"
import { PortfolioLayout } from "@/components/portfolio/PortfolioLayout"
import { PortfolioProvider } from "@/contexts/PortfolioContext"
import type { Repository } from "@/interface"
import type { ThemeKey } from "@/lib/theme-config"

interface PortfolioLayoutProps {
  children: React.ReactNode
}

export default function PortfolioLayoutWrapper({ children }: PortfolioLayoutProps) {
  const pathname = usePathname()
  const { user, loading: sessionLoading } = useSession({ redirectOnAuthFailure: true })
  const portfolio = usePortfolio(user)
  
  const [isPortfolioPublished, setIsPortfolioPublished] = useState(false)
  const [githubData, setGithubData] = useState<any>(null)
  const [githubRepos, setGithubRepos] = useState<Repository[]>([])
  const [isPublishing, setIsPublishing] = useState(false)

  // Get breadcrumb path based on current route
  const breadcrumb = useMemo(() => {
    if (pathname === "/portfolio") {
      return "Portfolio"
    } else if (pathname === "/portfolio/bio") {
      return "Portfolio → Bio"
    } else if (pathname === "/portfolio/projects") {
      return "Portfolio → Projects"
    } else if (pathname === "/portfolio/socials") {
      return "Portfolio → Socials"
    } else if (pathname === "/portfolio/analytics") {
      return "Portfolio → Analytics"
    }
    return "Portfolio"
  }, [pathname])

  // Merge all repositories (imported + GitHub), removing duplicates
  const allRepositories = useMemo(() => {
    const repoMap = new Map<number, Repository>()
    
    // Add GitHub repos first
    githubRepos.forEach(repo => repoMap.set(repo.id, repo))
    
    // Add imported projects, they take precedence (have more data)
    portfolio.importedProjects.forEach(repo => {
      repoMap.set(repo.id, repo)
    })
    
    const merged = Array.from(repoMap.values())
    
    console.log("🔍 Layout: allRepositories calculation:", {
      githubReposCount: githubRepos.length,
      importedProjectsCount: portfolio.importedProjects.length,
      mergedCount: merged.length,
      mergedIds: merged.map(r => r.id),
      importedProjectIds: portfolio.importedProjects.map(r => r.id)
    })
    
    return merged
  }, [portfolio.importedProjects, githubRepos])

  // Extract available languages from GitHub repos for skills
  const availableLanguages = useMemo(() => {
    const langSet = new Set<string>()
    githubRepos.forEach(repo => {
      if (repo.language) langSet.add(repo.language)
      if (repo.languages && Array.isArray(repo.languages)) {
        repo.languages.forEach((lang: string) => langSet.add(lang))
      }
    })
    return Array.from(langSet).sort()
  }, [githubRepos])

  // Fetch GitHub data on mount
  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch("/api/github/user", { cache: "no-store" }),
          fetch("/api/github/repos", { cache: "no-store" }),
        ])
        
        if (userRes.ok && reposRes.ok) {
          const userData = await userRes.json()
          const reposData = await reposRes.json()
          
          setGithubData(userData)
          
          // Map repos to Repository format
          const mappedRepos = reposData.map((repo: any) => ({
            id: repo.id,
            githubId: repo.id,
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
          
          setGithubRepos(mappedRepos)
        }
      } catch (error) {
        console.error("Failed to fetch GitHub data:", error)
      }
    }

    if (user) {
      fetchGitHubData()
    }
  }, [user])

  // Load existing portfolio data - CRITICAL for all pages
  // OPTIMIZED: Only load once, share data across all pages via context
  const hasAttemptedLoad = useRef(false)
  const loadTriggered = useRef(false)
  
  useEffect(() => {
    if (!user?.githubUsername) {
      console.log("⏸️ Skipping data load - no githubUsername")
      return
    }

    if (portfolio.isLoadingPortfolio) {
      console.log("⏸️ Skipping data load - already loading")
      return
    }

    // Only load once - use both refs to ensure single load across all pages
    if (loadTriggered.current) {
      console.log("⏸️ Skipping data load - already triggered (data shared via context)")
      return
    }

    const hasData = !!(
      portfolio.portfolioData.displayName || 
      portfolio.portfolioData.bio || 
      portfolio.portfolioData.profilePic ||
      portfolio.skills.length > 0 ||
      portfolio.socials.length > 0 ||
      portfolio.selectedRepos.length > 0
    )
    
    console.log("📊 Data load check:", {
      isInitialLoad: portfolio.isInitialLoad,
      hasData,
      isLoadingPortfolio: portfolio.isLoadingPortfolio,
      githubUsername: user.githubUsername,
      pathname
    })
    
    // Load data only once on mount - data will be shared via context to all pages
    if (!hasData && portfolio.isInitialLoad) {
      console.log("✅ Loading portfolio data ONCE - will be shared across all pages via context...")
      loadTriggered.current = true
      hasAttemptedLoad.current = true
      portfolio.loadExistingData(user.githubUsername).catch((err) => {
        console.error("❌ Failed to load portfolio data:", err)
        loadTriggered.current = false // Reset on error so we can retry
        hasAttemptedLoad.current = false
      })
    } else {
      console.log("⏸️ Skipping data load - data already loaded or not initial load (shared via context)")
    }
  }, [user?.githubUsername, portfolio.isInitialLoad, portfolio.isLoadingPortfolio, pathname])

  // DON'T initialize from GitHub - let portfolio data load from database
  // GitHub fallback was overriding real portfolio data

  // Check if portfolio is published
  useEffect(() => {
    if (portfolio.originalData?.id) {
      setIsPortfolioPublished(true)
    }
  }, [portfolio.originalData])

  const handlePublish = async () => {
    if (!user) {
      toast.error("User not found", errorToastConfig)
      return
    }

    setIsPublishing(true)
    try {
      const result = await publishPortfolio({
        portfolioData: portfolio.portfolioData,
        selectedRepos: portfolio.selectedRepos,
        skills: portfolio.skills,
        socials: portfolio.socials,
        experiences: portfolio.experiences,
        deployedUrls: portfolio.deployedUrls,
        customNames: portfolio.customNames,
        customDescriptions: portfolio.customDescriptions,
        githubUrls: portfolio.githubUrls,
        selectedTheme: portfolio.selectedTheme || 'light',
        repoOrder: portfolio.repoOrder,
        repositories: allRepositories.filter(repo => portfolio.selectedRepos.includes(repo.id)),
        userId: user.id,
        userData: user,
        cvUrl: portfolio.cvUrl,
      })

      setIsPortfolioPublished(true)
      portfolio.resetAfterPublish()
      toast.success("Portfolio published successfully! 🎉", successToastConfig)
    } catch (error: any) {
      console.error("Publish error:", error)
      toast.error(error?.message || "Failed to publish portfolio", errorToastConfig)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleVisitProfile = () => {
    const username = portfolio.portfolioData.customUsername || user?.githubUsername || "username"
    const currentDomain = typeof window !== "undefined" ? window.location.origin : ""
    if (currentDomain) {
      window.open(`${currentDomain}/${username}`, "_blank", "noopener,noreferrer")
    }
  }

  if (sessionLoading) {
    return <DevFolioLoader />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  // Don't block rendering - let components handle their own loading states
  // The layout should always render so children can display content

  return (
    <PortfolioLayout>
      <PortfolioProvider
        githubRepos={githubRepos}
        allRepositories={allRepositories}
        availableLanguages={availableLanguages}
        portfolio={portfolio}
      >
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden" data-main-container>
          <Toaster />
          
          {/* Navbar */}
          <div className="flex-shrink-0 z-50 bg-white">
            <PortfolioNavbar
              user={user}
              portfolioData={portfolio.portfolioData}
              hasUnsavedChanges={portfolio.hasUnsavedChanges}
              isPublishing={isPublishing}
              isPortfolioPublished={isPortfolioPublished}
              onPublish={handlePublish}
              onVisitProfile={handleVisitProfile}
              breadcrumb={breadcrumb}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
            {/* Middle Section - Scrollable Content - Full Width */}
            <div className="flex-1 min-w-0 overflow-y-auto bg-white">
              <div className="w-full h-full">
                {children}
              </div>
            </div>

            {/* Right Side - Theme Selector - Fixed Position */}
            <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-white">
              <div className="h-full overflow-y-auto" style={{ height: 'calc(100vh - 57px)' }}>
                <div className="p-4" data-theme-selector>
                  <ThemeSelectorPanel
                    selectedTheme={(portfolio.selectedTheme || 'light') as ThemeKey}
                    onThemeChange={(theme) => portfolio.setSelectedTheme(theme)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PortfolioProvider>
    </PortfolioLayout>
  )
}

