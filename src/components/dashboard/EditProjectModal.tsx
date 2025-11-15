"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Link as LinkIcon, Loader2 } from "lucide-react"

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
  }) => void
}

export function EditProjectModal({ open, onOpenChange, initial, onSave }: EditProjectModalProps) {
  const [url, setUrl] = useState(initial.url)
  const [name, setName] = useState(initial.name)
  const [description, setDescription] = useState(initial.description)
  const [logo, setLogo] = useState<string | null>(initial.logo || null)
  const [category, setCategory] = useState(initial.category || "")
  const [status, setStatus] = useState(initial.status || "")
  const [revenue, setRevenue] = useState(initial.revenue ? String(initial.revenue) : "")
  const [mrr, setMrr] = useState(initial.mrr ? String(initial.mrr) : "")
  const [users, setUsers] = useState(initial.users ? String(initial.users) : "")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setUrl(initial.url)
    setName(initial.name)
    setDescription(initial.description)
    setLogo(initial.logo || null)
    setCategory(initial.category || "")
    setStatus(initial.status || "")
    setRevenue(initial.revenue ? String(initial.revenue) : "")
    setMrr(initial.mrr ? String(initial.mrr) : "")
    setUsers(initial.users ? String(initial.users) : "")
  }, [open])

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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-[720px] max-w-full rounded-xl bg-white shadow-2xl border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <div className="text-xl font-bold">Edit project</div>
              <div className="text-xs text-gray-500">Update link, title, description or cover image. We’ll fetch metadata automatically.</div>
            </div>
          </div>

          {/* Body: same 2‑column layout as AddProjectModal */}
          <div className="p-6 grid grid-cols-2 gap-5">
            {/* Left: inputs */}
            <div className="space-y-3">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="pl-9 h-11 rounded-lg" />
                {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
              </div>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="h-11 rounded-lg" />
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="rounded-lg min-h-[120px]" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Category</Label>
                    <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. SaaS" className="h-11 rounded-lg" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Status</Label>
                    <Input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="e.g. Live" className="h-11 rounded-lg" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Annual revenue ($)</Label>
                    <Input type="number" min={0} value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="e.g. 50000" className="h-11 rounded-lg" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">MRR ($)</Label>
                    <Input type="number" min={0} value={mrr} onChange={(e) => setMrr(e.target.value)} placeholder="e.g. 4500" className="h-11 rounded-lg" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Active users</Label>
                    <Input type="number" min={0} value={users} onChange={(e) => setUsers(e.target.value)} placeholder="e.g. 1200" className="h-11 rounded-lg" />
                  </div>
                </div>
            </div>

            {/* Right: favicon/preview + uploader */}
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Preview (OG image)</div>
              <div className="relative aspect-[16/9] w-full rounded-lg border bg-gray-50 overflow-hidden">
                {logo ? (
                  <img src={logo} alt="preview" className="h-full w-full object-contain" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[11px] text-red-600">No image — paste a URL or upload</div>
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

          {/* Footer */}
          <div className="px-6 pb-5 flex items-center justify-end gap-2">
            <div className="mr-auto text-xs text-gray-500">{isLoading ? 'Fetching metadata…' : ' '}</div>
            <Button variant="secondary" onClick={() => onOpenChange(false)} className="rounded-lg">Cancel</Button>
              <Button
                onClick={() => {
                  onSave({
                    id: initial.id,
                    url,
                    name,
                    description,
                    logo,
                    category: category || null,
                    status: status || null,
                    revenue: parseNumber(revenue),
                    mrr: parseNumber(mrr),
                    users: parseNumber(users),
                  })
                  onOpenChange(false)
                }}
                disabled={isLoading || !name.trim() || !url.trim()}
                className="bg-black text-white rounded-lg disabled:opacity-60"
              >
                Save changes
              </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


