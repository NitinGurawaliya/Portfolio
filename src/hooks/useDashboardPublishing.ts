import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { publishPortfolio } from "@/lib/services/portfolio-service"
import { playNotificationSound } from "@/lib/portfolio-utils"
import { errorToastConfig } from "@/lib/utils"

type UsernameAvailability = {
  isChecking: boolean
  isAvailable: boolean | null
}

type UseDashboardPublishingArgs = {
  user: any
  portfolio: any
  usernameAvailability: UsernameAvailability
  onPublished?: (payload: { portfolioId?: number | null }) => void
  onSyncOriginalData?: () => void
}

type UseDashboardPublishingResult = {
  isPublishing: boolean
  publishAll: () => Promise<void>
}

export function useDashboardPublishing({
  user,
  portfolio,
  usernameAvailability,
  onPublished,
  onSyncOriginalData,
}: UseDashboardPublishingArgs): UseDashboardPublishingResult {
  const [isPublishing, setIsPublishing] = useState(false)

  const publishAll = useCallback(async () => {
    if (isPublishing) return

    const newUsername = portfolio?.portfolioData?.customUsername?.trim?.() ?? ""
    if (newUsername && usernameAvailability.isAvailable === false) {
      alert("Username is already taken. Please choose a different username.")
      return
    }

    if (usernameAvailability.isChecking) {
      alert("Please wait while we check username availability.")
      return
    }

    setIsPublishing(true)
    try {
      const allRepositories = [...(user?.repositories || []), ...(portfolio?.importedProjects || [])]

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
        cvUrl: portfolio.cvUrl,
      })

      if (!result?.success) {
        throw new Error(result?.error || "Failed to publish portfolio")
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

      onPublished?.({ portfolioId: result?.portfolioId ?? null })
      onSyncOriginalData?.()
    } catch (error: any) {
      toast.error(error?.message || "Failed to publish portfolio. Please try again.", errorToastConfig)
    } finally {
      setIsPublishing(false)
    }
  }, [isPublishing, onPublished, onSyncOriginalData, portfolio, user, usernameAvailability.isAvailable, usernameAvailability.isChecking])

  // Keyboard shortcut: Ctrl/Cmd + S → Publish
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSaveCombo = (e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")
      if (!isSaveCombo) return
      e.preventDefault()
      if (!isPublishing) {
        void publishAll()
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKeyDown)
      return () => window.removeEventListener("keydown", onKeyDown)
    }
    return
  }, [isPublishing, publishAll])

  return { isPublishing, publishAll }
}

