"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { DashboardSectionRenderer } from "@/components/dashboard/DashboardSectionRenderer"
import { UpvoteNotificationsBell } from "@/components/dashboard/UpvoteNotificationsBell"
import { DashboardSummaryDialog } from "@/components/dashboard/DashboardSummaryDialog"
import toast, { Toaster } from "react-hot-toast"
import { useSession } from "@/hooks/useSession"
import { usePortfolio } from "@/hooks/usePortfolio"
import { usePortfolioHandlers } from "@/hooks/usePortfolioHandlers"
import { useDashboardFeedPrefetch } from "@/hooks/useDashboardFeedPrefetch"
import { useDashboardNotifications } from "@/hooks/useDashboardNotifications"
import { publishPortfolio } from "@/lib/services/portfolio-service"
import { playNotificationSound } from "@/lib/portfolio-utils"
import { successToastConfig, errorToastConfig } from "@/lib/utils"
export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("home")
  const [portfolioId, setPortfolioId] = useState<number | null>(null)
  const [isPortfolioPublished, setIsPortfolioPublished] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const router = useRouter()
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const usernameUpdated = params.get('username_updated')
    const usernameConflict = params.get('username_conflict')

    if (usernameUpdated) {
      toast.success(`✅ Custom username claimed: /${usernameUpdated}`, successToastConfig)
      window.history.replaceState({}, '', '/dashboard')
    } else if (usernameConflict) {
      toast.error(`❌ Username '${usernameConflict}' was already taken. You can set a different one in your profile settings.`, errorToastConfig)
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

  const { user, loading } = useSession({ redirectOnAuthFailure: true })
  const portfolio = usePortfolio(user)

  const notificationsState = useDashboardNotifications({
    userId: user?.id,
    loading,
  })

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
    portfolio.originalData,
    user
  )

  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (user && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      const initialData = {
        displayName: user.name || user.githubUsername || "",
        jobTitle: "",
        bio: user.bio || "",
        profilePic: user.avatarUrl || "",
        customUsername: "",
      }
      portfolio.setPortfolioData(initialData)
      portfolio.loadExistingData(user.githubUsername, initialData)
    }
  }, [user])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("just-onboarded")) {
        portfolio.resetAfterPublish();
        params.delete("just-onboarded");
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [portfolio]);

  const handlePublishAll = async () => {
    if (isPublishing) return
    const newUsername = portfolio.portfolioData.customUsername?.trim()
    if (newUsername && handlers.usernameAvailability.isAvailable === false) {
      alert("Username is already taken. Please choose a different username.")
      return
    }

    if (handlers.usernameAvailability.isChecking) {
      alert("Please wait while we check username availability.")
      return
    }

    setIsPublishing(true)
    try {
      const allRepositories = [...(user?.repositories || []), ...portfolio.importedProjects]
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
          projectCategories: portfolio.projectCategories,
          projectStatuses: portfolio.projectStatuses,
          projectRevenues: portfolio.projectRevenues,
          projectMrrs: portfolio.projectMrrs,
          projectUsers: portfolio.projectUsers,
          projectTechnologies: portfolio.projectTechnologies,
        selectedTheme: portfolio.selectedTheme,
        repoOrder: portfolio.repoOrder,
        repositories: allRepositories,
        userId: user?.id || 0,
        userData: user,
        logoOverrides: portfolio.logoOverrides,
        backgroundColor: portfolio.backgroundColor,
        backgroundPattern: portfolio.backgroundPattern,
        cvUrl: portfolio.cvUrl
      })

      if (result.success) {
        setIsPortfolioPublished(true)
        if (result.portfolioId) {
          setPortfolioId(result.portfolioId)
        } else {
          const portfolioResponse = await fetch(`/api/portfolio/publish?username=${user?.githubUsername}`)
          if (portfolioResponse.ok) {
            const portfolioData = await portfolioResponse.json()
            if (portfolioData.portfolio?.id) {
              setPortfolioId(portfolioData.portfolio.id)
            }
          }
        }
        toast.success("🎉 Portfolio published successfully!", {
          duration: 3000,
          position: "top-left",
          style: {
            background: "#f97316",
            color: "#fff",
            fontWeight: "500",
            border: "1px solid #ea580c",
            borderRadius: "8px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f97316",
          },
        })
        playNotificationSound()
        portfolio.resetAfterPublish()
      } else {
        throw new Error(result.error || "Failed to publish portfolio")
      }
    } catch (error: any) {
      console.error("Error publishing portfolio:", error)
      toast.error(
        error.message || "Failed to publish portfolio. Please try again.", 
        errorToastConfig
      )
    } finally {
      setIsPublishing(false)
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSaveCombo = (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')
      if (!isSaveCombo) return

      e.preventDefault()
      if (!isPublishing) {
        handlePublishAll()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPublishing, portfolio, user])

  useDashboardFeedPrefetch({
    loading,
    userId: user?.id,
    isLoadingPortfolio: portfolio.isLoadingPortfolio,
    isInitialLoad: portfolio.isInitialLoad,
  })

  const handleSectionChange = (section: string) => {
    if (section === "feed") {
      router.push("/feed/projects")
      return
    }
    setActiveSection(section)
  }

  const renderedSection = (
    <DashboardSectionRenderer
      activeSection={activeSection}
      user={user}
      portfolio={portfolio}
      handlers={handlers}
      portfolioId={portfolioId}
      isPortfolioPublished={isPortfolioPublished}
      onSectionChange={handleSectionChange}
    />
  )

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

      <DashboardSummaryDialog
        open={notificationsState.summaryOpen}
        summaryProjects={notificationsState.summaryProjects}
        summarySinceLabel={notificationsState.summarySinceLabel}
        onDismiss={notificationsState.dismissSummary}
      />

        <DashboardLayout
        user={displayUser}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        livePortfolio={portfolio.livePortfolio}
        portfolioData={portfolio.portfolioData}
        hasUnsavedChanges={portfolio.hasUnsavedChanges && !portfolio.isInitialLoad}
        onPublish={handlePublishAll}
        isPublishing={isPublishing}
        notificationBell={
          <UpvoteNotificationsBell
            notifications={notificationsState.notifications}
            unreadCount={notificationsState.unreadNotificationCount}
            readNotificationIds={notificationsState.readNotificationIds}
            onOpenChange={notificationsState.handleNotificationsOpenChange}
            onMarkAllRead={notificationsState.handleMarkAllNotificationsRead}
          />
        }
      >
        {renderedSection}
      </DashboardLayout>

    </>
  )
}
