import { useEffect, useMemo, useState, Dispatch, SetStateAction } from "react"
import toast from "react-hot-toast"
import { devLog, devWarn } from "@/lib/logger"
import type { ProjectInsightsPayload } from "@/components/dashboard/AddProjectModal"
import type { PortfolioRepository, RepoEditInitial, Repository } from "@/components/dashboard/repos/types"

interface UseReposManagementParams {
  repositories: Repository[]
  selectedRepos: number[]
  initialDeployedUrls?: Record<number, string>
  initialCustomNames?: Record<number, string>
  initialCustomDescriptions?: Record<number, string>
  initialProjectCategories?: Record<number, string>
  initialProjectStatuses?: Record<number, string>
  initialProjectRevenues?: Record<number, number>
  initialProjectMrrs?: Record<number, number>
  initialProjectUsers?: Record<number, number>
  initialProjectTechnologies?: Record<number, string>
  initialRepoOrder?: number[]
  initialLogoOverrides?: Record<number, string>
  onToggleRepo: (repoId: number) => void
  onUpdateRepoOrder: (newOrder: number[]) => void
  onUpdateDeployedUrl: (repoId: number, url: string) => void
  onUpdateCustomName: (repoId: number, name: string) => void
  onUpdateCustomDescription: (repoId: number, description: string) => void
  onUpdateProjectCategory?: (repoId: number, category: string | null) => void
  onUpdateProjectStatus?: (repoId: number, status: string | null) => void
  onUpdateProjectRevenue?: (repoId: number, value: number | null) => void
  onUpdateProjectMrr?: (repoId: number, value: number | null) => void
  onUpdateProjectUsers?: (repoId: number, value: number | null) => void
  onUpdateProjectTechnologies?: (repoId: number, value: string | null) => void
  onUpdateLogo?: (repoId: number, logo: string | null) => void
  portfolioId?: number
}

export function useReposManagement({
  repositories,
  selectedRepos,
  initialDeployedUrls,
  initialCustomNames,
  initialCustomDescriptions,
  initialProjectCategories,
  initialProjectStatuses,
  initialProjectRevenues,
  initialProjectMrrs,
  initialProjectUsers,
  initialProjectTechnologies,
  initialRepoOrder,
  initialLogoOverrides,
  onToggleRepo,
  onUpdateRepoOrder,
  onUpdateDeployedUrl,
  onUpdateCustomName,
  onUpdateCustomDescription,
  onUpdateProjectCategory,
  onUpdateProjectStatus,
  onUpdateProjectRevenue,
  onUpdateProjectMrr,
  onUpdateProjectUsers,
  onUpdateProjectTechnologies,
  onUpdateLogo,
  portfolioId,
}: UseReposManagementParams) {
  const [deployedUrls, setDeployedUrls] = useState<Record<number, string>>(initialDeployedUrls || {})
  const [customNames, setCustomNames] = useState<Record<number, string>>(initialCustomNames || {})
  const [customDescriptions, setCustomDescriptions] = useState<Record<number, string>>(initialCustomDescriptions || {})
  const [projectCategoriesState, setProjectCategoriesState] = useState<Record<number, string>>(initialProjectCategories || {})
  const [projectStatusesState, setProjectStatusesState] = useState<Record<number, string>>(initialProjectStatuses || {})
  const [projectRevenuesState, setProjectRevenuesState] = useState<Record<number, number>>(initialProjectRevenues || {})
  const [projectMrrsState, setProjectMrrsState] = useState<Record<number, number>>(initialProjectMrrs || {})
  const [projectUsersState, setProjectUsersState] = useState<Record<number, number>>(initialProjectUsers || {})
  const [customTechnologies, setCustomTechnologies] = useState<Record<number, string>>(initialProjectTechnologies || {})
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editInitial, setEditInitial] = useState<RepoEditInitial | null>(null)
  const [logoOverrides, setLogoOverrides] = useState<Record<number, string>>(initialLogoOverrides || {})
  const [deletingRepoIds, setDeletingRepoIds] = useState<Record<number, boolean>>({})
  const [chartPeriods, setChartPeriods] = useState<Record<number, "week" | "month" | "year">>({})

  useEffect(() => {
    setProjectCategoriesState(initialProjectCategories || {})
  }, [initialProjectCategories])

  useEffect(() => {
    setProjectStatusesState(initialProjectStatuses || {})
  }, [initialProjectStatuses])

  useEffect(() => {
    setProjectRevenuesState(initialProjectRevenues || {})
  }, [initialProjectRevenues])

  useEffect(() => {
    setProjectMrrsState(initialProjectMrrs || {})
  }, [initialProjectMrrs])

  useEffect(() => {
    setProjectUsersState(initialProjectUsers || {})
  }, [initialProjectUsers])

  useEffect(() => {
    setCustomTechnologies(initialProjectTechnologies || {})
  }, [initialProjectTechnologies])

  const updateCategory = (repoId: number, value: string | null) => {
    setProjectCategoriesState((prev) => {
      const next = { ...prev }
      if (!value) {
        delete next[repoId]
      } else {
        next[repoId] = value
      }
      return next
    })
    onUpdateProjectCategory?.(repoId, value && value.trim() ? value.trim() : null)
  }

  const updateStatus = (repoId: number, value: string | null) => {
    setProjectStatusesState((prev) => {
      const next = { ...prev }
      if (!value) {
        delete next[repoId]
      } else {
        next[repoId] = value
      }
      return next
    })
    onUpdateProjectStatus?.(repoId, value && value.trim() ? value.trim() : null)
  }

  const updateNumericInsight = (
    repoId: number,
    value: number | null,
    setter: Dispatch<SetStateAction<Record<number, number>>>,
    callback?: (repoId: number, value: number | null) => void
  ) => {
    setter((prev) => {
      const next = { ...prev }
      if (value === null || value === undefined || Number.isNaN(value)) {
        delete next[repoId]
      } else {
        next[repoId] = value
      }
      return next
    })
    callback?.(repoId, value ?? null)
  }

  const updateRevenue = (repoId: number, value: number | null) =>
    updateNumericInsight(repoId, value, setProjectRevenuesState, onUpdateProjectRevenue)

  const updateMrr = (repoId: number, value: number | null) =>
    updateNumericInsight(repoId, value, setProjectMrrsState, onUpdateProjectMrr)

  const updateUsers = (repoId: number, value: number | null) =>
    updateNumericInsight(repoId, value, setProjectUsersState, onUpdateProjectUsers)

  const handleCapturedInsights = (repoId: number, insights: ProjectInsightsPayload) => {
    updateCategory(repoId, insights.category ?? null)
    updateStatus(repoId, insights.status ?? null)
    updateRevenue(repoId, insights.revenue ?? null)
    updateMrr(repoId, insights.mrr ?? null)
    updateUsers(repoId, insights.users ?? null)
    if (insights.technologies) {
      setCustomTechnologies((prev) => ({ ...prev, [repoId]: insights.technologies! }))
      onUpdateProjectTechnologies?.(repoId, insights.technologies)
    }
  }

  useEffect(() => {
    setLogoOverrides(initialLogoOverrides || {})
  }, [initialLogoOverrides])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsAddProjectOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const sortOrder = useMemo(() => initialRepoOrder || [], [initialRepoOrder])

  const selectedRepositories: PortfolioRepository[] = useMemo(
    () =>
      repositories
        .filter((repo) => selectedRepos.includes(repo.id))
        .map((repo) => ({
          id: repo.id,
          portfolioRepositoryId: repo.portfolioRepositoryId,
          deployedUrl: deployedUrls[repo.id] || "",
          customName: customNames[repo.id] || "",
          customDescription: customDescriptions[repo.id] || "",
          isVisible: true,
          name: repo.name,
          description: repo.description,
          language: repo.language,
          languages: repo.languages,
          stargazersCount: repo.stargazersCount,
          forksCount: repo.forksCount,
          updatedAt: repo.updatedAt,
          htmlUrl: repo.htmlUrl,
          repository: {
            id: repo.id,
            name: repo.name,
            description: repo.description,
            htmlUrl: repo.htmlUrl,
            language: repo.language,
            stargazersCount: repo.stargazersCount,
            forksCount: repo.forksCount,
            isImported: repo.isImported,
            favicon: repo.favicon,
            logo: repo.logo,
            homepage: repo.homepage,
          },
        }))
        .sort((a, b) => {
          const indexA = sortOrder.indexOf(a.id)
          const indexB = sortOrder.indexOf(b.id)
          if (indexA === -1 && indexB === -1) return 0
          if (indexA === -1) return 1
          if (indexB === -1) return -1
          return indexA - indexB
        }),
    [repositories, selectedRepos, deployedUrls, customNames, customDescriptions, sortOrder]
  )

  useEffect(() => {
    const updates: Record<number, string> = {}
    selectedRepositories.forEach((repo) => {
      if (repo.repository.htmlUrl && !deployedUrls[repo.id] && repo.repository.homepage) {
        updates[repo.id] = repo.repository.homepage || ""
      }
    })

    if (Object.keys(updates).length > 0) {
      setDeployedUrls((prev) => ({ ...prev, ...updates }))
    }
  }, [selectedRepositories, deployedUrls])

  useEffect(() => {
    devLog("🔍 ReposSection Debug:", {
      repositories: repositories.length,
      selectedRepos,
      repoOrder: sortOrder,
      selectedRepositories: selectedRepositories.length,
      portfolioId,
      portfolioIdType: typeof portfolioId,
      portfolioIdValid: portfolioId && portfolioId !== undefined,
    })

    if (!portfolioId && selectedRepositories.length > 0) {
      devWarn("⚠️ ReposSection: portfolioId is undefined but repositories are present. Analytics may not work correctly.")
    }
  }, [repositories, selectedRepos, sortOrder, selectedRepositories, portfolioId])

  useEffect(() => {
    if (initialDeployedUrls && Object.keys(initialDeployedUrls).length > 0) {
      devLog("Syncing deployed URLs from props:", initialDeployedUrls)
      setDeployedUrls((prev) => {
        const hasChanges = JSON.stringify(prev) !== JSON.stringify(initialDeployedUrls)
        if (hasChanges) {
          devLog("Deployed URLs changed, updating...")
          return initialDeployedUrls
        }
        return prev
      })
    }
  }, [initialDeployedUrls])

  const handleRemoveRepo = async (repoId: number, portfolioRepoId?: number) => {
    setDeletingRepoIds((prev) => ({ ...prev, [repoId]: true }))

    try {
      if (portfolioRepoId) {
        const response = await fetch(`/api/portfolio/projects/${portfolioRepoId}`, {
          method: "DELETE",
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data?.error || "Failed to delete project")
        }
      }

      const newDeployedUrls = { ...deployedUrls }
      delete newDeployedUrls[repoId]

      onToggleRepo(repoId)
      onUpdateRepoOrder(sortOrder.filter((id) => id !== repoId))
      setDeployedUrls(newDeployedUrls)

      setCustomNames((prev) => {
        const next = { ...prev }
        delete next[repoId]
        return next
      })
      setCustomDescriptions((prev) => {
        const next = { ...prev }
        delete next[repoId]
        return next
      })
      setLogoOverrides((prev) => {
        const next = { ...prev }
        delete next[repoId]
        return next
      })
    } catch (error) {
      console.error("Error removing repository:", error)
      toast.error(error instanceof Error ? error.message : "Failed to remove project")
    } finally {
      setDeletingRepoIds((prev) => {
        const next = { ...prev }
        delete next[repoId]
        return next
      })
    }
  }

  const handleEditModalSave = (payload: RepoEditInitial) => {
    devLog("🔄 EditProjectModal save called:", {
      id: payload.id,
      url: payload.url,
      name: payload.name,
      hasLogo: !!payload.logo,
      logoLength: payload.logo?.length,
    })

    setDeployedUrls((prev) => ({ ...prev, [payload.id]: payload.url }))
    setCustomNames((prev) => ({ ...prev, [payload.id]: payload.name }))
    setCustomDescriptions((prev) => ({ ...prev, [payload.id]: payload.description }))

    onUpdateDeployedUrl(payload.id, payload.url)
    onUpdateCustomName(payload.id, payload.name)
    onUpdateCustomDescription(payload.id, payload.description)

    updateCategory(payload.id, payload.category ?? null)
    updateStatus(payload.id, payload.status ?? null)
    updateRevenue(payload.id, payload.revenue ?? null)
    updateMrr(payload.id, payload.mrr ?? null)
    updateUsers(payload.id, payload.users ?? null)

    if (payload.technologies) {
      setCustomTechnologies((prev) => ({ ...prev, [payload.id]: payload.technologies! }))
      onUpdateProjectTechnologies?.(payload.id, payload.technologies)
    }
    if (payload.logo) {
      setLogoOverrides((prev) => ({ ...prev, [payload.id]: payload.logo! }))
      devLog("✅ Logo override set in local state for ID:", payload.id)
    }
    if (onUpdateLogo) {
      onUpdateLogo(payload.id, payload.logo || null)
      devLog("✅ Logo override sent to parent for ID:", payload.id)
    }
  }

  return {
    deployedUrls,
    customNames,
    customDescriptions,
    projectCategoriesState,
    projectStatusesState,
    projectRevenuesState,
    projectMrrsState,
    projectUsersState,
    customTechnologies,
    isAddProjectOpen,
    setIsAddProjectOpen,
    isEditOpen,
    setIsEditOpen,
    editInitial,
    setEditInitial,
    logoOverrides,
    deletingRepoIds,
    chartPeriods,
    setChartPeriods,
    selectedRepositories,
    handleCapturedInsights,
    handleRemoveRepo,
    handleEditModalSave,
  }
}
