"use client"

import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { HomeSection } from "@/components/dashboard/HomeSection"
import { ReposSection } from "@/components/dashboard/ReposSection"
import { SkillsSection } from "@/components/dashboard/SkillsSection"
import { SocialsSection } from "@/components/dashboard/SocialsSection"
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection"
import { ShiplogSection } from "@/components/dashboard/ShiplogSection"
import ThemeSelector from "@/components/dashboard/ThemeSelector"
import { CustomDomainSection } from "@/components/dashboard/CustomDomainSection"
import { DevFolioLoader } from "@/components/ui/DevFolioLoader"
import { UpvoteNotificationsBell, UpvoteNotification } from "@/components/dashboard/UpvoteNotificationsBell"
import { ProfileCompletionWidget } from "@/components/dashboard/ProfileCompletionWidget"
import { SharePortfolioWidget } from "@/components/dashboard/SharePortfolioWidget"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import toast, { Toaster } from "react-hot-toast"
import { useSession } from "@/hooks/useSession"
import { usePortfolio } from "@/hooks/usePortfolio"
import { usePortfolioHandlers } from "@/hooks/usePortfolioHandlers"
import { useProfileCompletion } from "@/hooks/useProfileCompletion"
import { publishPortfolio } from "@/lib/services/portfolio-service"
import { playNotificationSound } from "@/lib/portfolio-utils"
import { successToastConfig, errorToastConfig } from "@/lib/utils"
import { loadFeedCache, saveFeedCache } from "@/lib/feed-cache"
import type { Skill, Social, Repository } from "@/interface"


export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("home")
  
  // Portfolio data state
  const [portfolioData, setPortfolioData] = useState({
    displayName: "",
    jobTitle: "",
    bio: "",
    profilePic: "",
    customUsername: "",
  })
  const [selectedRepos, setSelectedRepos] = useState<number[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [socials, setSocials] = useState<Social[]>([])
  const [deployedUrls, setDeployedUrls] = useState<Record<number, string>>({})
  const [importedProjects, setImportedProjects] = useState<Repository[]>([])
  const [customNames, setCustomNames] = useState<Record<number, string>>({})
  const [customDescriptions, setCustomDescriptions] = useState<Record<number, string>>({})
  const [githubUrls, setGithubUrls] = useState<Record<number, string>>({})
  const [selectedTheme, setSelectedTheme] = useState<string>('dark')
  const [portfolioId, setPortfolioId] = useState<number | null>(null)
  const [isPortfolioPublished, setIsPortfolioPublished] = useState(false)

  // Change tracking state
  const [originalData, setOriginalData] = useState<{
    portfolioData: any
    selectedRepos: number[]
    skills: Skill[]
    socials: Social[]
    deployedUrls: Record<number, string>
    customNames: Record<number, string>
    customDescriptions: Record<number, string>
    githubUrls: Record<number, string>
    importedProjects: Repository[]
    selectedTheme: string
  } | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  
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
  
  const feedPrefetchStartedRef = useRef(false)
  type SummaryProject = {
    projectId: number
    projectName: string
    recentUpvotes: number
    totalUpvotes: number
  }
  const [notifications, setNotifications] = useState<UpvoteNotification[]>([])
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set())
  const notificationSocketRef = useRef<WebSocket | null>(null)
  const summaryFetchTriggeredRef = useRef(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summaryProjects, setSummaryProjects] = useState<SummaryProject[]>([])
  const [summarySinceLabel, setSummarySinceLabel] = useState<string | null>(null)
  const [resumeStatus, setResumeStatus] = useState<{ message: string; tone: "info" | "success" | "error" }>({
    message: "",
    tone: "info",
  })
  const [isGeneratingResume, setIsGeneratingResume] = useState(false)
  const [isProfileWidgetOpen, setIsProfileWidgetOpen] = useState(true)
  const [showShareWidget, setShowShareWidget] = useState(false)
  
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
  }, [user]) // Only depend on user, not portfolio object

  // DashboardPage में useEffect डालो:
  useEffect(() => {
    // onboarding से redirect आया है तो resetAfterPublish और share widget show करो
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("just-onboarded")) {
        portfolio.resetAfterPublish();
        params.delete("just-onboarded");
        window.history.replaceState(null, "", window.location.pathname);
        
        // Check if user hasn't dismissed the widget before
        const dismissed = localStorage.getItem("devfolio:share-widget-dismissed");
        if (!dismissed) {
          setShowShareWidget(true);
        }
      }
    }
  }, [portfolio]);

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem("devfolio:readUpvoteNotificationIds")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setReadNotificationIds(new Set(parsed.map(String)))
        }
      }
    } catch (error) {
      console.error("🔔 Failed to restore read upvote notifications:", error)
    }
  }, [])

  const updateReadNotificationIds = useCallback(
    (updater: (prev: Set<string>) => Set<string>) => {
      setReadNotificationIds((prev) => {
        const next = updater(prev)
        if (next === prev) {
          return prev
        }
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              "devfolio:readUpvoteNotificationIds",
              JSON.stringify(Array.from(next))
            )
          } catch (error) {
            console.error("🔔 Failed to persist read upvote notifications:", error)
          }
        }
        return next
      })
    },
    []
  )

  const loadNotificationsFromServer = useCallback(
    async (signal?: AbortSignal) => {
      if (!user?.id) return
      try {
        const response = await fetch("/api/dashboard/upvotes/notifications", {
          cache: "no-store",
          signal,
        })

        if (!response.ok) {
          if (response.status === 401) {
            return
          }
          throw new Error("Failed to load upvote notifications")
        }

        const data = await response.json()
        if (!Array.isArray(data.notifications)) {
          return
        }

        const mapped: UpvoteNotification[] = data.notifications.map((item: any) => ({
          id: String(item.id),
          projectId: item.projectId,
          projectName: item.projectName,
          totalUpvotes: item.totalUpvotes,
          createdAt: item.createdAt,
          actor: item.actor
            ? {
                id: item.actor.id,
                name: item.actor.name,
                githubUsername: item.actor.githubUsername,
                avatarUrl: item.actor.avatarUrl,
              }
            : undefined,
        }))

        setNotifications(mapped)

        updateReadNotificationIds((prev) => {
          const availableIds = new Set(mapped.map((item) => item.id))
          const next = new Set([...prev].filter((id) => availableIds.has(id)))
          if (next.size === prev.size) {
            return prev
          }
          return next
        })
      } catch (error) {
        if (signal?.aborted) {
          return
        }
        console.error("🔔 Failed to load upvote notifications:", error)
      }
    },
    [updateReadNotificationIds, user?.id]
  )

  useEffect(() => {
    summaryFetchTriggeredRef.current = false
  }, [user?.id])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (loading || !user?.id) return

    const controller = new AbortController()
    void loadNotificationsFromServer(controller.signal)

    return () => controller.abort()
  }, [loading, user?.id, loadNotificationsFromServer])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!user?.id) return

    if (notificationSocketRef.current) {
      try {
        notificationSocketRef.current.close()
      } catch (closeError) {
        console.error("🔔 Failed to close existing notification socket:", closeError)
      }
      notificationSocketRef.current = null
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const socket = new WebSocket(`${protocol}://${window.location.host}/api/notifications/stream`)
    notificationSocketRef.current = socket

    let heartbeat: ReturnType<typeof setInterval> | null = null

    socket.addEventListener("open", () => {
      heartbeat = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("ping")
        }
      }, 30000)
    })

    socket.addEventListener("message", async (event) => {
      try {
        if (event.data === "pong") return
        const payload =
          typeof event.data === "string"
            ? event.data
            : typeof Blob !== "undefined" && event.data instanceof Blob
              ? await event.data.text()
              : null

        if (!payload) return

        const parsed = JSON.parse(payload)
        if (parsed?.type !== "project-upvote" || !parsed.data) return

        const notification: UpvoteNotification = {
          id: String(parsed.data.notificationId),
          projectId: parsed.data.projectId,
          projectName: parsed.data.projectName,
          totalUpvotes: parsed.data.totalUpvotes,
          createdAt: parsed.data.createdAt,
          actor: parsed.data.actor,
        }

        setNotifications((prev) => {
          const filtered = prev.filter((item) => item.id !== notification.id)
          const next = [notification, ...filtered]
          return next.slice(0, 25)
        })

        playNotificationSound()

        const actorDisplay =
          notification.actor?.githubUsername ||
          notification.actor?.name ||
          "Someone"

        toast.success(
          `${actorDisplay} upvoted “${notification.projectName}”!`,
          successToastConfig
        )
      } catch (messageError) {
        console.error("🔔 Failed to process upvote websocket message:", messageError)
      }
    })

    socket.addEventListener("close", () => {
      if (heartbeat) {
        clearInterval(heartbeat)
      }
    })

    socket.addEventListener("error", (event) => {
      console.error("🔔 Upvote websocket error:", event)
    })

    return () => {
      if (heartbeat) {
        clearInterval(heartbeat)
      }
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        try {
          socket.close()
        } catch (closeError) {
          console.error("🔔 Failed to close notification socket:", closeError)
        }
      }
      if (notificationSocketRef.current === socket) {
        notificationSocketRef.current = null
      }
    }
  }, [user?.id])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (loading || !user?.id) return
    if (summaryFetchTriggeredRef.current) return

    const loadExistingPortfolioData = async (username: string, initialPortfolioData?: any) => {
      console.log("🚀 loadExistingPortfolioData called with:", { username, initialPortfolioData })
      try {
        const response = await fetch(`/api/portfolio/publish?username=${username}`)
        console.log("📡 Portfolio fetch response:", response.status, response.ok)
        
        if (response.ok) {
          const result = await response.json()
          const portfolio = result.portfolio
          console.log("🔍 Found existing portfolio:", !!portfolio)
          
          if (portfolio) {
            // Set portfolio ID and published status
            console.log('📋 Loading portfolio:', { id: portfolio.id, isPublished: portfolio.isPublished })
            setPortfolioId(portfolio.id)
            setIsPortfolioPublished(portfolio.isPublished)
            // Update portfolio data with saved data
            setPortfolioData({
              displayName: portfolio.displayName || "",
              jobTitle: portfolio.jobTitle || "",
              bio: portfolio.bio || "",
              profilePic: portfolio.profilePic || "",
              customUsername: portfolio.customUsername || "",
            })
          }
        }
      } catch (error) {
        console.error("Failed to load portfolio data:", error)
      }
    }

    summaryFetchTriggeredRef.current = true

    const controller = new AbortController()

    const fetchSummary = async () => {
      try {
        const summarySeen = localStorage.getItem("devfolio:lastUpvoteSummarySeenAt")
        const notificationsSeen = localStorage.getItem("devfolio:lastUpvoteNotificationSeenAt")
        const params = new URLSearchParams()

        let sinceCandidate: string | null = summarySeen || null
        if (notificationsSeen) {
          if (!sinceCandidate) {
            sinceCandidate = notificationsSeen
          } else {
            const notifDate = new Date(notificationsSeen)
            const summaryDate = new Date(sinceCandidate)
            if (!Number.isNaN(notifDate.getTime()) && notifDate > summaryDate) {
              sinceCandidate = notificationsSeen
            }
          }
        }

        if (sinceCandidate) {
          params.set("since", sinceCandidate)
        }
        const query = params.toString()
        const response = await fetch(
          `/api/dashboard/upvotes/summary${query ? `?${query}` : ""}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        )
        if (!response.ok) return

        const data = await response.json()
        if (controller.signal.aborted) return

        if (Array.isArray(data.projects) && data.projects.length > 0) {
          setSummaryProjects(data.projects)
          setSummaryOpen(true)

          if (data.since) {
            try {
              const date = new Date(data.since)
              if (!Number.isNaN(date.getTime())) {
                setSummarySinceLabel(
                  date.toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                )
              } else {
                setSummarySinceLabel(null)
              }
            } catch {
              setSummarySinceLabel(null)
            }
          } else {
            setSummarySinceLabel(null)
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("🔔 Failed to load upvote summary:", error)
        }
      }
    }

    fetchSummary()

    return () => {
      controller.abort()
    }
  }, [loading, user?.id])
  const handleNotificationsOpenChange = useCallback(
    (open: boolean) => {
      if (!open) return
      void loadNotificationsFromServer()
    },
    [loadNotificationsFromServer]
  )

  const handleMarkAllNotificationsRead = useCallback(() => {
    if (notifications.length === 0) return
    updateReadNotificationIds((prev) => {
      const next = new Set(prev)
      notifications.forEach((notification) => next.add(notification.id))
      return next
    })
    if (typeof window !== "undefined") {
      localStorage.setItem("devfolio:lastUpvoteNotificationSeenAt", new Date().toISOString())
    }
  }, [notifications, updateReadNotificationIds])

  const dismissSummary = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("devfolio:lastUpvoteSummarySeenAt", new Date().toISOString())
    }
    setSummaryOpen(false)
    setSummaryProjects([])
    setSummarySinceLabel(null)
  }

  // Publish handler
  const handlePublishAll = async () => {
    if (isPublishing) return
    
    // Validate username availability
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
        // Update published status and portfolio ID
        setIsPortfolioPublished(true)
        
        // Fetch the portfolio ID after publishing
        if (result.portfolioId) {
          setPortfolioId(result.portfolioId)
        } else {
          // Fetch portfolio to get ID
          const portfolioResponse = await fetch(`/api/portfolio/publish?username=${user?.githubUsername}`)
          if (portfolioResponse.ok) {
            const portfolioData = await portfolioResponse.json()
            if (portfolioData.portfolio?.id) {
              setPortfolioId(portfolioData.portfolio.id)
            }
          }
        }
        
        // Update original data to match current data (no more unsaved changes)
        // Make sure to sort arrays the same way as in change detection
        setOriginalData({
          portfolioData: { ...portfolio.portfolioData },
          selectedRepos: [...portfolio.selectedRepos].sort(),
          skills: [...portfolio.skills].sort((a, b) => a.id.localeCompare(b.id)),
          socials: [...portfolio.socials].sort((a, b) => a.id - b.id),
          deployedUrls: { ...portfolio.deployedUrls },
          customNames: { ...portfolio.customNames },
          customDescriptions: { ...portfolio.customDescriptions },
          githubUrls: { ...portfolio.githubUrls },
          selectedTheme: portfolio.selectedTheme,
          importedProjects: [...portfolio.importedProjects].sort((a, b) => a.id - b.id)
        })
        setHasUnsavedChanges(false)
        
        // Show success toast and play sound
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
        
        // Play notification sound
        playNotificationSound()

        // Reset after publish
        portfolio.resetAfterPublish()
      } else {
        throw new Error(result.error || "Failed to publish portfolio")
      }
    } catch (error: any) {
      console.error("Error publishing portfolio:", error)
      
      // Show error toast
      toast.error(
        error.message || "Failed to publish portfolio. Please try again.", 
        errorToastConfig
      )
    } finally {
      setIsPublishing(false)
    }
  }

  // Keyboard shortcut: Ctrl/Cmd + S → Publish
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

  useEffect(() => {
    if (typeof window === "undefined") return
    if (loading || !user) return
    if (portfolio.isLoadingPortfolio || portfolio.isInitialLoad) return
    if (feedPrefetchStartedRef.current) return

    const cached = loadFeedCache<any[]>("newest")
    if (cached && Array.isArray(cached.projects)) {
      feedPrefetchStartedRef.current = true
      return
    }

    feedPrefetchStartedRef.current = true

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/feed/projects?sort=newest`, {
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) return

        const data = await response.json()
        saveFeedCache("newest", data.projects ?? [])
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Feed prefetch failed", error)
        }
      }
    }, 1500)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [loading, user, portfolio.isLoadingPortfolio, portfolio.isInitialLoad])

  // Render active section - memoized for instant navigation
  const handleSectionChange = (section: string) => {
    if (section === "feed") {
      router.push("/feed/projects")
      return
    }
    setActiveSection(section)
  }

    const renderActiveSection = useMemo(() => {
      switch (activeSection) {
        case "home":
          // Home section shows immediately with user data, updates when portfolio loads
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
              onNavigateToSection={handleSectionChange}
            />
          )
        case "shiplog":
          return <ShiplogSection />
        case "repos": {
          const allRepositories = [
            ...portfolio.importedProjects,
            ...(user?.repositories || []),
          ]
          
          // Ensure all repositories have githubOgImage field
          const enrichedRepositories = allRepositories.map((repo: any) => {
            // If githubOgImage is missing, generate it from fullName or htmlUrl
            if (!repo.githubOgImage && !repo.isImported) {
              let githubOgImage: string | null = null
              
              if (repo.fullName) {
                const [owner, repoName] = repo.fullName.split('/')
                if (owner && repoName) {
                  githubOgImage = `https://opengraph.githubassets.com/${owner}/${repoName}`
                }
              } else if (repo.htmlUrl) {
                try {
                  const url = new URL(repo.htmlUrl)
                  if (url.hostname === 'github.com') {
                    const pathParts = url.pathname.split('/').filter(Boolean)
                    if (pathParts.length >= 2) {
                      const owner = pathParts[0]
                      const repoName = pathParts[1]
                      githubOgImage = `https://opengraph.githubassets.com/${owner}/${repoName}`
                    }
                  }
                } catch (e) {
                  // Ignore URL parsing errors
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

          // Get portfolio ID - try multiple sources
          const portfolioId = portfolio.originalData?.id || 
                              portfolio.portfolioData?.id ||
                              undefined
          
          // Only log if portfolioId is missing and we're not in initial load
          if (!portfolioId && portfolio.isInitialLoad === false) {
            console.warn("⚠️ Dashboard - Portfolio ID not found:", {
              originalDataId: portfolio.originalData?.id,
              portfolioDataId: portfolio.portfolioData?.id,
              portfolioData: portfolio.portfolioData,
              isLoading: portfolio.isLoadingPortfolio,
              isInitialLoad: portfolio.isInitialLoad
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
              portfolioId={portfolioId}
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
              onNavigateToSection={handleSectionChange}
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
              onNavigateToSection={handleSectionChange}
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
              onNavigateToSection={handleSectionChange}
            />
          )
        case "analytics":
          console.log("🔍 Analytics Section - Portfolio ID:", portfolio.originalData?.id)
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
    }, [activeSection, user, portfolio, handlers])

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

  const profileCompletion = useProfileCompletion({
    portfolioData: portfolio.portfolioData,
    selectedRepos: portfolio.selectedRepos,
    repoDetails: {
      deployedUrls: portfolio.deployedUrls,
      customDescriptions: portfolio.customDescriptions,
      customNames: portfolio.customNames,
      projectStatuses: portfolio.projectStatuses,
      projectCategories: portfolio.projectCategories,
    },
    skills: portfolio.skills,
    socials: portfolio.socials,
    experiences: portfolio.experiences,
    cvUrl: portfolio.cvUrl,
  })

  const canDownloadResume = profileCompletion.overallPercent >= 90

  const handleResumeDownload = useCallback(async () => {
    if (!canDownloadResume) {
      setResumeStatus({
        message: "Complete at least 90% of your profile to unlock the ATS resume.",
        tone: "error",
      })
      return
    }

    try {
      setIsGeneratingResume(true)
      setResumeStatus({
        message: "Generating your ATS-ready PDF…",
        tone: "info",
      })
      const response = await fetch("/api/resume", { method: "GET" })
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to generate resume.")
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const fallbackName =
        portfolio.portfolioData.displayName ||
        user?.name ||
        user?.githubUsername ||
        "devfolio"
      const slug = fallbackName
        .toLowerCase()
        .replace(/[^a-z0-9\- ]/g, "")
        .trim()
        .replace(/\s+/g, "-") || "devfolio"
      const link = document.createElement("a")
      link.href = url
      link.download = `${slug}-resume.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setResumeStatus({
        message: "ATS resume download started.",
        tone: "success",
      })
    } catch (error: any) {
      setResumeStatus({
        message: error?.message || "Failed to download resume.",
        tone: "error",
      })
    } finally {
      setIsGeneratingResume(false)
    }
  }, [
    canDownloadResume,
    portfolio.portfolioData.displayName,
    user?.name,
    user?.githubUsername,
  ])

  const unreadNotificationCount = useMemo(() => {
    return notifications.reduce((count, notification) => {
      return count + (readNotificationIds.has(notification.id) ? 0 : 1)
    }, 0)
  }, [notifications, readNotificationIds])

  return (
    <>
      <Toaster position="top-left" />

      <Dialog
        open={summaryOpen}
        onOpenChange={(open) => {
          if (!open) {
            dismissSummary()
          }
        }}
      >
        <DialogContent className="max-w-md space-y-4">
          <DialogHeader>
            <DialogTitle>Community updates</DialogTitle>
            <DialogDescription>
              {summarySinceLabel
                ? `Your projects received new upvotes since ${summarySinceLabel}.`
                : "Your projects recently received fresh upvotes from the community."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {summaryProjects.map((project) => (
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
            <Button onClick={dismissSummary} className="ml-auto">
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
        onPublish={handlePublishAll}
        isPublishing={isPublishing}
        notificationBell={
          <UpvoteNotificationsBell
            notifications={notifications}
            unreadCount={unreadNotificationCount}
            readNotificationIds={Array.from(readNotificationIds)}
            onOpenChange={handleNotificationsOpenChange}
            onMarkAllRead={handleMarkAllNotificationsRead}
          />
        }
      >
        {renderActiveSection}
      </DashboardLayout>

        {/* <ProfileCompletionWidget
          overallPercent={profileCompletion.overallPercent}
          sections={profileCompletion.sections}
          onNavigate={handleSectionChange}
          canDownloadResume={canDownloadResume}
          isDownloading={isGeneratingResume}
          onDownloadResume={handleResumeDownload}
          statusMessage={resumeStatus.message}
          statusTone={resumeStatus.tone}
          isOpen={isProfileWidgetOpen}
          onToggle={() => setIsProfileWidgetOpen(!isProfileWidgetOpen)}
        />

        {showShareWidget && (portfolio.portfolioData.customUsername || user?.githubUsername) && (
          <SharePortfolioWidget
            portfolioUrl={`https://devfolio.cc/${portfolio.portfolioData.customUsername || user?.githubUsername || ''}`}
            onClose={() => setShowShareWidget(false)}
          />
        )} */}
    </>
  )
}
