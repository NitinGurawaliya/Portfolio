/**
 * API utilities for making HTTP requests
 */

/**
 * Generic API fetch wrapper with error handling
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string; status: number }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()

    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : (data.error || 'Request failed'),
      status: response.status,
    }
  } catch (error) {
    console.error('API request error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    }
  }
}

/**
 * Fetches GitHub user data
 */
export async function fetchGithubUser() {
  return apiRequest('/api/github/user', { cache: 'no-store' as RequestCache })
}

/**
 * Fetches GitHub repositories
 */
export async function fetchGithubRepos() {
  return apiRequest('/api/github/repos', { cache: 'no-store' as RequestCache })
}

/**
 * Fetches user session
 */
export async function fetchSession() {
  return apiRequest('/api/session', { cache: 'no-store' as RequestCache })
}

/**
 * Fetches portfolio data by username
 */
export async function fetchPortfolio(username: string) {
  return apiRequest(`/api/portfolio/publish?username=${encodeURIComponent(username)}`)
}

/**
 * Publishes portfolio data
 */
export async function publishPortfolio(portfolioData: any) {
  return apiRequest('/api/portfolio/publish-all', {
    method: 'POST',
    body: JSON.stringify(portfolioData),
  })
}

/**
 * Checks username availability
 */
export async function checkUsernameAvailability(username: string) {
  const { status } = await apiRequest(`/api/portfolio/publish?username=${encodeURIComponent(username)}`)
  
  return {
    isAvailable: status === 404,
    isTaken: status === 200,
  }
}

/**
 * Extracts metadata from URL
 */
export async function extractMetadata(url: string) {
  return apiRequest('/api/extract-metadata', {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

