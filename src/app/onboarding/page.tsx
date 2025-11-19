"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DevFolioLoader } from "@/components/ui/DevFolioLoader"
import { useSession } from "@/hooks/useSession"
import { usePortfolio } from "@/hooks/usePortfolio"
import { usePortfolioHandlers } from "@/hooks/usePortfolioHandlers"
import { publishPortfolio } from "@/lib/services/portfolio-service"
import ThemeSelector from "@/components/dashboard/ThemeSelector"
import type { ThemeKey } from "@/lib/theme-config"
import { Repository, Skill, skillsDatabase } from "@/interface"

const onboardingSteps = [
  {
    title: "Add Projects",
    description: "Pick your best work",
  },
  {
    title: "Highlight Skills",
    description: "Show your tech stack",
  },
  {
    title: "Link Socials",
    description: "Connect your profiles",
  },
  {
    title: "Theme & Finish",
    description: "Pick a vibe & publish",
  },
]

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useSession({ redirectOnAuthFailure: true })
  const portfolio = usePortfolio(user)
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

  const {
    handleToggleRepo,
    handleAddImportedProject,
    handleAddSkill,
    handleRemoveSkill,
    handleAddSocial,
    handleRemoveSocial,
    handleUpdateSocial,
    handleThemeChange,
    handleUpdatePortfolioData,
  } = handlers

  const [currentStep, setCurrentStep] = useState(0)
  const [isPublishing, setIsPublishing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const initializedRef = useRef(false)

  // SECURITY: Sanitize username from URL parameters to prevent injection
  const claimedUsername = useMemo(() => {
    const rawUsername = searchParams.get("username") || ""
    if (!rawUsername) return ""
    
    // Sanitize: only allow alphanumeric, dash, and underscore
    const sanitized = rawUsername
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "")
    
    // Validate length (3-20 characters)
    if (sanitized.length < 3 || sanitized.length > 20) {
      console.warn("Invalid username length from URL:", rawUsername)
      return ""
    }
    
    return sanitized
  }, [searchParams])

  useEffect(() => {
    if (user && !initializedRef.current) {
      initializedRef.current = true
      const initialData = {
        displayName: user.name || user.githubUsername || "",
        jobTitle: "",
        bio: user.bio || "",
        profilePic: user.avatarUrl || "",
        customUsername: "",
      }
      portfolio.setPortfolioData(initialData)
      if (user.githubUsername) {
        portfolio.loadExistingData(user.githubUsername, initialData)
      }
    }
  }, [portfolio, user])

  useEffect(() => {
    if (claimedUsername && !portfolio.portfolioData.customUsername) {
      handleUpdatePortfolioData({ customUsername: claimedUsername })
    }
  }, [claimedUsername, handleUpdatePortfolioData, portfolio.portfolioData.customUsername])

  const isLoading =
    loading ||
    !user ||
    portfolio.isLoadingPortfolio ||
    portfolio.isInitialLoad

  const sanitizedRepos = user?.repositories || []

  const handleProjectImport = useCallback(
    async (url: string) => {
      setImportError(null)
      setImporting(true)
      try {
        const res = await fetch("/api/extract-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.error || "Failed to fetch project metadata")
        }
        const project: Repository = {
          id: data.projectData.id,
          githubId: data.projectData.id,
          name: data.projectData.name,
          fullName: data.projectData.fullName,
          description: data.projectData.description || "",
          htmlUrl: data.projectData.htmlUrl,
          homepage: url.trim(), // Use the original URL as homepage
          language: data.projectData.language || "",
          languages: data.projectData.languages || [],
          stargazersCount: data.projectData.stargazersCount || 0,
          forksCount: data.projectData.forksCount || 0,
          isPrivate: false,
          isFork: false,
          size: data.projectData.size || 0,
          createdAt: data.projectData.createdAt,
          updatedAt: data.projectData.updatedAt,
          pushedAt: data.projectData.pushedAt,
          isImported: true,
          favicon: data.projectData.favicon || data.metadata?.favicon || null,
          logo: data.projectData.logo || data.metadata?.ogImage || null,
          githubUrl: data.projectData.githubUrl,
          siteName: data.projectData.siteName,
          keywords: data.projectData.keywords,
          author: data.projectData.author,
        }
        handleAddImportedProject(project)
      } catch (error: any) {
        setImportError(error?.message || "Unable to import project")
        throw error
      } finally {
        setImporting(false)
      }
    },
    [handleAddImportedProject]
  )

  const removeImportedProject = useCallback(
    (projectId: number) => {
      portfolio.setImportedProjects((prev) => prev.filter((p) => p.id !== projectId))
      portfolio.setSelectedRepos((prev) => prev.filter((id) => id !== projectId))
      portfolio.setRepoOrder((prev) => prev.filter((id) => id !== projectId))
    },
    [portfolio]
  )

  const selectedSkills = useMemo(() => portfolio.skills || [], [portfolio.skills])

  const handleSocialChange = useCallback(
    (platform: string, username: string, urlPrefix: string) => {
      const trimmed = username.trim()
      const existing = portfolio.socials.find((social) => social.platform === platform)
      const url = trimmed ? (urlPrefix ? `${urlPrefix}${trimmed}` : trimmed) : ""
      if (!trimmed) {
        if (existing) {
          handleRemoveSocial(existing.id)
        }
        return
      }
      if (existing) {
        handleUpdateSocial(existing.id, { username: trimmed, url })
      } else {
        handleAddSocial({
          platform,
          username: trimmed,
          url,
          isPinned: platform.toLowerCase() === "github",
        })
      }
    },
    [handleAddSocial, handleRemoveSocial, handleUpdateSocial, portfolio.socials]
  )

  const goNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, onboardingSteps.length - 1))
  }

  const goPrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleFinish = async () => {
    if (!user) return
    if (isPublishing) return
    setIsPublishing(true)
    try {
      const allRepositories = [...(user.repositories || []), ...portfolio.importedProjects]
      await publishPortfolio({
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
        userId: user.id,
        userData: user,
        logoOverrides: portfolio.logoOverrides,
        backgroundColor: portfolio.backgroundColor,
        backgroundPattern: portfolio.backgroundPattern,
        cvUrl: portfolio.cvUrl,
      })
      portfolio.resetAfterPublish()
      router.push("/dashboard?just-onboarded=1")
    } catch (error) {
      console.error("Failed to publish onboarding data:", error)
      alert("Publishing failed. Please try again in a moment.")
      setIsPublishing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <DevFolioLoader size="lg" />
      </div>
    )
  }

    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        <div className="pointer-events-none absolute -left-10 top-16 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-12 transition-all duration-300 md:items-center md:justify-start md:pl-12">
          <Card className="w-full max-w-lg border border-border/40 bg-card/95 shadow-2xl shadow-orange-500/10 backdrop-blur">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs font-medium"
                  onClick={() => router.push("/dashboard")}
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Dashboard
                </Button>

                <Badge className="bg-muted/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Step {currentStep + 1}/{onboardingSteps.length}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5">
                {onboardingSteps.map((_, index) => {
                  const isActive = index === currentStep
                  const isComplete = index < currentStep
                  return (
                    <span
                      key={index}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        isActive
                          ? "bg-orange-500"
                          : isComplete
                            ? "bg-orange-500/40"
                            : "bg-muted"
                      )}
                    />
                  )
                })}
              </div>

              <div className="space-y-0.5">
                <p className="text-base font-semibold text-foreground">
                  {onboardingSteps[currentStep].title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {onboardingSteps[currentStep].description}
                </p>
              </div>

              <div className="space-y-4">
                {currentStep === 0 && (
                  <ProjectsStep
                    userRepos={sanitizedRepos}
                    selectedRepos={portfolio.selectedRepos}
                    importedProjects={portfolio.importedProjects}
                    onToggleRepo={handleToggleRepo}
                    onImportUrl={handleProjectImport}
                    onRemoveImported={removeImportedProject}
                    isImporting={importing}
                    importError={importError}
                    onNext={goNext}
                  />
                )}
                {currentStep === 1 && (
                  <SkillsStep
                    selectedSkills={selectedSkills}
                    onAddSkill={handleAddSkill}
                    onRemoveSkill={handleRemoveSkill}
                    onNext={goNext}
                  />
                )}
                {currentStep === 2 && (
                  <SocialStep
                    socials={portfolio.socials}
                    onSocialChange={handleSocialChange}
                    onNext={goNext}
                  />
                )}
                {currentStep === 3 && (
                  <ThemeStep
                    userId={user?.id || 0}
                    selectedTheme={portfolio.selectedTheme}
                    onThemeChange={handleThemeChange}
                    backgroundColor={portfolio.backgroundColor}
                    setBackgroundColor={portfolio.setBackgroundColor}
                    backgroundPattern={portfolio.backgroundPattern}
                    setBackgroundPattern={portfolio.setBackgroundPattern}
                    onFinish={handleFinish}
                    isPublishing={isPublishing}
                  />
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border/20 pt-3">
                {currentStep > 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goPrev}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 2 && (
                  <button
                    onClick={goNext}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Skip
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <DevFolioLoader size="lg" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}

interface ProjectsStepProps {
  userRepos: Repository[]
  selectedRepos: number[]
  importedProjects: Repository[]
  onToggleRepo: (repoId: number) => void
  onImportUrl: (url: string) => Promise<void>
  onRemoveImported: (repoId: number) => void
  isImporting: boolean
  importError: string | null
  onNext: () => void
}

function ProjectsStep({
  userRepos,
  selectedRepos,
  importedProjects,
  onToggleRepo,
  onImportUrl,
  onRemoveImported,
  isImporting,
  importError,
  onNext,
}: ProjectsStepProps) {
  const [importUrl, setImportUrl] = useState("")
  const [fetchedData, setFetchedData] = useState<{title: string; description: string} | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [showGithubRepos, setShowGithubRepos] = useState(false)

  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false)
  const [metadataPreview, setMetadataPreview] = useState<{
    title: string
    description: string
    favicon?: string
    image?: string
  } | null>(null)

  // Auto-fetch when URL is entered (0.5s debounce)
  useEffect(() => {
    const url = importUrl.trim()
    if (!url) {
      setFetchedData(null)
      setMetadataPreview(null)
      return
    }

    // Validate URL format
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return
    }

    // Check if URL looks valid (has domain)
    try {
      const urlObj = new URL(url)
      if (!urlObj.hostname || urlObj.hostname === 'https' || urlObj.hostname === 'http') {
        return
      }
    } catch {
      return
    }

    setIsFetchingMetadata(true)
    const timer = setTimeout(async () => {
      try {
        setLocalError(null)
        const res = await fetch("/api/extract-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        const data = await res.json()
        
        if (res.ok && data.projectData) {
          setFetchedData({
            title: data.projectData.name || "",
            description: data.projectData.description || ""
          })
          setMetadataPreview({
            title: data.projectData.name || "",
            description: data.projectData.description || "",
            favicon: data.projectData.favicon || data.metadata?.favicon,
            image: data.metadata?.ogImage || data.projectData.logo
          })
        }
      } catch (error) {
        // Silent fail - user can still manually edit
      } finally {
        setIsFetchingMetadata(false)
      }
    }, 500) // 0.5s debounce

    return () => {
      clearTimeout(timer)
      setIsFetchingMetadata(false)
    }
  }, [importUrl])

  const handleAddUrlProject = async () => {
    if (!importUrl.trim()) {
      setLocalError("Please enter a project URL")
      return
    }
    
    setLocalError(null)
    try {
      const urlToImport = importUrl.trim()
      await onImportUrl(urlToImport)
      setImportUrl("")
      setFetchedData(null)
      setMetadataPreview(null)
    } catch {
      // error handled upstream
    }
  }

  const handleSaveAndContinue = () => {
    // Check if user has added at least one project
    if (importedProjects.length === 0 && selectedRepos.length === 0) {
      setLocalError("Please add at least one project")
      return
    }
    onNext()
  }

  return (
    <div className="space-y-4">

      {/* URL Input with Auto-fetch */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-1.5">
          <div className="flex items-center gap-2 px-3">
            <span className="text-sm text-muted-foreground">https://</span>
            <Input
              value={importUrl.replace(/^https?:\/\//, '')}
              onChange={(e) => {
                const value = e.target.value
                // Don't prepend if value is empty
                if (!value.trim()) {
                  setImportUrl('')
                  return
                }
                // Only prepend https:// if not already present
                if (value.startsWith('http://') || value.startsWith('https://')) {
                  setImportUrl(value)
                } else {
                  setImportUrl('https://' + value)
                }
              }}
              placeholder="myawesomewebsite.com"
              className="border-0 bg-transparent px-0 text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        {isFetchingMetadata && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Fetching metadata...</span>
          </div>
        )}

        {metadataPreview && !isFetchingMetadata && (
          <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
            <div className="flex items-start gap-3">
              {metadataPreview.favicon && (
                <img
                  src={metadataPreview.favicon}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{metadataPreview.title || "Project"}</p>
                {metadataPreview.description && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {metadataPreview.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {(localError || importError) && (
          <p className="text-sm text-destructive">{localError || importError}</p>
        )}

        {importUrl && !isImporting && (
          <Button
            onClick={handleAddUrlProject}
            disabled={isImporting || isFetchingMetadata}
            className="w-full bg-foreground py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Project"
            )}
          </Button>
        )}

      </div>

      {/* OR divider */}
      {importUrl && (importedProjects.length > 0 || selectedRepos.length > 0) && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border/50" />
        </div>
      )}

      {/* Select from GitHub */}
      <div>
        <button
          onClick={() => setShowGithubRepos(!showGithubRepos)}
          className="w-full rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-left transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Select from GitHub</span>
            <CheckCircle2 className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              showGithubRepos ? "rotate-180" : ""
            )} />
          </div>
        </button>

        {showGithubRepos && (
          <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">
            {userRepos.slice(0, 6).map((repo) => {
              const isSelected = selectedRepos.includes(repo.id)
              return (
                <button
                  key={repo.id}
                  type="button"
                  onClick={() => {
                    onToggleRepo(repo.id)
                  }}
                  className={cn(
                    "w-full rounded-md border px-3 py-2 text-left transition-all",
                    isSelected
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                      : "border-border/40 bg-background hover:border-orange-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">{repo.name}</p>
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-orange-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-border" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* All Added Projects Summary */}
      {(importedProjects.length > 0 || selectedRepos.length > 0) && (
        <div className="space-y-2 rounded-lg border border-border/40 bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Added Projects ({importedProjects.length + selectedRepos.length}):
          </p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {importedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-2 rounded border border-green-500/20 bg-green-50/50 px-2 py-1.5 dark:bg-green-950/20"
              >
                {project.favicon || project.logo ? (
                  <img
                    src={project.favicon || project.logo || ''}
                    alt=""
                    className="h-5 w-5 rounded object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-green-200 text-[10px] font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <p className="truncate text-xs font-medium text-green-700 dark:text-green-400">
                  {project.name}
                </p>
                <button
                  onClick={() => onRemoveImported(project.id)}
                  className="ml-auto text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            {selectedRepos.map((repoId) => {
              const repo = userRepos.find(r => r.id === repoId)
              if (!repo) return null
              return (
                <div
                  key={repoId}
                  className="flex items-center gap-2 rounded border border-orange-500/20 bg-orange-50/50 px-2 py-1.5 dark:bg-orange-950/20"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-orange-200 text-[10px] font-bold text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                    {repo.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="truncate text-xs font-medium text-orange-700 dark:text-orange-400">
                    {repo.name}
                  </p>
                  <button
                    onClick={() => onToggleRepo(repoId)}
                    className="ml-auto text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Save & Continue Button */}
      {(importedProjects.length > 0 || selectedRepos.length > 0) && (
        <Button
          onClick={handleSaveAndContinue}
          className="w-full bg-foreground py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Save & Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

interface SkillsStepProps {
  selectedSkills: Skill[]
  onAddSkill: (skill: Omit<Skill, "id">) => void
  onRemoveSkill: (id: string) => void
  onNext: () => void
}

function SkillsStep({ selectedSkills, onAddSkill, onRemoveSkill, onNext }: SkillsStepProps) {
  const [searchTerm, setSearchTerm] = useState("")
  
  const selectedNames = useMemo(
    () => new Set(selectedSkills.map((skill) => skill.name.toLowerCase())),
    [selectedSkills]
  )

  const filteredSkills = useMemo(() => {
    if (!searchTerm.trim()) return skillsDatabase.slice(0, 40)
    return skillsDatabase
      .filter((skill) =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 40)
  }, [searchTerm])

  const toggleSkill = (skillName: string, category: string) => {
    const normalized = skillName.toLowerCase()
    const existing = selectedSkills.find(
      (skill) => skill.name.toLowerCase() === normalized
    )
    if (existing) {
      onRemoveSkill(existing.id)
    } else {
      onAddSkill({ name: skillName, category })
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search skills..."
        className="h-9"
      />

        {/* Skills Grid */}
        <div className="max-h-[280px] overflow-y-auto rounded-lg border border-border/40 bg-muted/20 p-3">
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
            {filteredSkills.map((skill) => {
              const isActive = selectedNames.has(skill.name.toLowerCase())
              const IconComponent = skill.icon
              return (
                <button
                  key={skill.name}
                  type="button"
                  onClick={() => toggleSkill(skill.name, skill.category)}
                  title={skill.name}
                  className={cn(
                    "group relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all",
                    isActive
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                      : "border-border/40 bg-background hover:border-orange-300"
                  )}
                >
                  <IconComponent
                    className="h-4 w-4"
                    style={{ color: isActive ? '#f97316' : skill.color }}
                  />
                  {isActive && (
                    <div className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-500 text-white">
                      <CheckCircle2 className="h-2 w-2" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

      {/* Selected Count */}
      {selectedSkills.length > 0 && (
        <div className="rounded-lg border border-green-500/20 bg-green-50/50 px-3 py-2 text-center dark:bg-green-950/20">
          <p className="text-xs font-medium text-green-700 dark:text-green-400">
            ✓ {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      {/* Save Button */}
      {selectedSkills.length > 0 && (
        <Button
          onClick={onNext}
          className="w-full bg-foreground py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Save & Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

const SOCIAL_PLATFORMS = [
  { 
    platform: "github", 
    label: "GitHub", 
    prefix: "https://github.com/",
    icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
  },
  { 
    platform: "twitter", 
    label: "Twitter / X", 
    prefix: "https://x.com/",
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
  },
  { 
    platform: "linkedin", 
    label: "LinkedIn", 
    prefix: "https://www.linkedin.com/in/",
    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
  },
  { 
    platform: "instagram", 
    label: "Instagram", 
    prefix: "https://instagram.com/",
    icon: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"
  },
  { 
    platform: "youtube", 
    label: "YouTube", 
    prefix: "https://youtube.com/",
    icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
  },
  { 
    platform: "website", 
    label: "Personal Website", 
    prefix: "",
    icon: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.84 4.67c.137-.098.293-.147.448-.147.377 0 .735.305.878.748l1.182 3.665c.069.214.104.43.104.648 0 .621-.27 1.15-.673 1.412l-2.897 1.882c-.137.089-.293.134-.448.134-.377 0-.735-.305-.878-.748L8.694 8.599c-.069-.214-.104-.43-.104-.648 0-.621.27-1.15.673-1.412l2.897-1.882zm5.537 4.748c.377 0 .735.305.878.748l1.182 3.665c.069.214.104.43.104.648 0 .621-.27 1.15-.673 1.412l-2.897 1.882c-.137.089-.293.134-.448.134-.377 0-.735-.305-.878-.748l-1.182-3.665c-.069-.214-.104-.43-.104-.648 0-.621.27-1.15.673-1.412l2.897-1.882c.137-.098.293-.147.448-.147z"
  },
]

interface SocialStepProps {
  socials: any[]
  onSocialChange: (platform: string, username: string, urlPrefix: string) => void
  onNext: () => void
}

function SocialStep({ socials, onSocialChange, onNext }: SocialStepProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("")
  const [inputValue, setInputValue] = useState("")
  
  const addedPlatforms = useMemo(() => {
    return socials.map(s => s.platform.toLowerCase())
  }, [socials])

  const handleAdd = () => {
    if (!selectedPlatform || !inputValue.trim()) return
    const platform = SOCIAL_PLATFORMS.find(p => p.platform === selectedPlatform)
    if (!platform) return
    
    onSocialChange(platform.platform, inputValue.trim(), platform.prefix)
    setSelectedPlatform("")
    setInputValue("")
  }

  const handleRemove = (platform: string) => {
    onSocialChange(platform, "", "")
  }

  return (
    <div className="space-y-4">
      {/* Added Socials */}
      {socials.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Added Socials:</p>
          {socials.map((social) => {
            const platform = SOCIAL_PLATFORMS.find(p => p.platform.toLowerCase() === social.platform.toLowerCase())
            return (
              <div
                key={social.platform}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
              >
                {platform && (
                  <svg className="h-5 w-5 shrink-0 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d={platform.icon} />
                  </svg>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">{platform?.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{social.username}</p>
                </div>
                <button
                  onClick={() => handleRemove(social.platform)}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Dropdown and Input */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Select Platform</label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="">Choose a platform...</option>
            {SOCIAL_PLATFORMS.filter(p => !addedPlatforms.includes(p.platform.toLowerCase())).map((platform) => (
              <option key={platform.platform} value={platform.platform}>
                {platform.label}
              </option>
            ))}
          </select>
        </div>

        {selectedPlatform && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {SOCIAL_PLATFORMS.find(p => p.platform === selectedPlatform)?.label} Handle
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
                {(() => {
                  const platform = SOCIAL_PLATFORMS.find(p => p.platform === selectedPlatform)
                  return platform ? (
                    <svg className="h-4 w-4 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d={platform.icon} />
                    </svg>
                  ) : null
                })()}
                {SOCIAL_PLATFORMS.find(p => p.platform === selectedPlatform)?.prefix && (
                  <span className="text-xs text-muted-foreground">
                    {SOCIAL_PLATFORMS.find(p => p.platform === selectedPlatform)?.prefix}
                  </span>
                )}
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    SOCIAL_PLATFORMS.find(p => p.platform === selectedPlatform)?.prefix 
                      ? "username" 
                      : "https://your-site.com"
                  }
                  className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAdd()
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={!inputValue.trim()}
                size="sm"
                className="h-9 bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-600"
              >
                Add
              </Button>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={onNext}
        className="w-full bg-foreground py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
      >
        Continue
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}


interface ThemeStepProps {
  userId: number
  selectedTheme: string
  onThemeChange: (theme: string) => void
  backgroundColor: string | null
  setBackgroundColor: (color: string | null) => void
  backgroundPattern: string | null
  setBackgroundPattern: (pattern: string | null) => void
  onFinish: () => void
  isPublishing: boolean
}

function ThemeStep({
  userId,
  selectedTheme,
  onThemeChange,
  backgroundColor,
  setBackgroundColor,
  backgroundPattern,
  setBackgroundPattern,
  onFinish,
  isPublishing,
}: ThemeStepProps) {
  return (
    <div className="space-y-4">
      <div className="max-h-[320px] overflow-y-auto rounded-lg border border-border/40 bg-muted/10 p-3">
        <ThemeSelector
          currentTheme={selectedTheme as ThemeKey}
          userId={userId}
          onThemeChange={onThemeChange}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          backgroundPattern={backgroundPattern}
          setBackgroundPattern={setBackgroundPattern}
          onboardingMode={true}
        />
      </div>

      <Button
        onClick={onFinish}
        disabled={isPublishing}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-semibold text-white shadow-md hover:from-orange-600 hover:to-orange-700"
      >
        {isPublishing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Publishing...
          </>
        ) : (
          <>
            Publish Portfolio
            <Sparkles className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}
