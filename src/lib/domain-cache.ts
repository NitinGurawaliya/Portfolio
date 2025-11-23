/**
 * Domain Cache Service
 * Caches custom domain lookups for performance
 */

interface CachedDomain {
  domain: string;
  portfolioId: number;
  username: string;
  verified: boolean;
  timestamp: number;
}

// In-memory cache (will be lost on server restart)
// In production, replace with Redis for persistence
const domainCache = new Map<string, CachedDomain>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached domain mapping
 */
export async function getCachedDomain(
  domain: string
): Promise<CachedDomain | null> {
  const cached = domainCache.get(domain);

  if (!cached) {
    return null;
  }

  // Check if cache is expired
  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    domainCache.delete(domain);
    return null;
  }

  return cached;
}

/**
 * Cache domain mapping
 */
export async function cacheDomain(
  domain: string,
  data: {
    portfolioId: number;
    username: string;
    verified: boolean;
  }
): Promise<void> {
  domainCache.set(domain, {
    domain,
    portfolioId: data.portfolioId,
    username: data.username,
    verified: data.verified,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate cached domain
 */
export async function invalidateDomainCache(domain: string): Promise<void> {
  domainCache.delete(domain);
}

/**
 * Clear all cached domains
 */
export async function clearDomainCache(): Promise<void> {
  domainCache.clear();
}

/**
 * Get cache stats (for monitoring)
 */
export function getCacheStats(): {
  size: number;
  domains: string[];
} {
  return {
    size: domainCache.size,
    domains: Array.from(domainCache.keys()),
  };
}

