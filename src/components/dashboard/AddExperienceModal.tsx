"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Link as LinkIcon, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface AddExperienceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onAdded?: (exp: any) => void
}

export function AddExperienceModal({ open, onOpenChange, userId, onAdded }: AddExperienceModalProps) {
  const [companyUrl, setCompanyUrl] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [role, setRole] = useState("")
  const [duration, setDuration] = useState("")
  const [description, setDescription] = useState("")
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [isCurrent, setIsCurrent] = useState<boolean>(false)

  useEffect(() => {
    if (!open) return
    if (!companyUrl || companyUrl.trim().length < 8) return
    const t = setTimeout(async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/extract-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: companyUrl.trim() })
        })
        if (res.ok) {
          const { metadata } = await res.json()
          setFaviconUrl(metadata?.favicon || null)
          if (!companyName) setCompanyName(metadata?.siteName || metadata?.title || companyName)
        }
      } finally {
        setIsLoading(false)
      }
    }, 500)
    return () => clearTimeout(t)
  }, [companyUrl, open])

  const handleSave = async () => {
    if (!companyName.trim()) return
    setIsSaving(true)
    try {
      const formatMonth = (iso: string) => new Date(iso).toLocaleString(undefined, { month: 'short', year: 'numeric' })
      const computedDuration = startDate
        ? `${formatMonth(startDate)} - ${isCurrent ? 'Present' : (endDate ? formatMonth(endDate) : '')}`.trim()
        : duration.trim()
      const payload = {
        companyName: companyName.trim(),
        companyUrl: companyUrl.trim() || null,
        faviconUrl,
        role: role.trim() || null,
        duration: (computedDuration || null) as any,
        description: description.trim() || null,
      }
      onAdded?.(payload)
      // reset fields
      setCompanyUrl("")
      setCompanyName("")
      setRole("")
      setDuration("")
      setDescription("")
      setFaviconUrl(null)
      setStartDate("")
      setEndDate("")
      setIsCurrent(false)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-[720px] max-w-full rounded-xl shadow-2xl border border-gray-200 bg-background">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <div className="text-xl text-black font-bold dark:text-white">Add experience</div>
              <div className="text-xs text-gray-500">Enter company, role, duration and description. We’ll auto‑fetch favicon from the URL.</div>
            </div>
          </div>

          {/* Body: two column layout similar to AddProjectModal */}
          <div className="p-6 grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="companyUrl" className="text-black text-sm font-medium dark:text-white">Company URL</Label>
                <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="companyUrl" value={companyUrl} onChange={e => setCompanyUrl(e.target.value)} placeholder="https://company.com" className="pl-9 h-11 rounded-lg bg-white text-black placeholder:text-gray-500 border-gray-300" />
                {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-black text-sm font-medium dark:text-white">Company Name</Label>
                <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name" className="h-11 rounded-lg bg-white text-black placeholder:text-gray-500 border-gray-300" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-black text-sm font-medium dark:text-white">Role</Label>
                <Input id="role" value={role} onChange={e => setRole(e.target.value)} placeholder="Role (e.g., SDE, SDE 2)" className="h-11 rounded-lg bg-white text-black placeholder:text-gray-500 border-gray-300" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-black text-sm font-medium dark:text-white">Start date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-11 rounded-lg bg-white text-black placeholder:text-gray-500 border-gray-300" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endDate" className="text-black text-sm font-medium dark:text-white">End date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={isCurrent} className="h-11 rounded-lg bg-gray-50 text-black placeholder:text-gray-500 border-gray-300 disabled:bg-gray-100" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="isCurrent" className="border-black" checked={isCurrent} onCheckedChange={(val) => setIsCurrent(Boolean(val))} />
                <Label htmlFor="isCurrent" className="text-sm text-black dark:text-white">Currently working here</Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-700 dark:text-gray-400">Favicon preview</div>
              <div className="h-28 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden bg-background">
                {faviconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={faviconUrl} alt="favicon" className="h-14 w-14" />
                ) : (
                  <div className="text-gray-500 text-xs">No favicon</div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-black text-sm font-medium dark:text-white">Description</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What did you do?" className="rounded-lg min-h-[100px] bg-white text-black placeholder:text-gray-500 border-gray-300" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)} className="rounded-lg">Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving || !companyName.trim()} className="rounded-lg">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


