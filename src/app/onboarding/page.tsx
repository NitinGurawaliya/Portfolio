"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Plus, Sparkles, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
    description: "Paste any live project URL or select repos directly from GitHub.",
  },
  {
    title: "Highlight Skills",
    description: "Pick the stacks you’re proud of—just tap to add or remove.",
  },
  {
    title: "Link Socials",
    description: "Help people find you everywhere else on the internet.",
  },
  {
    title: "Work Experience",
    description: "Showcase roles, internships, or freelance wins.",
  },
  {
    title: "Theme & Finish",
    description: "Choose a layout, tweak background, and publish.",
  },
]

export default function OnboardingPage() {
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

  const claimedUsername = useMemo(() => searchParams.get("username") || "", [searchParams])

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

  const handleExperienceAdd = useCallback(
    (experience: any) => {
      portfolio.setExperiences((prev) => [
        { id: experience.id || Date.now(), ...experience },
        ...prev,
      ])
    },
    [portfolio]
  )

  const handleExperienceRemove = useCallback(
    (experienceId: number | string) => {
      portfolio.setExperiences((prev) => prev.filter((exp) => exp.id !== experienceId))
    },
    [portfolio]
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <DevFolioLoader size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 border border-white/10 bg-white/5 p-6 rounded-3xl shadow-2xl ring-1 ring-white/5 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wider text-white/60">Onboarding</p>
              <h1 className="mt-2 text-3xl font-bold">
                Hey {portfolio.portfolioData.displayName || user?.name?.split(" ")?.[0] || "there"}, let’s build your page
              </h1>
              <p className="mt-1 text-sm text-white/70">
                Your public link will be{" "}
                <span className="font-semibold text-white">
                  devfolio.cc/{portfolio.portfolioData.customUsername || user?.githubUsername}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => router.push("/dashboard")}>
                Go to dashboard
              </Button>
            </div>
          </div>

          <StepIndicator currentStep={currentStep} />

          <Card className="border-0 bg-white text-slate-900 shadow-2xl">
            <CardContent className="space-y-8 p-6 sm:p-8">
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
                />
              )}
              {currentStep === 1 && (
                <SkillsStep
                  selectedSkills={selectedSkills}
                  onAddSkill={handleAddSkill}
                  onRemoveSkill={handleRemoveSkill}
                />
              )}
              {currentStep === 2 && (
                <SocialStep
                  socials={portfolio.socials}
                  onSocialChange={handleSocialChange}
                />
              )}
              {currentStep === 3 && (
                <ExperienceStep
                  experiences={portfolio.experiences}
                  onAddExperience={handleExperienceAdd}
                  onRemoveExperience={handleExperienceRemove}
                />
              )}
              {currentStep === 4 && (
                <ThemeStep
                  userId={user?.id || 0}
                  selectedTheme={portfolio.selectedTheme}
                  onThemeChange={handleThemeChange}
                  backgroundColor={portfolio.backgroundColor}
                  setBackgroundColor={portfolio.setBackgroundColor}
                  backgroundPattern={portfolio.backgroundPattern}
                  setBackgroundPattern={portfolio.setBackgroundPattern}
                />
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="ghost"
                  className="w-full border border-slate-200 text-slate-700 hover:bg-slate-100 sm:w-auto"
                  onClick={goPrev}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {currentStep === onboardingSteps.length - 1 ? (
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700 sm:w-auto"
                    onClick={handleFinish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        Publish & Go Live
                        <Sparkles className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 sm:w-auto"
                    onClick={goNext}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {onboardingSteps.map((step, index) => {
        const isActive = index === currentStep
        const isComplete = index < currentStep
        return (
          <div
            key={step.title}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm",
              isActive
                ? "border-white/30 bg-white/10 text-white"
                : isComplete
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                  : "border-white/10 bg-white/5 text-white/60"
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold",
                  isActive
                    ? "border-white bg-white/20"
                    : isComplete
                      ? "border-emerald-400 text-emerald-100"
                      : "border-white/20 text-white/60"
                )}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>
              <div>
                <p className="font-semibold">{step.title}</p>
                <p className="text-xs text-white/60">{step.description}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
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
}: ProjectsStepProps) {
  const [importUrl, setImportUrl] = useState("")
  const [repoQuery, setRepoQuery] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const filteredRepos = useMemo(() => {
    if (!repoQuery.trim()) return userRepos.slice(0, 12)
    return userRepos
      .filter((repo) =>
        repo.name.toLowerCase().includes(repoQuery.toLowerCase())
      )
      .slice(0, 12)
  }, [repoQuery, userRepos])

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importUrl.trim()) {
      setLocalError("Paste a project URL to import")
      return
    }
    setLocalError(null)
    try {
      await onImportUrl(importUrl.trim())
      setImportUrl("")
    } catch {
      // error handled upstream
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Add your flagship projects</h2>
        <p className="text-sm text-slate-600">
          Pick at least one repo or drop a live URL—people love visuals.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-700">Import from URL</p>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleImport}>
          <Input
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://your-project.com"
            className="bg-white"
          />
          <Button
            type="submit"
            className="bg-slate-900 text-white hover:bg-slate-800"
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching
              </>
            ) : (
              "Fetch preview"
            )}
          </Button>
        </form>
        {(localError || importError) && (
          <p className="text-sm text-red-500">{localError || importError}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Select from GitHub</p>
            <p className="text-xs text-slate-500">
              Showing your top repositories. Toggle to feature them.
            </p>
          </div>
          <Input
            placeholder="Search repo..."
            value={repoQuery}
            onChange={(e) => setRepoQuery(e.target.value)}
            className="max-w-xs bg-white"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {filteredRepos.map((repo) => {
            const isSelected = selectedRepos.includes(repo.id)
            return (
              <button
                key={repo.id}
                type="button"
                onClick={() => onToggleRepo(repo.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors",
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{repo.name}</p>
                  {isSelected && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {repo.description || "No description available"}
                </p>
              </button>
            )
          })}
          {filteredRepos.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No repos match your search.
            </div>
          )}
        </div>
      </div>

      {importedProjects.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Imported projects</p>
          <div className="space-y-3">
            {importedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{project.name}</p>
                  <p className="text-sm text-slate-500">{project.htmlUrl}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveImported(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface SkillsStepProps {
  selectedSkills: Skill[]
  onAddSkill: (skill: Omit<Skill, "id">) => void
  onRemoveSkill: (id: string) => void
}

function SkillsStep({ selectedSkills, onAddSkill, onRemoveSkill }: SkillsStepProps) {
  const selectedNames = useMemo(
    () => new Set(selectedSkills.map((skill) => skill.name.toLowerCase())),
    [selectedSkills]
  )

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

  const featuredSkills = skillsDatabase.slice(0, 24)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Pick your superpowers</h2>
        <p className="text-sm text-slate-600">
          These appear as badges on your portfolio hero section.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featuredSkills.map((skill) => {
          const isActive = selectedNames.has(skill.name.toLowerCase())
          return (
            <button
              key={skill.name}
              type="button"
              onClick={() => toggleSkill(skill.name, skill.category)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3 text-left transition",
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <skill.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold">{skill.name}</p>
                <p className="text-xs text-slate-500">{skill.category}</p>
              </div>
            </button>
          )
        })}
      </div>

      {selectedSkills.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Selected</p>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <Badge
                key={skill.id}
                className="cursor-pointer bg-slate-900 text-white"
                onClick={() => onRemoveSkill(skill.id)}
              >
                {skill.name} ✕
              </Badge>
            ))}
          </div>
        </div>
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
}

function SocialStep({ socials, onSocialChange }: SocialStepProps) {
  const platformValues = useMemo(() => {
    const map: Record<string, string> = {}
    socials.forEach((social) => {
      map[social.platform.toLowerCase()] = social.username || ""
    })
    return map
  }, [socials])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Where can people follow you?</h2>
        <p className="text-sm text-slate-600">
          Add usernames or URLs—it’ll auto-link with icons.
        </p>
      </div>

      <div className="space-y-4">
        {SOCIAL_PLATFORMS.map((platform) => (
          <div
            key={platform.platform}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <label className="text-sm font-medium text-slate-700">{platform.label}</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              {platform.prefix && (
                <span className="text-xs text-slate-500">{platform.prefix}</span>
              )}
              <Input
                value={platformValues[platform.platform] || ""}
                onChange={(e) =>
                  onSocialChange(platform.platform, e.target.value, platform.prefix)
                }
                placeholder={
                  platform.prefix ? "username" : "https://your-site.com"
                }
                className="border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ExperienceStepProps {
  experiences: any[]
  onAddExperience: (experience: any) => void
  onRemoveExperience: (id: number | string) => void
}

function ExperienceStep({ experiences, onAddExperience, onRemoveExperience }: ExperienceStepProps) {
  const [form, setForm] = useState({
    companyName: "",
    role: "",
    duration: "",
    description: "",
    companyUrl: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.companyName.trim()) return
    onAddExperience({ ...form })
    setForm({
      companyName: "",
      role: "",
      duration: "",
      description: "",
      companyUrl: "",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Brag about your experience</h2>
        <p className="text-sm text-slate-600">
          Companies, roles, freelance gigs—anything that shows credibility.
        </p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Company *"
            value={form.companyName}
            onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
          />
          <Input
            placeholder="Role"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
          />
          <Input
            placeholder="Duration (e.g. 2022 - Present)"
            value={form.duration}
            onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
          />
          <Input
            placeholder="Company URL"
            value={form.companyUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, companyUrl: e.target.value }))}
          />
        </div>
        <Textarea
          placeholder="What did you ship or learn?"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
        <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          Add experience
        </Button>
      </form>

      {experiences.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Timeline</p>
          <div className="space-y-3">
            {experiences.map((experience) => (
              <div
                key={experience.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {experience.companyName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {experience.role} · {experience.duration}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveExperience(experience.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {experience.description && (
                  <p className="mt-2 text-sm text-slate-600">{experience.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
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
}

function ThemeStep({
  userId,
  selectedTheme,
  onThemeChange,
  backgroundColor,
  setBackgroundColor,
  backgroundPattern,
  setBackgroundPattern,
}: ThemeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Pick a vibe</h2>
        <p className="text-sm text-slate-600">
          Layout, accent colors, background textures—everything that matches your brand.
        </p>
      </div>

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
  )
}
