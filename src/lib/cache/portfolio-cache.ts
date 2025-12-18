import { CacheKeys, invalidateCache } from "@/lib/cache"

export type PortfolioCacheIdentity = {
  githubUsername?: string | null
  customUsername?: string | null
  userId?: number | string | null
}

/**
 * Centralized portfolio cache invalidation so every API uses same keys/patterns.
 *
 * Note: `invalidateCache()` does a substring match, so we pass either full keys
 * or the stable identifier segments.
 */
export class PortfolioCache {
  static invalidate(identity: PortfolioCacheIdentity) {
    const usernames = new Set<string>()
    if (identity.githubUsername) usernames.add(identity.githubUsername)
    if (identity.customUsername) usernames.add(identity.customUsername)

    for (const username of usernames) {
      invalidateCache(CacheKeys.portfolio(username))
      invalidateCache(CacheKeys.portfolio(`public_${username}`))
      invalidateCache(`public_${username}`)
    }

    if (identity.userId !== null && identity.userId !== undefined) {
      const userIdStr = String(identity.userId)
      invalidateCache(`user_${userIdStr}`)
      invalidateCache(`basic_${userIdStr}`)
      invalidateCache(`sections_${userIdStr}`)
      invalidateCache(CacheKeys.portfolio(`user_${userIdStr}`))
      invalidateCache(CacheKeys.portfolio(`basic_${userIdStr}`))
      invalidateCache(CacheKeys.portfolio(`sections_${userIdStr}`))
    }
  }
}

