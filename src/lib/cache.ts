/**
 * Simple in-memory cache implementation
 * For production, consider using Redis or similar
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize = 1000 // Maximum number of items in cache

  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000 // Convert minutes to milliseconds
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let expiredCount = 0
    let activeCount = 0

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredCount++
        this.cache.delete(key)
      } else {
        activeCount++
      }
    }

    return {
      total: this.cache.size,
      active: activeCount,
      expired: expiredCount
    }
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Get all cache entries for debugging
  getAllEntries(): Array<{key: string, item: CacheItem<any>}> {
    const entries: Array<{key: string, item: CacheItem<any>}> = []
    for (const [key, item] of this.cache.entries()) {
      entries.push({ key: key as string, item })
    }
    return entries
  }
}

// Create singleton instance
export const cache = new MemoryCache()

// Cache key generators
export const CacheKeys = {
  // GitHub data cache keys
  // SECURITY: Always use user ID (not username) for authenticated user caches
  githubUser: (identifier: string) => `github_user_${identifier}`,
  githubRepos: (identifier: string) => `github_repos_${identifier}`,
  githubActivity: (identifier: string) => `github_activity_${identifier}`,
  
  // Portfolio data cache keys
  // Note: Public portfolios can use username, but authenticated should use user ID
  portfolio: (identifier: string) => `portfolio_${identifier}`,
  portfolioData: (identifier: string) => `portfolio_data_${identifier}`,
  
  // API response cache keys
  apiResponse: (endpoint: string, params?: Record<string, any>) => {
    const paramString = params ? `_${JSON.stringify(params)}` : ''
    return `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}${paramString}`
  }
}

// Cache TTL constants (in minutes)
export const CacheTTL = {
  GITHUB_USER: 1200, // 20 hours (20 * 60 minutes)
  GITHUB_REPOS: 1200, // 20 hours (20 * 60 minutes)
  GITHUB_ACTIVITY: 1200, // 20 hours (20 * 60 minutes)
  PORTFOLIO: 5, // 5 minutes (kept same for quick updates)
  PORTFOLIO_DATA: 2, // 2 minutes (kept same for quick updates)
  API_RESPONSE: 10 // 10 minutes (kept same for own APIs)
}

// Helper functions
export const getCachedData = <T>(key: string): T | null => {
  return cache.get<T>(key)
}

export const setCachedData = <T>(key: string, data: T, ttlMinutes: number): void => {
  cache.set(key, data, ttlMinutes)
}

export const invalidateCache = (pattern: string): void => {
  // For simple pattern matching (contains)
  let deletedCount = 0
  for (const key of cache['cache'].keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
      deletedCount++
    }
  }
  if (deletedCount > 0) {
    console.log(`🗑️ Cache invalidated: ${deletedCount} entries matching pattern "${pattern}"`)
  }
}

/**
 * Invalidate all caches for a specific user (by user ID)
 * Use this when a user logs out or their data changes
 */
export const invalidateUserCache = (userId: string): void => {
  console.log(`🗑️ Invalidating all caches for user: ${userId}`)
  invalidateCache(`user_${userId}`)
  invalidateCache(`basic_${userId}`)
  invalidateCache(`sections_${userId}`)
}

// Cleanup expired items every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 5 * 60 * 1000) // 5 minutes
}

export default cache
