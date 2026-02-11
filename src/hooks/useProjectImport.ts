import { useCallback, useEffect, useMemo, useState } from "react"
import type { ProjectInsightsPayload, ProjectMetricId, RepositoryLike } from "@/components/dashboard/projects/types"
import { useProjectMetadata } from "@/hooks/useProjectMetadata"

interface UseProjectImportParams {
  open: boolean
  repositories: RepositoryLike[]
  selectedRepos: number[]
  onAddImportedProject: (project: RepositoryLike) => void
  onCaptureInsights?: (repoId: number, insights: ProjectInsightsPayload) => void
  onOpenChange: (open: boolean) => void
}

const GITHUB_DEFAULT_DESCRIPTION_PATTERN = /^Contribute to .* development by creating an account on GitHub\.?$/i

function isGitHubUrl(url: string): boolean {
  return url.includes("github.com")
}

function parseNumberValue(value: string): number | null {
  if (!value.trim()) return null

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return null

  return Math.round(parsed)
}

export function useProjectImport({
  open,
  repositories,
  selectedRepos,
  onAddImportedProject,
  onCaptureInsights,
  onOpenChange,
}: UseProjectImportParams) {
  const [projectUrl, setProjectUrl] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [status, setStatus] = useState("")
  const [revenueInput, setRevenueInput] = useState("")
  const [mrrInput, setMrrInput] = useState("")
  const [usersInput, setUsersInput] = useState("")
  const [technologies, setTechnologies] = useState<string[]>([])
  const [activeMetric, setActiveMetric] = useState<ProjectMetricId | null>(null)
  const [githubSearchQuery, setGithubSearchQuery] = useState("")

  const projectMetadata = useProjectMetadata({
    open,
    projectUrl,
    setTitle,
    setDescription,
  })

  const {
    isLoading,
    favicon,
    logo,
    directLogoUrl,
    imageLoadError,
    imageLoading,
    resetMetadata,
    setIsFromGitHubSelection,
    applyGitHubRepository,
    handleUploadImage,
    handleImageLoadStart,
    handleImageLoad,
    handleImageError,
    captureScreenshot,
  } = projectMetadata

  const filteredRepos = useMemo(() => {
    const searchText = githubSearchQuery.trim().toLowerCase()

    return repositories
      .filter((repo) => !selectedRepos.includes(repo.id))
      .filter((repo) => {
        if (!searchText) return true

        const name = repo.name.toLowerCase()
        const fullName = repo.fullName?.toLowerCase() ?? ""
        const descriptionText = repo.description?.toLowerCase() ?? ""

        return name.includes(searchText) || fullName.includes(searchText) || descriptionText.includes(searchText)
      })
  }, [repositories, selectedRepos, githubSearchQuery])

  const resetForm = useCallback(() => {
    setProjectUrl("")
    setTitle("")
    setDescription("")
    setCategories([])
    setStatus("")
    setRevenueInput("")
    setMrrInput("")
    setUsersInput("")
    setTechnologies([])
    setActiveMetric(null)
    setGithubSearchQuery("")
    resetMetadata()
  }, [resetMetadata])

  useEffect(() => {
    if (!open) {
      resetForm()
      return
    }

    setIsFromGitHubSelection(false)
  }, [open, resetForm, setIsFromGitHubSelection])

  const handleAddByGithub = useCallback(
    (repo: RepositoryLike) => {
      setTitle(repo.name || "")

      if (repo.description && !GITHUB_DEFAULT_DESCRIPTION_PATTERN.test(repo.description.trim())) {
        setDescription(repo.description)
      } else {
        setDescription("")
      }

      applyGitHubRepository(repo)
      setProjectUrl(repo.htmlUrl || "")
      setGithubSearchQuery("")

      if (repo.languages && repo.languages.length > 0) {
        setTechnologies(repo.languages)
        return
      }

      if (repo.language) {
        setTechnologies([repo.language])
      }
    },
    [applyGitHubRepository]
  )

  const handleDone = useCallback(async () => {
    if (!title.trim() || !projectUrl.trim()) return

    let finalLogo = directLogoUrl || logo
    if (!finalLogo && !isGitHubUrl(projectUrl)) {
      finalLogo = await captureScreenshot(projectUrl.trim(), 20000)
    }

    const now = new Date().toISOString()
    const newProject: RepositoryLike = {
      id: Date.now(),
      name: title.trim(),
      fullName: title.trim(),
      description: description || "",
      htmlUrl: projectUrl.trim(),
      homepage: projectUrl.trim(),
      language: "",
      stargazersCount: 0,
      forksCount: 0,
      isPrivate: false,
      isFork: false,
      size: 0,
      createdAt: now,
      updatedAt: now,
      pushedAt: now,
      isImported: true,
      favicon: favicon || undefined,
      logo: finalLogo || undefined,
    }

    onAddImportedProject(newProject)

    const insights: ProjectInsightsPayload = {
      category: categories.length > 0 ? categories.join(", ") : null,
      status: status || null,
      revenue: parseNumberValue(revenueInput),
      mrr: parseNumberValue(mrrInput),
      users: parseNumberValue(usersInput),
      technologies: technologies.length > 0 ? technologies.join(", ") : null,
    }

    onCaptureInsights?.(newProject.id, insights)
    onOpenChange(false)
    resetForm()
  }, [
    title,
    projectUrl,
    description,
    directLogoUrl,
    logo,
    captureScreenshot,
    favicon,
    onAddImportedProject,
    categories,
    status,
    revenueInput,
    mrrInput,
    usersInput,
    technologies,
    onCaptureInsights,
    onOpenChange,
    resetForm,
  ])

  return {
    projectUrl,
    setProjectUrl,
    title,
    setTitle,
    description,
    setDescription,
    categories,
    setCategories,
    status,
    setStatus,
    revenueInput,
    setRevenueInput,
    mrrInput,
    setMrrInput,
    usersInput,
    setUsersInput,
    technologies,
    setTechnologies,
    activeMetric,
    setActiveMetric,
    githubSearchQuery,
    setGithubSearchQuery,
    filteredRepos,
    handleAddByGithub,
    handleDone,
    isLoading,
    favicon,
    logo,
    imageLoadError,
    imageLoading,
    handleUploadImage,
    handleImageLoadStart,
    handleImageLoad,
    handleImageError,
  }
}
