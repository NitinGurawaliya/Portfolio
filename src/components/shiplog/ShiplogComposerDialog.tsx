import { useEffect, useMemo, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Shiplog, ShiplogProjectOption } from "@/types/shiplog"

const MAX_CONTENT_LENGTH = 1200
const MAX_IMAGE_BYTES = 1_500_000

interface ShiplogComposerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (shiplog: Shiplog) => void
}

export function ShiplogComposerDialog({ open, onOpenChange, onCreated }: ShiplogComposerDialogProps) {
  const [content, setContent] = useState("")
  const [projects, setProjects] = useState<ShiplogProjectOption[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return

    let isMounted = true
    const loadProjects = async () => {
      setIsLoadingProjects(true)
      try {
        const response = await fetch("/api/shiplogs/projects", { cache: "no-store" })
        if (!response.ok) {
          throw new Error("Failed to load projects")
        }
        const data = await response.json()
        if (isMounted && Array.isArray(data.projects)) {
          setProjects(data.projects)
        }
      } catch (err) {
        console.error("❌ Shiplog composer: failed to load projects", err)
        if (isMounted) {
          setProjects([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingProjects(false)
        }
      }
    }

    void loadProjects()

    return () => {
      isMounted = false
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setContent("")
      setSelectedProjectId("")
      setImagePreview(null)
      setIsSubmitting(false)
      setError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [open])

  const charactersRemaining = MAX_CONTENT_LENGTH - content.length

  const canSubmit = useMemo(() => {
    return content.trim().length > 0 && !isSubmitting
  }, [content, isSubmitting])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setImagePreview(null)
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.")
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image is too large. Please choose one under 1.5MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/shiplogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          imageUrl: imagePreview,
          portfolioRepositoryId: selectedProjectId ? Number(selectedProjectId) : null,
        }),
      })

      if (response.status === 401) {
        setError("Please sign in to post a shiplog.")
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error ?? "Unable to create shiplog entry.")
        return
      }

      const data = await response.json()
      if (data?.shiplog) {
        onCreated(data.shiplog as Shiplog)
        onOpenChange(false)
      }
    } catch (err) {
      console.error("❌ Shiplog composer: submit failed", err)
      setError("Unexpected error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-6 rounded-2xl border border-border/60 bg-background/95 p-6 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-semibold">Create shiplog</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Share progress, attach a snapshot, and optionally link the project you&apos;re building.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label htmlFor="shiplog-content" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Update
            </Label>
            <Textarea
              id="shiplog-content"
              value={content}
              onChange={(event) => {
                if (event.target.value.length <= MAX_CONTENT_LENGTH) {
                  setContent(event.target.value)
                }
              }}
              placeholder="What did you ship or fix today?"
              className="min-h-[140px] resize-none rounded-xl border border-border/60 bg-background/70 text-sm focus-visible:ring-2 focus-visible:ring-primary"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{charactersRemaining} characters remaining</span>
              {error ? <span className="text-destructive">{error}</span> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shiplog-project" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Link project
              </Label>
              <div className="relative">
                <select
                  id="shiplog-project"
                  value={selectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  disabled={isLoadingProjects}
                  className="w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {isLoadingProjects ? (
                  <Badge variant="secondary" className="pointer-events-none absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px]">
                    Loading…
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Image</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" className="rounded-full px-4 text-xs" onClick={() => fileInputRef.current?.click()}>
                  Upload image
                </Button>
                <span className="text-[11px] text-muted-foreground">PNG, JPG up to 1.5MB</span>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative mt-2 overflow-hidden rounded-xl border border-border/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="max-h-48 w-full object-cover" />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="absolute right-2 top-2 h-7 rounded-full px-3 text-[11px]"
                    onClick={() => {
                      setImagePreview(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter className="flex w-full items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-4 text-sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "rounded-full px-4 text-sm font-semibold",
                canSubmit ? "bg-foreground text-background hover:bg-foreground/90" : "opacity-80"
              )}
            >
              {isSubmitting ? "Posting…" : "Post shiplog"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
