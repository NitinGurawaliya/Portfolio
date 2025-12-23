import { useCallback, useMemo, useState } from "react"

type ResumeTone = "info" | "success" | "error"

export type ResumeStatus = {
  message: string
  tone: ResumeTone
}

type UseDashboardResumeArgs = {
  enabled: boolean
  displayName?: string
  fallbackName?: string
  fallbackSlug?: string
}

type UseDashboardResumeResult = {
  canDownload: boolean
  isGenerating: boolean
  status: ResumeStatus
  download: () => Promise<void>
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function useDashboardResume({
  enabled,
  displayName,
  fallbackName,
  fallbackSlug,
}: UseDashboardResumeArgs): UseDashboardResumeResult {
  const canDownload = enabled
  const [status, setStatus] = useState<ResumeStatus>({ message: "", tone: "info" })
  const [isGenerating, setIsGenerating] = useState(false)

  const filenameSlug = useMemo(() => {
    const base = displayName || fallbackName || fallbackSlug || "devfolio"
    const slug = slugify(base)
    return slug || "devfolio"
  }, [displayName, fallbackName, fallbackSlug])

  const download = useCallback(async () => {
    if (!canDownload) {
      setStatus({
        message: "Complete at least 90% of your profile to unlock the ATS resume.",
        tone: "info",
      })
      return
    }
    if (isGenerating) return

    setIsGenerating(true)
    setStatus({
      message: "Generating your ATS-ready PDF…",
      tone: "info",
    })

    try {
      const response = await fetch("/api/resume", { method: "GET" })
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to generate resume.")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${filenameSlug}-resume.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setStatus({
        message: "ATS resume download started.",
        tone: "success",
      })
    } catch (error: any) {
      setStatus({
        message: error?.message || "Failed to download resume.",
        tone: "error",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [canDownload, filenameSlug, isGenerating])

  return { canDownload, isGenerating, status, download }
}

