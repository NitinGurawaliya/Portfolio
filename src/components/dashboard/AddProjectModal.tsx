"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Github, Link as LinkIcon, Search, Loader2, DollarSign, TrendingUp, Users, Tag, Activity, Code2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { TechStackSelector } from "@/components/ui/TechStackSelector"

interface RepositoryLike {
  id: number
  name: string
  fullName?: string
  description: string
  htmlUrl: string
  language?: string
  stargazersCount?: number
  forksCount?: number
  isPrivate?: boolean
  isFork?: boolean
  size?: number
  createdAt?: string
  updatedAt?: string
  pushedAt?: string
  isImported?: boolean
  favicon?: string | null
  logo?: string | null
  homepage?: string
}

export interface ProjectInsightsPayload {
  category?: string | null // Will store comma-separated categories
  status?: string | null
  revenue?: number | null
  mrr?: number | null
  users?: number | null
  technologies?: string | null // Will store comma-separated technologies
}

interface AddProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repositories: RepositoryLike[]
  onAddImportedProject: (project: RepositoryLike) => void
  onCaptureInsights?: (repoId: number, insights: ProjectInsightsPayload) => void
}

const CATEGORY_OPTIONS = ["SaaS", "AI/ML", "Developer Tool", "Marketing", "E-commerce", "Open Source", "Consumer", "Community"]
const STATUS_OPTIONS = ["Building", "Live", "On Hold", "Sunsetting", "Idea"]

export function AddProjectModal({ open, onOpenChange, repositories, onAddImportedProject, onCaptureInsights }: AddProjectModalProps) {
  const [projectUrl, setProjectUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [favicon, setFavicon] = useState<string | null>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [status, setStatus] = useState("")
  const [revenueInput, setRevenueInput] = useState("")
  const [mrrInput, setMrrInput] = useState("")
  const [usersInput, setUsersInput] = useState("")
  const [technologies, setTechnologies] = useState<string[]>([])
  const [activeMetric, setActiveMetric] = useState<string | null>(null)

  // Simple debounce for URL metadata fetch
  useEffect(() => {
    if (!open) return
    if (!projectUrl || projectUrl.trim().length < 8) return
    const handler = setTimeout(async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/extract-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: projectUrl.trim() })
        })
        if (res.ok) {
          const { projectData, metadata } = await res.json()
          setTitle(projectData?.name || metadata?.title || "")
          setDescription(projectData?.description || metadata?.description || "")
          setFavicon(projectData?.favicon || metadata?.favicon || null)
          setLogo(projectData?.logo || metadata?.ogImage || null)
        }
      } catch (e) {
        // ignore
      } finally {
        setIsLoading(false)
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [projectUrl, open])

  const filteredRepos = useMemo(() => repositories, [repositories])

  const handleAddByGithub = (repo: RepositoryLike) => {
    onAddImportedProject({ ...repo, isImported: true })
    onOpenChange(false)
  }

  const parseNumberValue = (value: string) => {
    if (!value.trim()) return null
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 0) return null
    return Math.round(parsed)
  }

  const resetForm = () => {
    setProjectUrl("")
    setTitle("")
    setDescription("")
    setFavicon(null)
    setLogo(null)
    setCategories([])
    setStatus("")
    setRevenueInput("")
    setMrrInput("")
    setUsersInput("")
    setTechnologies([])
    setActiveMetric(null)
  }

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  const handleDone = () => {
    if (!title.trim() || !projectUrl.trim()) return
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
      logo: logo || undefined,
    }
    onAddImportedProject(newProject)
    const insights: ProjectInsightsPayload = {
      category: categories.length > 0 ? categories.join(', ') : null,
      status: status || null,
      revenue: parseNumberValue(revenueInput),
      mrr: parseNumberValue(mrrInput),
      users: parseNumberValue(usersInput),
      technologies: technologies.length > 0 ? technologies.join(', ') : null,
    }
    onCaptureInsights?.(newProject.id, insights)
    onOpenChange(false)
    // reset
    resetForm()
  }

  if (!open) return null

  // Single page with all fields
  const renderContent = () => {
    const metrics = [
      { id: 'category', label: 'Category', icon: Tag, color: 'orange' },
      { id: 'techstack', label: 'Tech Stack', icon: Code2, color: 'indigo' },
      { id: 'status', label: 'Status', icon: Activity, color: 'emerald' },
      { id: 'revenue', label: 'Annual Revenue', icon: DollarSign, color: 'blue' },
      { id: 'mrr', label: 'MRR', icon: TrendingUp, color: 'purple' },
      { id: 'users', label: 'Active Users', icon: Users, color: 'pink' },
    ]

    return (
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">Add new project</div>
            <div className="text-xs text-gray-500">Add a link and enhance your project details</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left column: inputs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" className="flex items-center gap-1 rounded-lg h-8 px-3">
                        <Github className="h-4 w-4" />
                        Import from GitHub
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start" sideOffset={8} className="z-[120] w-[420px] p-0">
                      <div className="p-3 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input placeholder="Search repositories..." className="pl-8" />
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {filteredRepos.map((repo) => (
                          <DropdownMenuItem key={repo.id} onClick={() => handleAddByGithub(repo)} className="py-3">
                            <div className="truncate">
                              <div className="text-sm font-medium">{repo.name}</div>
                              {repo.description && <div className="text-xs text-gray-500 truncate">{repo.description}</div>}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="https://example.com"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    className="pl-9 h-11 rounded-lg"
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                <Input placeholder="Name" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-lg" />
                <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-lg min-h-[120px]" />
              </div>

              {/* Right column: visuals */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border flex items-center justify-center bg-gray-50 overflow-hidden">
                    {favicon ? (
                      <img src={favicon} alt="favicon" className="h-7 w-7 object-contain" />
                    ) : (
                      <span className="text-[10px] text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Preview (OG image)</div>
                </div>
                <div className="relative aspect-[16/9] w-full rounded-lg border overflow-hidden bg-background">
                  {logo ? (
                    <img src={logo} alt="preview" className="h-full w-full object-contain " />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[11px] text-muted-foreground">No OG image found — upload a screenshot</div>
                  )}
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => setLogo(reader.result as string)
                        reader.readAsDataURL(file)
                      }}
                    />
                    <span className="px-3 py-1.5 border rounded-md hover:bg-gray-50">Upload image</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Project Insights Section */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900">Project Insights (Optional)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {metrics.map((metric) => {
                const Icon = metric.icon
                const isActive = activeMetric === metric.id
                const hasValue = 
                  (metric.id === 'category' && categories.length > 0) ||
                  (metric.id === 'techstack' && technologies.length > 0) ||
                  (metric.id === 'status' && status) ||
                  (metric.id === 'revenue' && revenueInput) ||
                  (metric.id === 'mrr' && mrrInput) ||
                  (metric.id === 'users' && usersInput)

                return (
                  <div key={metric.id} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setActiveMetric(isActive ? null : metric.id)}
                      className={cn(
                        "w-full p-4 border-2 rounded-lg transition-all duration-200",
                        "flex flex-col items-center justify-center gap-2",
                        "hover:border-gray-400",
                        isActive && "border-black bg-black/5",
                        hasValue && "bg-green-50 border-green-300"
                      )}
                    >
                      <Icon className={cn("h-6 w-6", hasValue ? "text-green-600" : "text-gray-500")} />
                      <span className="text-xs font-medium text-gray-700">{metric.label}</span>
                      {hasValue && <span className="text-[10px] text-green-600">✓ Added</span>}
                    </button>

                    {isActive && (
                      <div className="space-y-1.5">
                        {metric.id === 'category' && (
                          <div className="max-h-48 overflow-y-auto rounded-lg border border-input bg-background p-2 space-y-1">
                            {CATEGORY_OPTIONS.map((option) => (
                              <label
                                key={option}
                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={categories.includes(option)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCategories([...categories, option])
                                    } else {
                                      setCategories(categories.filter(c => c !== option))
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {metric.id === 'techstack' && (
                          <TechStackSelector
                            selectedTechs={technologies}
                            onChange={setTechnologies}
                          />
                        )}
                        {metric.id === 'status' && (
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            autoFocus
                          >
                            <option value="">Select status</option>
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}
                        {metric.id === 'revenue' && (
                          <Input
                            type="number"
                            min={0}
                            value={revenueInput}
                            onChange={(e) => setRevenueInput(e.target.value)}
                            placeholder="e.g. 50000"
                            className="h-10 rounded-lg"
                            autoFocus
                          />
                        )}
                        {metric.id === 'mrr' && (
                          <Input
                            type="number"
                            min={0}
                            value={mrrInput}
                            onChange={(e) => setMrrInput(e.target.value)}
                            placeholder="e.g. 4500"
                            className="h-10 rounded-lg"
                            autoFocus
                          />
                        )}
                        {metric.id === 'users' && (
                          <Input
                            type="number"
                            min={0}
                            value={usersInput}
                            onChange={(e) => setUsersInput(e.target.value)}
                            placeholder="e.g. 1200"
                            className="h-10 rounded-lg"
                            autoFocus
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex items-center justify-end gap-2">
          <div className="mr-auto text-xs text-gray-500">{isLoading ? 'Fetching metadata…' : ' '}</div>
          <Button onClick={() => onOpenChange(false)} variant="secondary" className="rounded-lg">Cancel</Button>
          <Button 
            onClick={handleDone} 
            disabled={isLoading || !title.trim() || !projectUrl.trim()} 
            className="bg-black text-white rounded-lg disabled:opacity-60"
          >
            Save Project
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      {/* Full Screen Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full h-full max-w-6xl max-h-[90vh] rounded-xl shadow-2xl border border-gray-600 bg-background flex flex-col overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}


