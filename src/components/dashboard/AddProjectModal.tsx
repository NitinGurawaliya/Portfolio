"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Github, Link as LinkIcon, Search, Loader2 } from "lucide-react"

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
  category?: string | null
  status?: string | null
  revenue?: number | null
  mrr?: number | null
  users?: number | null
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
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")
  const [revenueInput, setRevenueInput] = useState("")
  const [mrrInput, setMrrInput] = useState("")
  const [usersInput, setUsersInput] = useState("")

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
    setCategory("")
    setStatus("")
    setRevenueInput("")
    setMrrInput("")
    setUsersInput("")
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
      category: category || null,
      status: status || null,
      revenue: parseNumberValue(revenueInput),
      mrr: parseNumberValue(mrrInput),
      users: parseNumberValue(usersInput),
    }
    onCaptureInsights?.(newProject.id, insights)
    onOpenChange(false)
    // reset
    resetForm()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      {/* Modal Centered */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-[720px] max-w-full rounded-xl shadow-2xl border border-gray-600 bg-background">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <div className="text-xl font-bold">Add new project</div>
              <div className="text-xs text-gray-500">Add a link. We'll auto‑fetch title and description.</div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="flex items-center gap-1 rounded-lg h-8 px-3">
                    <Github className="h-4 w-4" />
                    Import
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" sideOffset={8} className="z-[120] w-[420px] p-0">
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
              <div className="text-[10px] text-gray-400">Ctrl/Cmd + K</div>
            </div>
          </div>

            <div className="p-6 grid grid-cols-2 gap-5">
            {/* Left column: inputs */}
            <div className="space-y-3">
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Category</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                      <option value="">Select category</option>
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Status</Label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                      <option value="">Select status</option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Annual revenue ($)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={revenueInput}
                      onChange={(e) => setRevenueInput(e.target.value)}
                      placeholder="e.g. 50000"
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">MRR ($)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={mrrInput}
                      onChange={(e) => setMrrInput(e.target.value)}
                      placeholder="e.g. 4500"
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Active users</Label>
                    <Input
                      type="number"
                      min={0}
                      value={usersInput}
                      onChange={(e) => setUsersInput(e.target.value)}
                      placeholder="e.g. 1200"
                      className="h-11 rounded-lg"
                    />
                  </div>
                </div>
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
                  <div className="h-full w-full flex items-center justify-center text-[11px] text-red-600">No OG image found — upload a screenshot</div>
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

          {/* Footer */}
          <div className="px-6 pb-5 flex items-center justify-end gap-2">
            <div className="mr-auto text-xs text-gray-500">{isLoading ? 'Fetching metadata…' : ' '}</div>
            <Button onClick={() => onOpenChange(false)} variant="secondary" className="rounded-lg">Cancel</Button>
            <Button onClick={handleDone} disabled={isLoading || !title.trim() || !projectUrl.trim()} className="bg-black text-white rounded-lg disabled:opacity-60">{isLoading ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving…</span>) : 'Save Project'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}


