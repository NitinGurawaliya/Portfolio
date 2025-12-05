/**
 * Shared utilities for GitHub OG image handling
 * Ensures consistent behavior across all endpoints
 */

/**
 * Validates if a string looks like a valid GitHub username/repo name (not a hash)
 */
export function isValidGitHubIdentifier(str: string | null | undefined): boolean {
  if (!str || str.length > 100) return false
  // Check if it's a long hex hash (40+ hex characters)
  if (str.match(/^[0-9a-f]{40,}$/i)) return false
  // Check if it contains only valid GitHub username characters (alphanumeric, hyphens, underscores, dots)
  return /^[a-zA-Z0-9._-]+$/.test(str)
}

/**
 * Extracts owner and repo from various sources with priority:
 * 1. htmlUrl (most reliable)
 * 2. fullName
 * 3. opengraph URL (if provided)
 * 
 * Returns null if valid owner/repo cannot be extracted
 */
export function extractOwnerRepo(params: {
  htmlUrl?: string | null
  fullName?: string | null
  opengraphUrl?: string | null
}): { owner: string; repo: string } | null {
  const { htmlUrl, fullName, opengraphUrl } = params
  let owner: string | null = null
  let repo: string | null = null

  // Priority 1: Parse from htmlUrl (most reliable for GitHub repos)
  if (htmlUrl) {
    try {
      const url = new URL(htmlUrl)
      if (url.hostname === 'github.com') {
        const pathParts = url.pathname.split('/').filter(Boolean)
        if (pathParts.length >= 2 && 
            isValidGitHubIdentifier(pathParts[0]) && 
            isValidGitHubIdentifier(pathParts[1])) {
          owner = pathParts[0]
          repo = pathParts[1]
        }
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  // Priority 2: Parse from fullName (if htmlUrl parsing failed)
  if ((!owner || !repo) && fullName) {
    const [fullNameOwner, fullNameRepo] = fullName.split('/')
    if (isValidGitHubIdentifier(fullNameOwner) && isValidGitHubIdentifier(fullNameRepo)) {
      owner = fullNameOwner
      repo = fullNameRepo
    }
  }

  // Priority 3: Parse from opengraph URL (format: hash/owner/repo or owner/repo)
  if ((!owner || !repo) && opengraphUrl && opengraphUrl.includes('opengraph.githubassets.com')) {
    try {
      const url = new URL(opengraphUrl)
      const pathParts = url.pathname.split('/').filter(Boolean)
      
      if (pathParts.length >= 3) {
        // Format: hash/owner/repo - skip first segment (hash)
        const potentialOwner = pathParts[1]
        const potentialRepo = pathParts[2]
        if (isValidGitHubIdentifier(potentialOwner) && isValidGitHubIdentifier(potentialRepo)) {
          owner = potentialOwner
          repo = potentialRepo
        }
      } else if (pathParts.length === 2) {
        // Format: owner/repo (no hash)
        const potentialOwner = pathParts[0]
        const potentialRepo = pathParts[1]
        if (isValidGitHubIdentifier(potentialOwner) && isValidGitHubIdentifier(potentialRepo)) {
          owner = potentialOwner
          repo = potentialRepo
        }
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  if (owner && repo) {
    return { owner, repo }
  }

  return null
}

/**
 * Generates proxy API URL for GitHub OG image
 * Returns null if valid owner/repo cannot be extracted
 */
export function getGitHubOgImageProxyUrl(params: {
  htmlUrl?: string | null
  fullName?: string | null
  opengraphUrl?: string | null
  logo?: string | null
}): string | null {
  const { htmlUrl, fullName, opengraphUrl, logo } = params

  // If logo is already a proxy URL, return it
  if (logo?.startsWith('/api/portfolio/github-og-image')) {
    return logo
  }

  // Extract owner/repo from available sources
  const ownerRepo = extractOwnerRepo({ htmlUrl, fullName, opengraphUrl: opengraphUrl || logo })
  
  if (ownerRepo) {
    return `/api/portfolio/github-og-image?owner=${encodeURIComponent(ownerRepo.owner)}&repo=${encodeURIComponent(ownerRepo.repo)}`
  }

  return null
}

/**
 * Checks if a URL is a GitHub favicon/icon
 */
export function isGitHubFavicon(url: string | null | undefined): boolean {
  if (!url) return false
  return url.includes('github.com') && (
    url.includes('favicon') || 
    url.includes('github-icon') || 
    url.includes('octocat') ||
    url.includes('github.com/favicon') ||
    url.includes('github.githubassets.com') ||
    url.match(/github\.com\/.*\/favicon/i) !== null
  )
}

/**
 * Determines the logo URL for a GitHub repository
 * Handles old repos with favicons, opengraph URLs, and missing logos
 */
export function getRepositoryLogo(params: {
  logo?: string | null
  favicon?: string | null
  htmlUrl?: string | null
  fullName?: string | null
  isImported?: boolean
}): string | null {
  const { logo, favicon, htmlUrl, fullName, isImported } = params

  // Skip processing for imported projects (not from GitHub)
  if (isImported) {
    return logo || null
  }

  // Use a local variable that can be modified
  let finalLogo = logo

  // If logo is a GitHub favicon, treat it as null (will generate OG image below)
  if (finalLogo && isGitHubFavicon(finalLogo)) {
    finalLogo = null
  }

  // If logo exists and is not a favicon, check if it's an opengraph URL
  if (finalLogo && finalLogo.includes('opengraph.githubassets.com')) {
    // Convert to proxy URL
    const proxyUrl = getGitHubOgImageProxyUrl({ htmlUrl, fullName, opengraphUrl: finalLogo })
    if (proxyUrl) {
      return proxyUrl
    }
    // If conversion fails, keep original (might be a valid URL we can't parse)
    return finalLogo
  }

  // If it's already a proxy URL, return it
  if (finalLogo && finalLogo.startsWith('/api/portfolio/github-og-image')) {
    return finalLogo
  }

  // If logo is null but favicon is GitHub favicon, generate OG image
  if (!finalLogo && favicon && isGitHubFavicon(favicon)) {
    // Will generate OG image below
  }

  // If no logo exists, generate proxy URL for GitHub OG image
  if (!finalLogo) {
    const proxyUrl = getGitHubOgImageProxyUrl({ htmlUrl, fullName })
    if (proxyUrl) {
      return proxyUrl
    }
  }

  // Return logo if it exists and is valid, otherwise null
  return finalLogo || null
}

