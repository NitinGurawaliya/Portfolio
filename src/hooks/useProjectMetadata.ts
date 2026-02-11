import { useCallback, useEffect, useState, type SyntheticEvent } from "react"
import { devLog } from "@/lib/logger"
import type { RepositoryLike } from "@/components/dashboard/projects/types"

interface UseProjectMetadataParams {
  open: boolean
  projectUrl: string
  setTitle: (value: string) => void
  setDescription: (value: string) => void
}

interface MetadataPayload {
  name?: string
  title?: string
  description?: string
  favicon?: string | null
  ogImage?: string | null
  logo?: string | null
}

interface ExtractMetadataResponse {
  projectData?: MetadataPayload
  metadata?: MetadataPayload
}

interface ResolvedImage {
  displayUrl: string
  directUrl: string
}

function generateGitHubOgImage(owner: string, repoName: string): { proxyUrl: string; directUrl: string } {
  const directUrl = `https://opengraph.githubassets.com/${owner}/${repoName}`
  const proxyUrl = `/api/portfolio/github-og-image?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repoName)}`
  return { proxyUrl, directUrl }
}

function parseGitHubRepoFromUrl(url: string): { owner: string; repoName: string } | null {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname !== "github.com") return null

    const pathParts = parsedUrl.pathname.split("/").filter(Boolean)
    if (pathParts.length < 2) return null

    return { owner: pathParts[0], repoName: pathParts[1] }
  } catch {
    return null
  }
}

function isGitHubUrl(url: string): boolean {
  return url.includes("github.com")
}

function isSvgDataUri(url: string): boolean {
  return url.startsWith("data:image/svg") || url.startsWith("data:image/svg+xml")
}

function isLongDataUri(url: string): boolean {
  return url.startsWith("data:") && url.length > 50000
}

function shouldUseProxy(url: string): boolean {
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) {
    return false
  }

  try {
    const parsedUrl = new URL(url)
    const currentHostname = typeof window !== "undefined" ? window.location.hostname : ""
    const isExternal =
      !parsedUrl.hostname.includes("localhost") &&
      !parsedUrl.hostname.includes("127.0.0.1") &&
      parsedUrl.hostname !== currentHostname
    return isExternal
  } catch {
    return false
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function getMetadataImage(metadata?: MetadataPayload, projectData?: MetadataPayload): ResolvedImage | null {
  const candidates = [metadata?.ogImage, metadata?.logo, projectData?.logo]

  for (const rawCandidate of candidates) {
    if (!rawCandidate) continue

    const candidate = rawCandidate.trim()
    if (!candidate) continue
    if (isSvgDataUri(candidate)) continue
    if (isLongDataUri(candidate)) continue

    if (shouldUseProxy(candidate)) {
      return {
        displayUrl: `/api/portfolio/og-image-proxy?url=${encodeURIComponent(candidate)}`,
        directUrl: candidate,
      }
    }

    return {
      displayUrl: candidate,
      directUrl: candidate,
    }
  }

  return null
}

function getGitHubImageFromRepository(repo: RepositoryLike): { proxyUrl: string | null; directUrl: string | null } {
  if (repo.githubOgImage) {
    try {
      const parsedUrl = new URL(repo.githubOgImage)
      if (parsedUrl.hostname === "opengraph.githubassets.com") {
        const pathParts = parsedUrl.pathname.split("/").filter(Boolean)
        if (pathParts.length >= 2) {
          const generated = generateGitHubOgImage(pathParts[0], pathParts[1])
          return { proxyUrl: generated.proxyUrl, directUrl: repo.githubOgImage }
        }
      }
    } catch {
      // Ignore and continue.
    }
  }

  if (repo.fullName) {
    const [owner, repoName] = repo.fullName.split("/")
    if (owner && repoName) {
      const generated = generateGitHubOgImage(owner, repoName)
      return { proxyUrl: generated.proxyUrl, directUrl: generated.directUrl }
    }
  }

  if (repo.htmlUrl && !repo.isImported) {
    const parsed = parseGitHubRepoFromUrl(repo.htmlUrl)
    if (parsed) {
      const generated = generateGitHubOgImage(parsed.owner, parsed.repoName)
      return { proxyUrl: generated.proxyUrl, directUrl: generated.directUrl }
    }
  }

  return { proxyUrl: null, directUrl: null }
}

export function useProjectMetadata({ open, projectUrl, setTitle, setDescription }: UseProjectMetadataParams) {
  const [isLoading, setIsLoading] = useState(false)
  const [favicon, setFavicon] = useState<string | null>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const [directLogoUrl, setDirectLogoUrl] = useState<string | null>(null)
  const [isFromGitHubSelection, setIsFromGitHubSelection] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  const resetMetadata = useCallback(() => {
    setIsLoading(false)
    setFavicon(null)
    setLogo(null)
    setDirectLogoUrl(null)
    setIsFromGitHubSelection(false)
    setImageLoadError(false)
    setImageLoading(false)
  }, [])

  const captureScreenshot = useCallback(async (url: string, timeoutMs = 25000) => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch("/api/portfolio/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        devLog("Screenshot request failed", response.status, errorBody)
        return null
      }

      const data = (await response.json()) as { screenshot?: string }
      return data.screenshot || null
    } catch (error) {
      devLog("Screenshot request error", error)
      return null
    } finally {
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const normalizedUrl = projectUrl.trim()
    if (normalizedUrl.length < 8) return

    if (isGitHubUrl(normalizedUrl)) {
      if (isFromGitHubSelection) return

      const parsed = parseGitHubRepoFromUrl(normalizedUrl)
      if (!parsed) return

      const githubImage = generateGitHubOgImage(parsed.owner, parsed.repoName)
      setLogo(githubImage.proxyUrl)
      setDirectLogoUrl(githubImage.directUrl)
      setFavicon(null)
      setIsFromGitHubSelection(false)
      setImageLoadError(false)
      setImageLoading(true)
      return
    }

    const timer = window.setTimeout(async () => {
      try {
        setIsLoading(true)

        const response = await fetch("/api/extract-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizedUrl }),
        })

        if (!response.ok) {
          console.error("extract-metadata API returned error:", response.status, await response.text())
          return
        }

        const data = (await response.json()) as ExtractMetadataResponse
        const projectData = data.projectData
        const metadata = data.metadata

        setTitle(projectData?.name || metadata?.title || "")
        setDescription(projectData?.description || metadata?.description || "")
        setFavicon(projectData?.favicon || metadata?.favicon || null)

        setImageLoadError(false)
        setImageLoading(true)

        const metadataImage = getMetadataImage(metadata, projectData)
        let nextDisplayLogo = metadataImage?.displayUrl ?? null
        let nextDirectLogo = metadataImage?.directUrl ?? null

        if (!nextDisplayLogo) {
          const screenshot = await captureScreenshot(normalizedUrl)
          if (screenshot) {
            nextDisplayLogo = screenshot
            nextDirectLogo = screenshot
          }
        }

        setLogo(nextDisplayLogo)
        setDirectLogoUrl(nextDirectLogo)

        if (!nextDisplayLogo) {
          setImageLoadError(true)
          setImageLoading(false)
        }
      } catch (error) {
        devLog("Metadata fetch failed", error)
      } finally {
        setIsLoading(false)
      }
    }, 500)

    return () => window.clearTimeout(timer)
  }, [open, projectUrl, isFromGitHubSelection, setTitle, setDescription, captureScreenshot])

  const applyGitHubRepository = useCallback((repo: RepositoryLike) => {
    setFavicon(null)

    const githubImage = getGitHubImageFromRepository(repo)
    if (githubImage.proxyUrl) {
      setLogo(githubImage.proxyUrl)
      setDirectLogoUrl(githubImage.directUrl || githubImage.proxyUrl)
      setIsFromGitHubSelection(true)
      setImageLoadError(false)
      setImageLoading(true)
      return
    }

    setLogo(null)
    setDirectLogoUrl(null)
    setIsFromGitHubSelection(false)
    setImageLoadError(false)
    setImageLoading(false)
  }, [])

  const handleUploadImage = useCallback(async (file: File) => {
    const imageAsDataUri = await readFileAsDataUrl(file)
    if (!imageAsDataUri) return

    setLogo(imageAsDataUri)
    setDirectLogoUrl(imageAsDataUri)
    setImageLoadError(false)
    setImageLoading(false)
  }, [])

  const handleImageLoadStart = useCallback(() => {
    setImageLoading(true)
  }, [])

  const handleImageLoad = useCallback(
    async (event: SyntheticEvent<HTMLImageElement>) => {
      const target = event.currentTarget

      if (logo && logo.includes("/api/portfolio/github-og-image")) {
        try {
          const response = await fetch(logo, { method: "HEAD" })
          const actualOgImageUrl = response.headers.get("X-Actual-OG-Image-URL")
          if (actualOgImageUrl) {
            setDirectLogoUrl(actualOgImageUrl)
          }
        } catch {
          // Keep current URL when header fetch fails.
        }

        const width = target.naturalWidth
        const height = target.naturalHeight
        if (width > 0 && height > 0) {
          const aspectRatio = width / height
          const isSquare = Math.abs(aspectRatio - 1) < 0.15
          if (isSquare && width >= 600) {
            setImageLoadError(true)
            setImageLoading(false)
            return
          }
        }
      }

      setImageLoading(false)
      setImageLoadError(false)
    },
    [logo]
  )

  const handleImageError = useCallback(
    async (event: SyntheticEvent<HTMLImageElement>) => {
      const target = event.currentTarget
      const failedSrc = target.src
      const normalizedProjectUrl = projectUrl.trim()
      const canTryScreenshot = Boolean(normalizedProjectUrl) && !isGitHubUrl(normalizedProjectUrl)

      if (failedSrc.includes("/api/portfolio/og-image-proxy") || failedSrc.includes("/api/portfolio/github-og-image")) {
        try {
          const response = await fetch(failedSrc)
          if (!response.ok) {
            if (response.status === 404 && canTryScreenshot) {
              const screenshot = await captureScreenshot(normalizedProjectUrl, 20000)
              if (screenshot) {
                setLogo(screenshot)
                setDirectLogoUrl(screenshot)
                setImageLoadError(false)
                setImageLoading(true)
                return
              }
            }

            setImageLoading(false)
            setImageLoadError(true)
            return
          }

          const blob = await response.blob()
          target.src = URL.createObjectURL(blob)
          setImageLoading(true)
          return
        } catch (error) {
          devLog("Proxy image fetch failed", error)
          setImageLoading(false)
          setImageLoadError(true)
          return
        }
      }

      if (canTryScreenshot && !failedSrc.startsWith("data:")) {
        const screenshot = await captureScreenshot(normalizedProjectUrl, 20000)
        if (screenshot) {
          setLogo(screenshot)
          setDirectLogoUrl(screenshot)
          setImageLoadError(false)
          setImageLoading(true)
          return
        }
      }

      setImageLoading(false)
      setImageLoadError(true)
    },
    [projectUrl, captureScreenshot]
  )

  return {
    isLoading,
    favicon,
    logo,
    directLogoUrl,
    imageLoadError,
    imageLoading,
    resetMetadata,
    setIsFromGitHubSelection,
    applyGitHubRepository,
    handleUploadImage,
    handleImageLoadStart,
    handleImageLoad,
    handleImageError,
    captureScreenshot,
  }
}
