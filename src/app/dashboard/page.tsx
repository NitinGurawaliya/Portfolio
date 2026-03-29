"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { DashboardSectionRenderer } from "@/components/dashboard/DashboardSectionRenderer"
import { UpvoteNotificationsBell } from "@/components/dashboard/UpvoteNotificationsBell"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import toast, { Toaster } from "react-hot-toast"
import { useSession } from "@/hooks/useSession"
import { usePortfolio } from "@/hooks/usePortfolio"
import { usePortfolioHandlers } from "@/hooks/usePortfolioHandlers"
import { useDashboardNotifications } from "@/hooks/useDashboardNotifications"
import { useDashboardPublishing } from "@/hooks/useDashboardPublishing"
import { useDashboardSummary } from "@/hooks/useDashboardSummary"
import { useDashboardFeedPrefetch } from "@/hooks/useDashboardFeedPrefetch"
import { successToastConfig, errorToastConfig } from "@/lib/utils"
import { devLog } from "@/lib/logger"


export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("home")
  
  const [portfolioId, setPortfolioId] = useState<number | null>(null)
  const [isPortfolioPublished, setIsPortfolioPublished] = useState(false)
  
  const router = useRouter()

  // Handle username assignment feedback from OAuth callback
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const params = new URLSearchParams(window.location.search)
    const usernameUpdated = params.get('username_updated')
    const usernameConflict = params.get('username_conflict')
    
    if (usernameUpdated) {
      toast.success(`✅ Custom username claimed: /${usernameUpdated}`, successToastConfig)
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    } else if (usernameConflict) {
      toast.error(`❌ Username '${usernameConflict}' was already taken. You can set a different one in your profile settings.`, errorToastConfig)
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

  // Session hook - redirect to auth if session is invalid
  const { user, loading } = useSession({ redirectOnAuthFailure: true })
  
  // Portfolio hook
  const portfolio = usePortfolio(user)

  const dashboardNotifications = useDashboardNotifications(user?.id)
  const summary = useDashboardSummary({ enabled: !loading && !!user?.id })
  
  // Handlers hook - portfolio data को original data के रूप में pass करें
  const handlers = usePortfolioHandlers(
    portfolio.setPortfolioData,
    portfolio.setSelectedRepos,
    portfolio.setSkills,
    portfolio.setSocials,
    portfolio.setDeployedUrls,
    portfolio.setCustomNames,
    portfolio.setCustomDescriptions,
    portfolio.setGithubUrls,
    portfolio.setProjectCategories,
    portfolio.setProjectStatuses,
    portfolio.setProjectRevenues,
    portfolio.setProjectMrrs,
    portfolio.setProjectUsers,
    portfolio.setProjectTechnologies,
    portfolio.setImportedProjects,
    portfolio.setRepoOrder,
    portfolio.setSelectedTheme,
    portfolio.originalData,  // Pass original data properly
    user  // Pass user for GitHub username comparison
  )

  // Load existing portfolio data immediately when user is available
  // Initialize with user data right away for instant UI - ensure home page loads with data
  // Use ref to track if we've already loaded to prevent infinite loops
  const hasLoadedRef = useRef(false)
  
  useEffect(() => {
    if (user && !hasLoadedRef.current) {
      hasLoadedRef.current = true // Mark as loaded to prevent re-running
      
      const initialData = {
        displayName: user.name || user.githubUsername || "",
        jobTitle: "",
        bio: user.bio || "",
        profilePic: user.avatarUrl || "",
        customUsername: "", // Don't set GitHub username as default, let loadExistingData handle it
      }
      
      // Set initial data immediately for instant UI - home page will show this data right away
      portfolio.setPortfolioData(initialData)
      
      // Load existing portfolio data in background (non-blocking)
      // This will update the data once loaded, but home section shows immediately
      portfolio.loadExistingData(user.githubUsername, initialData)
    }
    // Only depend on user, not portfolio object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // DashboardPage में useEffect डालो:
  useEffect(() => {
    // onboarding से redirect आया है तो resetAfterPublish करो
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("just-onboarded")) {
        portfolio.resetAfterPublish();
        params.delete("just-onboarded");
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [portfolio]);

  useEffect(() => {
    if (typeof window === "undefined") return
    if (loading || !user?.githubUsername) return

    const controller = new AbortController()

    const loadExistingPortfolioMeta = async (username: string) => {
      devLog("🚀 loadExistingPortfolioMeta called with:", { username })
      try {
        const response = await fetch(`/api/portfolio/publish?username=${username}`, {
          signal: controller.signal,
        })
        devLog("📡 Portfolio fetch response:", response.status, response.ok)
        
        if (response.ok) {
          const result = await response.json()
          const portfolio = result.portfolio
          devLog("🔍 Found existing portfolio:", !!portfolio)
          
          if (portfolio) {
            // Set portfolio ID and published status
            devLog("📋 Loading portfolio:", { id: portfolio.id, isPublished: portfolio.isPublished })
            setPortfolioId(portfolio.id)
            setIsPortfolioPublished(portfolio.isPublished)
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load portfolio data:", error)
        }
      }
    }

    void loadExistingPortfolioMeta(user.githubUsername)

    return () => {
      controller.abort()
    }
  }, [loading, user?.githubUsername])

  const publishing = useDashboardPublishing({
    user,
    portfolio,
    usernameAvailability: handlers.usernameAvailability,
    onPublished: async ({ portfolioId }) => {
      setIsPortfolioPublished(true)
      if (portfolioId) {
        setPortfolioId(portfolioId)
        portfolio.resetAfterPublish()
        return
      }
      try {
        const portfolioResponse = await fetch(`/api/portfolio/publish?username=${user?.githubUsername}`)
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json()
          if (portfolioData.portfolio?.id) {
            setPortfolioId(portfolioData.portfolio.id)
          }
        }
      } catch {
        // ignore
      }
      portfolio.resetAfterPublish()
    },
  })

  useDashboardFeedPrefetch({
    enabled: !loading && !!user && !portfolio.isLoadingPortfolio && !portfolio.isInitialLoad,
  })

  // Render active section - memoized for instant navigation
  const handleSectionChange = (section: string) => {
    if (section === "feed") {
      router.push("/feed/projects")
      return
    }
    setActiveSection(section)
  }

  const renderActiveSection = (
    <DashboardSectionRenderer
      activeSection={activeSection}
      user={user}
      portfolio={portfolio}
      handlers={handlers}
      portfolioId={portfolioId}
      isPortfolioPublished={isPortfolioPublished}
      onNavigateToSection={handleSectionChange}
    />
  )

  // Show dashboard immediately - no loader blocking
  // If session is invalid, redirect will happen automatically via useSession hook
  // Use placeholder user if not loaded yet to render UI immediately
  const displayUser = user || {
    id: 0,
    name: "",
    githubUsername: "",
    avatarUrl: "",
    bio: "",
    repositories: []
  }

  return (
    <>
      <Toaster position="top-left" />

      <Dialog
        open={summary.open}
        onOpenChange={(open) => {
          if (!open) {
            summary.dismiss()
          }
        }}
      >
        <DialogContent className="max-w-md space-y-4">
          <DialogHeader>
            <DialogTitle>Community updates</DialogTitle>
            <DialogDescription>
              {summary.sinceLabel
                ? `Your projects received new upvotes since ${summary.sinceLabel}.`
                : "Your projects recently received fresh upvotes from the community."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {summary.projects.map((project) => (
              <div
                key={project.projectId}
                className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground line-clamp-2">
                    {project.projectName}
                  </span>
                  <span className="text-sm font-bold text-orange-600">
                    +{project.recentUpvotes}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total upvotes: {project.totalUpvotes}
                </p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={summary.dismiss} className="ml-auto">
              Got it, thanks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        <DashboardLayout
        user={displayUser}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        livePortfolio={portfolio.livePortfolio}
        portfolioData={portfolio.portfolioData}
        hasUnsavedChanges={portfolio.hasUnsavedChanges && !portfolio.isInitialLoad}
        onPublish={publishing.publishAll}
        isPublishing={publishing.isPublishing}
        notificationBell={
          <UpvoteNotificationsBell
            notifications={dashboardNotifications.notifications}
            unreadCount={dashboardNotifications.unreadCount}
            readNotificationIds={Array.from(dashboardNotifications.readNotificationIds)}
            onOpenChange={dashboardNotifications.onOpenChange}
            onMarkAllRead={dashboardNotifications.markAllRead}
          />
        }
      >
        {renderActiveSection}
      </DashboardLayout>
    </>
  )
}
