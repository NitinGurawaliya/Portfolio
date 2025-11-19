"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
          homepage: data.projectData.homepage,
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
    <div className="min-h-screen bg-background">
      {/* Back to Dashboard - Top Left */}
      <Button 
        variant="ghost"
        size="sm"
        className="fixed left-4 top-4 z-50"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Dashboard
      </Button>

      {/* Step Progress Indicator - Subtle at top */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-full border border-border/40 bg-background/80 backdrop-blur-sm px-3 py-1.5">
        {onboardingSteps.map((step, index) => {
          const isActive = index === currentStep
          const isComplete = index < currentStep
          return (
            <div key={index} className="flex items-center">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all",
                  isActive
                    ? "bg-orange-500 text-white"
                    : isComplete
                      ? "bg-orange-500/20 text-orange-600"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
              </div>
              {index < onboardingSteps.length - 1 && (
                <div 
                  className={cn(
                    "mx-1 h-0.5 w-6 rounded-full transition-all",
                    index < currentStep ? "bg-orange-500" : "bg-muted"
                  )} 
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Modals */}
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="max-w-md border-border/30 bg-card/98 backdrop-blur-md p-5 sm:p-6 [&>button]:hidden">
          <DialogHeader className="space-y-0.5">
            <DialogTitle className="text-base font-semibold">
              {onboardingSteps[currentStep].title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground/80">
              {onboardingSteps[currentStep].description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
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

          {/* Navigation */}
          <div className="mt-4 flex items-center justify-between border-t border-border/20 pt-3">
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
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
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

  // Auto-fetch when URL is entered
  useEffect(() => {
    const url = importUrl.trim()
    if (!url) {
      setFetchedData(null)
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
        }
      } catch (error) {
        // Silent fail - user can still manually edit
      }
    }, 800) // Debounce

    return () => clearTimeout(timer)
  }, [importUrl])

  const handleSaveProject = async () => {
    if (!importUrl.trim()) {
      setLocalError("Please enter a project URL")
      return
    }
    
    setLocalError(null)
    try {
      // If we have fetched data, use it; otherwise let the API fetch it
      const urlToImport = importUrl.trim()
      await onImportUrl(urlToImport)
      setImportUrl("")
      setFetchedData(null)
      // Auto-advance to next step after saving
      setTimeout(() => onNext(), 500)
    } catch {
      // error handled upstream
    }
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

        {isImporting && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Fetching project details...</span>
          </div>
        )}

        {fetchedData && !isImporting && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Project Title</label>
              <Input
                value={fetchedData.title}
                onChange={(e) => setFetchedData({ ...fetchedData, title: e.target.value })}
                placeholder="My Awesome Project"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Input
                value={fetchedData.description}
                onChange={(e) => setFetchedData({ ...fetchedData, description: e.target.value })}
                placeholder="A brief description of your project"
                className="mt-1"
              />
            </div>
          </div>
        )}

        {(localError || importError) && (
          <p className="text-sm text-destructive">{localError || importError}</p>
        )}

        {importUrl && (
          <Button
            onClick={handleSaveProject}
            disabled={isImporting}
            className="w-full bg-foreground py-3 text-sm font-medium text-background hover:bg-foreground/90"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Project"
            )}
          </Button>
        )}

        {importedProjects.length > 0 && (
          <div className="rounded-lg border border-green-500/20 bg-green-50/50 px-3 py-2 text-center dark:bg-green-950/20">
            <p className="text-xs font-medium text-green-700 dark:text-green-400">
              ✓ Project added
            </p>
          </div>
        )}
      </div>

      {/* OR divider */}
      {(importedProjects.length > 0 || selectedRepos.length > 0) && (
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
                  onClick={() => onToggleRepo(repo.id)}
                  className={cn(
                    "w-full rounded-md border px-3 py-2 text-left transition-all",
                    isSelected
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                      : "border-border/40 bg-background hover:border-orange-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">{repo.name}</p>
                    {isSelected && <CheckCircle2 className="h-3 w-3 text-orange-600" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
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
        <div className="grid grid-cols-8 gap-2">
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
                  "group relative flex h-10 w-10 items-center justify-center rounded-lg border transition-all",
                  isActive
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                    : "border-border/40 bg-background hover:border-orange-300"
                )}
              >
                <IconComponent
                  className="h-5 w-5"
                  style={{ color: isActive ? '#f97316' : skill.color }}
                />
                {isActive && (
                  <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-white">
                    <CheckCircle2 className="h-2.5 w-2.5" />
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
  { platform: "github", label: "GitHub", prefix: "https://github.com/" },
  { platform: "twitter", label: "Twitter / X", prefix: "https://x.com/" },
  { platform: "linkedin", label: "LinkedIn", prefix: "https://www.linkedin.com/in/" },
  { platform: "instagram", label: "Instagram", prefix: "https://instagram.com/" },
  { platform: "youtube", label: "YouTube", prefix: "https://youtube.com/" },
  { platform: "website", label: "Personal Website", prefix: "" },
]

interface SocialStepProps {
  socials: any[]
  onSocialChange: (platform: string, username: string, urlPrefix: string) => void
  onNext: () => void
}

function SocialStep({ socials, onSocialChange, onNext }: SocialStepProps) {
  const platformValues = useMemo(() => {
    const map: Record<string, string> = {}
    socials.forEach((social) => {
      map[social.platform.toLowerCase()] = social.username || ""
    })
    return map
  }, [socials])

  return (
    <div className="space-y-3">
      {SOCIAL_PLATFORMS.map((platform) => (
        <div
          key={platform.platform}
          className="space-y-1.5"
        >
          <label className="text-xs font-medium text-muted-foreground">{platform.label}</label>
          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
            {platform.prefix && (
              <span className="text-xs text-muted-foreground">{platform.prefix}</span>
            )}
            <Input
              value={platformValues[platform.platform] || ""}
              onChange={(e) =>
                onSocialChange(platform.platform, e.target.value, platform.prefix)
              }
              placeholder={
                platform.prefix ? "username" : "https://your-site.com"
              }
              className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      ))}

      <Button
        onClick={onNext}
        className="mt-4 w-full bg-foreground py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
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
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          Choose a theme and publish
        </p>
      </div>

      <div className="max-h-[200px] overflow-y-auto rounded-lg border border-border/40 bg-muted/10 p-3">
        <ThemeSelector
          currentTheme={selectedTheme as ThemeKey}
          userId={userId}
          onThemeChange={onThemeChange}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          backgroundPattern={backgroundPattern}
          setBackgroundPattern={setBackgroundPattern}
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
