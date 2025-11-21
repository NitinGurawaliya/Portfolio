"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Link as LinkIcon, Loader2, DollarSign, TrendingUp, Users, Tag, Activity, Code2, X } from "lucide-react"
import { TechStackSelector } from "@/components/ui/TechStackSelector"
import { cn } from "@/lib/utils"

const CATEGORY_OPTIONS = ["SaaS", "AI/ML", "Developer Tool", "Marketing", "E-commerce", "Open Source", "Consumer", "Community"]
const STATUS_OPTIONS = ["Building", "Live", "On Hold", "Sunsetting", "Idea"]

interface EditProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: {
    id: number
    url: string
    name: string
    description: string
    logo?: string | null
    category?: string | null
    status?: string | null
    revenue?: number | null
    mrr?: number | null
    users?: number | null
    technologies?: string | null
  }
  onSave: (payload: {
    id: number
    url: string
    name: string
    description: string
    logo?: string | null
    category?: string | null
    status?: string | null
    revenue?: number | null
    mrr?: number | null
    users?: number | null
    technologies?: string | null
  }) => void
}

export function EditProjectModal({ open, onOpenChange, initial, onSave }: EditProjectModalProps) {
  const [url, setUrl] = useState(initial.url)
  const [name, setName] = useState(initial.name)
  const [description, setDescription] = useState(initial.description)
  const [logo, setLogo] = useState<string | null>(initial.logo || null)
  const [categories, setCategories] = useState<string[]>(
    initial.category ? initial.category.split(',').map(c => c.trim()).filter(Boolean) : []
  )
  const [technologies, setTechnologies] = useState<string[]>(
    initial.technologies ? initial.technologies.split(',').map(t => t.trim()).filter(Boolean) : []
  )
  const [status, setStatus] = useState(initial.status || "")
  const [revenue, setRevenue] = useState(initial.revenue ? String(initial.revenue) : "")
  const [mrr, setMrr] = useState(initial.mrr ? String(initial.mrr) : "")
  const [users, setUsers] = useState(initial.users ? String(initial.users) : "")
  const [activeMetric, setActiveMetric] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setUrl(initial.url)
    setName(initial.name)
    setDescription(initial.description)
    setLogo(initial.logo || null)
    setCategories(
      initial.category ? initial.category.split(',').map(c => c.trim()).filter(Boolean) : []
    )
    setTechnologies(
      initial.technologies ? initial.technologies.split(',').map(t => t.trim()).filter(Boolean) : []
    )
    setStatus(initial.status || "")
    setRevenue(initial.revenue ? String(initial.revenue) : "")
    setMrr(initial.mrr ? String(initial.mrr) : "")
    setUsers(initial.users ? String(initial.users) : "")
    setActiveMetric(null)
  }, [open, initial])

  // Debounced metadata fetch on URL change
  useEffect(() => {
    if (!open) return
    if (!url || url.trim().length < 8) return
    const t = setTimeout(async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/extract-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() })
        })
        if (res.ok) {
          const { projectData, metadata } = await res.json()
          if (!name) setName(projectData?.name || metadata?.title || '')
          if (!description) setDescription(projectData?.description || metadata?.description || '')
          setLogo(projectData?.logo || metadata?.ogImage || logo || null)
        }
      } finally {
        setIsLoading(false)
      }
    }, 500)
    return () => clearTimeout(t)
  }, [url, open])

  const parseNumber = (value: string) => {
    if (!value.trim()) return null
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 0) return null
    return Math.round(parsed)
  }

  const handleSave = () => {
    onSave({
      id: initial.id,
      url,
      name,
      description,
      logo,
      category: categories.length > 0 ? categories.join(', ') : null,
      status: status || null,
      revenue: parseNumber(revenue),
      mrr: parseNumber(mrr),
      users: parseNumber(users),
      technologies: technologies.length > 0 ? technologies.join(', ') : null,
    })
    onOpenChange(false)
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
            <div className="text-xl font-bold">Edit project</div>
            <div className="text-xs text-gray-500">Update link, title, description and enhance your project</div>
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
              {/* Left: inputs */}
              <div className="space-y-3">
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="pl-9 h-11 rounded-lg" />
                  {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
                </div>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="h-11 rounded-lg" />
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="rounded-lg min-h-[120px]" />
              </div>

              {/* Right: preview + uploader */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border flex items-center justify-center bg-gray-50 overflow-hidden">
                    {logo ? (
                      <img src={logo} alt="preview" className="h-7 w-7 object-contain" />
                    ) : (
                      <span className="text-[10px] text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Preview (OG image)</div>
                </div>
                <div className="relative aspect-[16/9] w-full rounded-lg border bg-gray-50 overflow-hidden">
                  {logo ? (
                    <img src={logo} alt="preview" className="h-full w-full object-contain" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[11px] text-muted-foreground">No image — upload a screenshot</div>
                  )}
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      const reader = new FileReader()
                      reader.onload = () => setLogo(reader.result as string)
                      reader.readAsDataURL(f)
                    }} />
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
                  (metric.id === 'revenue' && revenue) ||
                  (metric.id === 'mrr' && mrr) ||
                  (metric.id === 'users' && users)

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
                            value={revenue}
                            onChange={(e) => setRevenue(e.target.value)}
                            placeholder="e.g. 50000"
                            className="h-10 rounded-lg"
                            autoFocus
                          />
                        )}
                        {metric.id === 'mrr' && (
                          <Input
                            type="number"
                            min={0}
                            value={mrr}
                            onChange={(e) => setMrr(e.target.value)}
                            placeholder="e.g. 4500"
                            className="h-10 rounded-lg"
                            autoFocus
                          />
                        )}
                        {metric.id === 'users' && (
                          <Input
                            type="number"
                            min={0}
                            value={users}
                            onChange={(e) => setUsers(e.target.value)}
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
          <Button variant="secondary" onClick={() => onOpenChange(false)} className="rounded-lg">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !name.trim() || !url.trim()}
            className="bg-black text-white rounded-lg disabled:opacity-60"
          >
            Save Changes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full h-full max-w-6xl max-h-[90vh] rounded-xl shadow-2xl border border-gray-600 bg-background flex flex-col overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}


