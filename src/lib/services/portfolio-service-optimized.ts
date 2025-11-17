/**
 * Optimized portfolio loading service
 * Uses split APIs for faster progressive loading
 */

/**
 * Load only basic portfolio data (for instant home section display)
 */
export const loadBasicPortfolioData = async () => {
  const response = await fetch('/api/portfolio/basic', {
    credentials: 'include'
  })
  
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to load basic portfolio data")
  }
  
  if (response.status === 404) {
    return null
  }
  
  const result = await response.json()
  return result.portfolio
}

/**
 * Load sections data (repos, skills, socials) in parallel
 */
export const loadSectionsData = async () => {
  const response = await fetch('/api/portfolio/sections', {
    credentials: 'include'
  })
  
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to load sections data")
  }
  
  if (response.status === 404) {
    return null
  }
  
  const result = await response.json()
  return result
}

/**
 * Load public portfolio (optimized for public pages)
 */
export const loadPublicPortfolioData = async (username: string) => {
  const response = await fetch(`/api/portfolio/public?username=${username}`)
  
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to load public portfolio")
  }
  
  if (response.status === 404) {
    return null
  }
  
  const result = await response.json()
  return result.portfolio
}

