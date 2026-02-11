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

export interface RepositoryLike {
  id: number
  name: string
  fullName?: string
  description: string
  htmlUrl: string
  language?: string
  languages?: string[] // Add languages array for tech stack
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
  githubOgImage?: string | null // GitHub OG image URL
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
  selectedRepos?: number[] // Add selectedRepos to filter out already added repos
  onAddImportedProject: (project: RepositoryLike) => void
  onCaptureInsights?: (repoId: number, insights: ProjectInsightsPayload) => void
}

const CATEGORY_OPTIONS = ["SaaS", "AI/ML", "Developer Tool", "Marketing", "E-commerce", "Open Source", "Consumer", "Community"]
const STATUS_OPTIONS = ["Building", "Live", "On Hold", "Sunsetting", "Idea"]

export function AddProjectModal({ open, onOpenChange, repositories, selectedRepos = [], onAddImportedProject, onCaptureInsights }: AddProjectModalProps) {
  const [projectUrl, setProjectUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [favicon, setFavicon] = useState<string | null>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const [directLogoUrl, setDirectLogoUrl] = useState<string | null>(null) // Store direct GitHub URL for saving
  const [isFromGitHubSelection, setIsFromGitHubSelection] = useState(false) // Track if logo was set from GitHub selection
  const [imageLoadError, setImageLoadError] = useState(false) // Track if image failed to load
  const [imageLoading, setImageLoading] = useState(false) // Track if image is loading
  const [categories, setCategories] = useState<string[]>([])
  const [status, setStatus] = useState("")
  const [revenueInput, setRevenueInput] = useState("")
  const [mrrInput, setMrrInput] = useState("")
  const [usersInput, setUsersInput] = useState("")
  const [technologies, setTechnologies] = useState<string[]>([])
  const [activeMetric, setActiveMetric] = useState<string | null>(null)

  // Helper function to generate GitHub OG image URL
  // Use proxy API to avoid rate limiting and CORS issues
  const generateGitHubOgImage = (owner: string, repoName: string): { proxyUrl: string, directUrl: string } => {
    const directUrl = `https://opengraph.githubassets.com/${owner}/${repoName}`
    const proxyUrl = `/api/portfolio/github-og-image?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repoName)}`
    return { proxyUrl, directUrl }
  }

  // Simple debounce for URL metadata fetch
  useEffect(() => {
    if (!open) return
    if (!projectUrl || projectUrl.trim().length < 8) return
    
    // For GitHub URLs, generate OG image immediately
    // But don't override if logo was already set from GitHub selection
    if (projectUrl.includes('github.com')) {
      // If logo was already set from GitHub selection, don't override it
      if (isFromGitHubSelection && logo) {
        return
      }
      
      try {
        const url = new URL(projectUrl)
        if (url.hostname === 'github.com') {
          const pathParts = url.pathname.split('/').filter(Boolean)
          if (pathParts.length >= 2) {
            const owner = pathParts[0]
            const repoName = pathParts[1]
            // Use proxy API to avoid rate limiting
            const { proxyUrl, directUrl } = generateGitHubOgImage(owner, repoName)
            setLogo(proxyUrl) // Use proxy URL (handles rate limiting better)
            setDirectLogoUrl(directUrl) // Store direct URL for saving
            setFavicon(null) // Don't use GitHub favicon
            setIsFromGitHubSelection(false) // This is from URL change, not GitHub selection
            setImageLoadError(false) // Reset error state
            setImageLoading(true) // Set loading state
          }
        }
      } catch (e) {
        // Ignore URL parsing errors
      }
      return // Don't fetch metadata for GitHub URLs
    }
    
    const handler = setTimeout(async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/extract-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: projectUrl.trim() })
        })
        if (res.ok) {
          const responseData = await res.json()
          
          // Log the FULL response for debugging
          console.log('📥 Frontend: FULL response from extract-metadata:', JSON.stringify(responseData, null, 2))
          
          const { projectData, metadata } = responseData
          
          // Log received data for debugging - check ALL possible paths
          console.log('📥 Frontend: Parsed data structure:', {
            hasMetadata: !!metadata,
            hasProjectData: !!projectData,
            metadataType: typeof metadata,
            projectDataType: typeof projectData,
            metadataKeys: metadata ? Object.keys(metadata) : [],
            projectDataKeys: projectData ? Object.keys(projectData) : [],
            metadataOgImage: metadata?.ogImage,
            metadataOgImageType: typeof metadata?.ogImage,
            projectDataLogo: projectData?.logo,
            projectDataLogoType: typeof projectData?.logo,
            metadataTitle: metadata?.title,
            projectDataName: projectData?.name
          })
          
          // Always update title and description when URL changes (not just when empty)
          // This ensures that changing URL updates the metadata
          const newTitle = projectData?.name || metadata?.title || ""
          const newDescription = projectData?.description || metadata?.description || ""
          setTitle(newTitle)
          setDescription(newDescription)
          setFavicon(projectData?.favicon || metadata?.favicon || null)
          
          console.log('📝 Frontend: Updated title and description:', { newTitle, newDescription: newDescription.substring(0, 50) })
          
          // Priority: 1. OG image (from metadata), 2. Logo (from projectData, which might be OG image), 3. Screenshot (only if OG image not found)
          // Check metadata.ogImage first, then projectData.logo (which should be OG image if available)
          let imageToUse: string | null = null
          
          // Reset error states when setting new image
          setImageLoadError(false)
          setImageLoading(true)
          
          // Log for debugging - check each path carefully
          console.log('🔍 Frontend: Checking for OG image...')
          console.log('  - metadata?.ogImage:', metadata?.ogImage)
          console.log('  - projectData?.logo:', projectData?.logo)
          console.log('  - metadata?.logo:', metadata?.logo)
          
          // Helper function to determine if we should use proxy
          const shouldUseProxy = (url: string): boolean => {
            if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
              return false // Don't proxy data URIs or blob URLs
            }
            // Check if it's an external URL (not from localhost or our domain)
            try {
              const urlObj = new URL(url)
              const isExternal = !urlObj.hostname.includes('localhost') && 
                                 !urlObj.hostname.includes('127.0.0.1') &&
                                 urlObj.hostname !== window.location.hostname
              return isExternal
            } catch {
              // If URL parsing fails, assume it's relative and don't proxy
              return false
            }
          }

          if (metadata?.ogImage) {
            console.log('✅ Frontend: OG image found in metadata.ogImage:', metadata.ogImage)
            // Use proxy API for all external URLs to avoid CORS issues
            if (shouldUseProxy(metadata.ogImage)) {
              imageToUse = `/api/portfolio/og-image-proxy?url=${encodeURIComponent(metadata.ogImage)}`
              console.log('🔗 Frontend: Using proxy URL for OG image:', imageToUse)
            } else {
              imageToUse = metadata.ogImage
              console.log('📍 Frontend: Using direct URL (local/internal):', imageToUse)
            }
          } else if (metadata?.logo && !metadata.logo.startsWith('data:image/svg')) {
            // Check if it's a suspiciously long base64 string (might be corrupted or invalid)
            const isLongBase64 = metadata.logo.startsWith('data:') && metadata.logo.length > 50000
            if (isLongBase64) {
              console.log('⚠️ Frontend: metadata.logo is suspiciously long base64, skipping and will try screenshot')
              // Don't set imageToUse, let it fall through to screenshot
            } else {
              console.log('✅ Frontend: OG image found in metadata.logo')
              // Use proxy API for all external URLs to avoid CORS issues
              if (shouldUseProxy(metadata.logo)) {
                imageToUse = `/api/portfolio/og-image-proxy?url=${encodeURIComponent(metadata.logo)}`
                console.log('🔗 Frontend: Using proxy URL for metadata.logo')
              } else {
                imageToUse = metadata.logo
                console.log('📍 Frontend: Using direct URL (local/internal)')
              }
            }
          } else if (projectData?.logo && !projectData.logo.startsWith('data:image/svg')) {
            // Check if it's a suspiciously long base64 string (might be corrupted or invalid)
            const isLongBase64 = projectData.logo.startsWith('data:') && projectData.logo.length > 50000
            if (isLongBase64) {
              console.log('⚠️ Frontend: projectData.logo is suspiciously long base64, skipping and will try screenshot')
              // Don't set imageToUse, let it fall through to screenshot
            } else {
              console.log('✅ Frontend: Using logo from projectData.logo')
              // Use proxy API for all external URLs to avoid CORS issues
              if (shouldUseProxy(projectData.logo)) {
                imageToUse = `/api/portfolio/og-image-proxy?url=${encodeURIComponent(projectData.logo)}`
                console.log('🔗 Frontend: Using proxy URL for projectData.logo')
              } else {
                imageToUse = projectData.logo
                console.log('📍 Frontend: Using direct URL (local/internal)')
              }
            }
          } else {
            console.log('⚠️ Frontend: No OG image found in any location, will try screenshot if needed')
            console.log('  - metadata?.ogImage:', metadata?.ogImage ? 'EXISTS' : 'NULL')
            console.log('  - metadata?.logo:', metadata?.logo ? (metadata.logo.length > 100 ? metadata.logo.substring(0, 50) + '...' : metadata.logo) : 'NULL')
            console.log('  - projectData?.logo:', projectData?.logo ? (projectData.logo.length > 100 ? projectData.logo.substring(0, 50) + '...' : projectData.logo) : 'NULL')
          }
          
          // Only try screenshot if OG image is not available
          // Check if imageToUse is null or if it's a generated SVG logo (which means no real OG image)
          // Also check original logo values for long base64 strings (they might have been skipped)
          const isGeneratedLogo = imageToUse?.startsWith('data:image/svg') || 
                                  imageToUse?.startsWith('data:image/svg+xml')
          
          // Check original logo values for long base64 (they might have been skipped above)
          const metadataLogoIsLong = metadata?.logo?.startsWith('data:') && metadata.logo.length > 50000
          const projectDataLogoIsLong = projectData?.logo?.startsWith('data:') && projectData.logo.length > 50000
          const hasLongBase64Logo = metadataLogoIsLong || projectDataLogoIsLong
          
          // Also check if imageToUse itself is a long base64
          const imageToUseIsLong = imageToUse?.startsWith('data:') && imageToUse.length > 50000
          
          const needsScreenshot = (!imageToUse || isGeneratedLogo || hasLongBase64Logo || imageToUseIsLong) && projectUrl && !projectUrl.includes('github.com')
          
          console.log('📸 Frontend: Screenshot decision:', {
            imageToUse: imageToUse ? (imageToUse.substring(0, 50) + '...') : 'NULL',
            imageToUseLength: imageToUse?.length,
            isGeneratedLogo,
            metadataLogoIsLong,
            projectDataLogoIsLong,
            hasLongBase64Logo,
            imageToUseIsLong,
            needsScreenshot,
            projectUrl,
            isGitHub: projectUrl?.includes('github.com')
          })
          
          if (needsScreenshot) {
            console.log('📸 Frontend: No OG image found (or only generated logo), attempting screenshot...')
            try {
              const screenshotRes = await fetch('/api/portfolio/screenshot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: projectUrl.trim() }),
                signal: AbortSignal.timeout(25000) // 25 second timeout
              })
              
              if (screenshotRes.ok) {
                const screenshotData = await screenshotRes.json()
                console.log('📸 Frontend: Screenshot API response:', {
                  success: screenshotData.success,
                  hasScreenshot: !!screenshotData.screenshot,
                  screenshotLength: screenshotData.screenshot?.length
                })
                
                if (screenshotData.screenshot) {
                  imageToUse = screenshotData.screenshot
                  console.log('✅ Frontend: Screenshot captured successfully, length:', screenshotData.screenshot.length)
                } else {
                  console.log('⚠️ Frontend: Screenshot API returned OK but no screenshot data')
                }
              } else {
                const errorData = await screenshotRes.json().catch(() => ({}))
                console.log('❌ Frontend: Screenshot API returned error:', screenshotRes.status, errorData)
              }
            } catch (screenshotError: any) {
              // Fall through - no image available
              console.log('❌ Frontend: Screenshot not available:', {
                message: screenshotError.message,
                name: screenshotError.name,
                isTimeout: screenshotError.name === 'AbortError'
              })
            }
          }
          
          // Set the logo and reset error state
          console.log('🖼️ Frontend: Setting logo to:', {
            imageToUse: imageToUse ? (imageToUse.substring(0, 100) + '...') : null,
            imageToUseType: typeof imageToUse,
            imageToUseLength: imageToUse?.length,
            isDataUri: imageToUse?.startsWith('data:'),
            isProxy: imageToUse?.includes('/api/portfolio/og-image-proxy')
          })
          
          // Store the direct URL (original OG image URL) for saving to database
          // If we're using a proxy, extract the original URL
          let directUrl = imageToUse
          if (imageToUse && imageToUse.includes('/api/portfolio/og-image-proxy?url=')) {
            try {
              const urlParams = new URLSearchParams(imageToUse.split('?')[1])
              directUrl = decodeURIComponent(urlParams.get('url') || imageToUse)
              console.log('💾 Frontend: Extracted direct URL for saving:', directUrl)
            } catch (e) {
              // If parsing fails, use the original
              directUrl = metadata?.ogImage || metadata?.logo || projectData?.logo || imageToUse
            }
          } else if (imageToUse?.startsWith('data:')) {
            // If it's a data URI (screenshot), use it directly for saving
            directUrl = imageToUse
            console.log('💾 Frontend: Using data URI (screenshot) for saving')
          } else {
            // If not using proxy, use the image URL directly
            directUrl = metadata?.ogImage || metadata?.logo || projectData?.logo || imageToUse
          }
          
          setLogo(imageToUse) // Use proxy URL or screenshot for display
          setDirectLogoUrl(directUrl) // Store direct URL or screenshot for saving to database
          
          // If no image found at all, set error state
          if (!imageToUse) {
            console.log('❌ Frontend: No image found, setting error state')
            setImageLoadError(true)
            setImageLoading(false)
          } else {
            console.log('✅ Frontend: Image set successfully, waiting for load...')
            // Reset error state when setting image
            setImageLoadError(false)
            setImageLoading(true)
          }
        } else {
          console.error('❌ Frontend: extract-metadata API returned error:', res.status, await res.text())
        }
      } catch (e) {
        // ignore
      } finally {
        setIsLoading(false)
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [projectUrl, open, isFromGitHubSelection]) // Removed title and description from dependencies to allow updates when URL changes

  // Filter out already selected repos
  const filteredRepos = useMemo(() => {
    return repositories.filter(repo => !selectedRepos.includes(repo.id))
  }, [repositories, selectedRepos])

  const handleAddByGithub = async (repo: RepositoryLike) => {
    // Populate form fields with GitHub repo data
    // Use just the repo name, not "GitHub - owner/repo"
    setTitle(repo.name || "")
    
    // Only set description if it's not GitHub's default description
    const githubDefaultDescPattern = /^Contribute to .* development by creating an account on GitHub\.?$/i
    if (repo.description && !githubDefaultDescPattern.test(repo.description.trim())) {
      setDescription(repo.description)
    } else {
      setDescription("") // Clear GitHub's default description
    }
    
    // Don't use GitHub favicon - use null so fallback text is shown
    setFavicon(null)
    
    // Fetch GitHub OG image strictly for this repo
    // Priority: 1. githubOgImage field, 2. Generate from fullName, 3. Extract from htmlUrl
    let githubOgImageProxy: string | null = null
    let githubOgImageDirect: string | null = null
    
    // First, try to use githubOgImage if available
    if (repo.githubOgImage) {
      githubOgImageDirect = repo.githubOgImage
      // Generate proxy URL from the direct URL
      try {
        const url = new URL(repo.githubOgImage)
        if (url.hostname === 'opengraph.githubassets.com') {
          const pathParts = url.pathname.split('/').filter(Boolean)
          if (pathParts.length >= 2) {
            const { proxyUrl } = generateGitHubOgImage(pathParts[0], pathParts[1])
            githubOgImageProxy = proxyUrl
          }
        }
      } catch (e) {
        // If parsing fails, try to extract from fullName
        if (repo.fullName) {
          const [owner, repoName] = repo.fullName.split('/')
          if (owner && repoName) {
            const { proxyUrl } = generateGitHubOgImage(owner, repoName)
            githubOgImageProxy = proxyUrl
          }
        }
      }
    } 
    // If not, try to generate from fullName
    else if (repo.fullName) {
      const [owner, repoName] = repo.fullName.split('/')
      if (owner && repoName) {
        const { proxyUrl, directUrl } = generateGitHubOgImage(owner, repoName)
        githubOgImageProxy = proxyUrl
        githubOgImageDirect = directUrl
      }
    }
    // If still not available, try to extract from htmlUrl
    else if (repo.htmlUrl && !repo.isImported) {
      try {
        const url = new URL(repo.htmlUrl)
        if (url.hostname === 'github.com') {
          const pathParts = url.pathname.split('/').filter(Boolean)
          if (pathParts.length >= 2) {
            const owner = pathParts[0]
            const repoName = pathParts[1]
            const { proxyUrl, directUrl } = generateGitHubOgImage(owner, repoName)
            githubOgImageProxy = proxyUrl
            githubOgImageDirect = directUrl
          }
        }
      } catch (e) {
        // Ignore URL parsing errors
      }
    }
    
    // Always set the GitHub OG image - use proxy URL to avoid rate limiting
    if (githubOgImageProxy) {
      setLogo(githubOgImageProxy) // Use proxy URL (handles rate limiting better)
      setDirectLogoUrl(githubOgImageDirect || githubOgImageProxy) // Store direct URL for saving
      setIsFromGitHubSelection(true) // Mark that logo was set from GitHub selection
      setImageLoadError(false) // Reset error state when setting new image
      setImageLoading(true) // Set loading state
    } else {
      // If we can't generate OG image, clear logo (don't use GitHub icon)
      setLogo(null)
      setDirectLogoUrl(null)
      setIsFromGitHubSelection(false)
      setImageLoadError(false)
      setImageLoading(false)
    }
    
    // Set URL after setting logo to prevent useEffect from overriding
    setProjectUrl(repo.htmlUrl || "")
    
    // Pre-populate tech stack from repo languages if available
    if (repo.languages && Array.isArray(repo.languages) && repo.languages.length > 0) {
      setTechnologies(repo.languages)
    } else if (repo.language) {
      setTechnologies([repo.language])
    }
    
    // Don't close the modal - let user edit details
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
    setDirectLogoUrl(null)
    setIsFromGitHubSelection(false)
    setImageLoadError(false)
    setImageLoading(false)
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
    } else {
      // Reset the flag when modal opens (user might select different repo)
      setIsFromGitHubSelection(false)
    }
  }, [open])

  const handleDone = async () => {
    if (!title.trim() || !projectUrl.trim()) return
    
    // Priority: 1. OG image/Logo (if available), 2. Screenshot (only if OG image not found)
    // Use directLogoUrl if available (for GitHub repos), otherwise use logo
    let finalLogo = directLogoUrl || logo
    
    // Only try screenshot if we don't have an OG image/logo and it's a deployed URL (not GitHub)
    if (!finalLogo && projectUrl && !projectUrl.includes('github.com')) {
      try {
        const screenshotRes = await fetch('/api/portfolio/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: projectUrl.trim() }),
        })
        
        if (screenshotRes.ok) {
          const screenshotData = await screenshotRes.json()
          if (screenshotData.screenshot) {
            finalLogo = screenshotData.screenshot
          }
        }
      } catch (error) {
        // Fall through - no image available
        console.error('Screenshot capture failed:', error)
      }
    }
    
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
      logo: finalLogo || undefined, // Use screenshot if captured, otherwise OG image/logo
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
                    <>
                      {!imageLoadError && (
                        <img 
                          src={logo} 
                          alt="preview" 
                          className="h-full w-full object-contain" 
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onLoadStart={() => setImageLoading(true)}
                          onLoad={async (e) => {
                            const target = e.currentTarget as HTMLImageElement
                            
                            // If this is a proxy API image, try to get the actual OG image URL from headers
                            if (logo && logo.includes('/api/portfolio/github-og-image')) {
                              try {
                                // Fetch the image again to get headers (or use the response if available)
                                const response = await fetch(logo, { method: 'HEAD' })
                                const actualOgImageUrl = response.headers.get('X-Actual-OG-Image-URL')
                                if (actualOgImageUrl) {
                                  // Update directLogoUrl with the actual OG image URL found by the API
                                  setDirectLogoUrl(actualOgImageUrl)
                                }
                              } catch (err) {
                                // Ignore errors, use existing directLogoUrl
                              }
                              
                              // Check image dimensions - default GitHub OG images with just Octocat
                              // are typically square or have specific dimensions
                              // Real repo OG images are usually 1200x630 (16:9 aspect ratio)
                              const width = target.naturalWidth
                              const height = target.naturalHeight
                              
                              if (width > 0 && height > 0) {
                                const aspectRatio = width / height
                                const isSquare = Math.abs(aspectRatio - 1) < 0.15 // Within 15% of 1:1
                                
                                // Default GitHub logo OG images are often square (1:1) or close to square
                                // Real repo OG images are landscape (16:9, ~1.9:1)
                                // If it's square or close to square, it's likely the default logo
                                if (isSquare && width >= 600) {
                                  // This is likely the default GitHub logo, not a real repo OG image
                                  setImageLoadError(true)
                                  setImageLoading(false)
                                  return
                                }
                              }
                            }
                            
                            setImageLoading(false)
                            setImageLoadError(false)
                          }}
                          onError={async (e) => {
                            const target = e.currentTarget as HTMLImageElement
                            const failedSrc = target.src
                            
                            console.log('❌ Frontend: Image failed to load:', failedSrc)
                            
                            // Check if this is a proxy API error
                            if (target.src.includes('/api/portfolio/og-image-proxy') || target.src.includes('/api/portfolio/github-og-image')) {
                              // Try to fetch and check the response
                              try {
                                const res = await fetch(target.src)
                                if (!res.ok) {
                                  // Proxy returned error (404, 500, etc.)
                                  console.log('❌ Frontend: Proxy API returned error:', res.status)
                                  
                                  // If proxy failed (404), try screenshot as fallback
                                  if (res.status === 404 && projectUrl && !projectUrl.includes('github.com')) {
                                    console.log('📸 Frontend: Proxy returned 404, trying screenshot fallback...')
                                    try {
                                      const screenshotRes = await fetch('/api/portfolio/screenshot', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ url: projectUrl.trim() }),
                                        signal: AbortSignal.timeout(20000) // 20 second timeout for frontend
                                      })
                                      
                                      if (screenshotRes.ok) {
                                        const screenshotData = await screenshotRes.json()
                                        if (screenshotData.screenshot) {
                                          setLogo(screenshotData.screenshot)
                                          setDirectLogoUrl(screenshotData.screenshot)
                                          setImageLoadError(false)
                                          setImageLoading(true)
                                          console.log('✅ Frontend: Screenshot fallback successful')
                                          return
                                        }
                                      } else {
                                        const errorData = await screenshotRes.json().catch(() => ({}))
                                        console.log('❌ Frontend: Screenshot API returned error:', screenshotRes.status, errorData)
                                        if (screenshotRes.status === 504 || errorData.isTimeout) {
                                          console.log('⏱️ Frontend: Screenshot service timed out')
                                        }
                                      }
                                    } catch (screenshotError: any) {
                                      console.log('❌ Frontend: Screenshot fallback failed:', {
                                        message: screenshotError.message,
                                        name: screenshotError.name,
                                        isTimeout: screenshotError.name === 'AbortError'
                                      })
                                    }
                                  }
                                  
                                  setImageLoading(false)
                                  setImageLoadError(true)
                                } else {
                                  // If response is OK, try loading as image
                                  const blob = await res.blob()
                                  const blobUrl = URL.createObjectURL(blob)
                                  target.src = blobUrl
                                  setImageLoading(true)
                                }
                              } catch (err) {
                                console.log('❌ Frontend: Error fetching from proxy:', err)
                                setImageLoading(false)
                                setImageLoadError(true)
                              }
                            } else {
                              // Direct URL failed - this might be a CORS issue
                              // Try screenshot as fallback if it's not a GitHub URL
                              console.log('❌ Frontend: Direct OG image URL failed to load (likely CORS issue):', failedSrc)
                              
                              if (projectUrl && !projectUrl.includes('github.com') && !failedSrc.includes('data:')) {
                                console.log('📸 Frontend: Trying screenshot fallback...')
                                try {
                                  const screenshotRes = await fetch('/api/portfolio/screenshot', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ url: projectUrl.trim() }),
                                  })
                                  
                                  if (screenshotRes.ok) {
                                    const screenshotData = await screenshotRes.json()
                                    if (screenshotData.screenshot) {
                                      setLogo(screenshotData.screenshot)
                                      setDirectLogoUrl(screenshotData.screenshot)
                                      setImageLoadError(false)
                                      setImageLoading(true)
                                      console.log('✅ Frontend: Screenshot fallback successful')
                                      return
                                    }
                                  }
                                } catch (screenshotError) {
                                  console.log('❌ Frontend: Screenshot fallback also failed:', screenshotError)
                                }
                              }
                              
                              // Show error - OG image exists but can't be loaded
                              setImageLoading(false)
                              setImageLoadError(true)
                            }
                          }}
                        />
                      )}
                      {imageLoading && !imageLoadError && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      )}
                      {imageLoadError && (
                        <div className="h-full w-full flex flex-col items-center justify-center text-[11px] text-muted-foreground bg-gray-50 p-4">
                          <p className="mb-2 font-medium">OG Image Not Available</p>
                          <p className="text-[10px] text-gray-400 text-center mb-3">
                            This repository doesn't have a custom OG image. GitHub is showing the default logo.
                          </p>
                          <label className="inline-flex items-center gap-2 text-[10px] text-blue-600 hover:text-blue-700 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  setLogo(reader.result as string)
                                  setDirectLogoUrl(reader.result as string)
                                  setImageLoadError(false)
                                  setImageLoading(false)
                                }
                                reader.readAsDataURL(file)
                              }}
                            />
                            <span className="px-3 py-1.5 border border-blue-300 rounded-md hover:bg-blue-50">Upload Custom Image</span>
                          </label>
                        </div>
                      )}
                    </>
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


