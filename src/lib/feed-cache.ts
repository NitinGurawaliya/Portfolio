const isBrowser = typeof window !== "undefined"

const FEED_CACHE_PREFIX = "devfolio-feed-cache-v1"
const FEED_CACHE_TTL_MS = 1000 * 60 * 5 // 5 minutes

export type FeedCachePayload<T = unknown> = {
  sort: string
  projects: T
  fetchedAt: number
}

function getCacheKey(sort: string) {
  return `${FEED_CACHE_PREFIX}:${sort}`
}

export function loadFeedCache<T = unknown>(sort: string): FeedCachePayload<T> | null {
  if (!isBrowser) return null

  try {
    const raw = window.sessionStorage.getItem(getCacheKey(sort))
    if (!raw) return null

    const parsed = JSON.parse(raw) as FeedCachePayload<T>
    if (!parsed || typeof parsed.fetchedAt !== "number") {
      window.sessionStorage.removeItem(getCacheKey(sort))
      return null
    }

    if (Date.now() - parsed.fetchedAt > FEED_CACHE_TTL_MS) {
      window.sessionStorage.removeItem(getCacheKey(sort))
      return null
    }

    return parsed
  } catch (error) {
    console.error("Feed cache read failed", error)
    return null
  }
}

export function saveFeedCache<T = unknown>(sort: string, projects: T) {
  if (!isBrowser) return

  try {
    const payload: FeedCachePayload<T> = {
      sort,
      projects,
      fetchedAt: Date.now(),
    }

    window.sessionStorage.setItem(getCacheKey(sort), JSON.stringify(payload))
  } catch (error) {
    console.error("Feed cache write failed", error)
  }
}

export function clearFeedCache(sort?: string) {
  if (!isBrowser) return

  try {
    if (sort) {
      window.sessionStorage.removeItem(getCacheKey(sort))
      return
    }

    Object.keys(window.sessionStorage)
      .filter((key) => key.startsWith(FEED_CACHE_PREFIX))
      .forEach((key) => window.sessionStorage.removeItem(key))
  } catch (error) {
    console.error("Feed cache clear failed", error)
  }
}

export const FEED_CACHE_TTL = FEED_CACHE_TTL_MS
