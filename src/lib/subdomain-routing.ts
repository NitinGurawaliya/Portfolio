/**
 * Subdomain routing configuration
 * Maps subdomains to their corresponding routes
 */

export const SUBDOMAIN_ROUTES: Record<string, string> = {
  'app': '/dashboard',
  'project': '/feed/projects',
  'projects': '/feed/projects',
  'shiplog': '/feed/shiplog',
  'shiplogs': '/feed/shiplog',
  // Future products can be added here
  // 'blog': '/blog',
  // 'docs': '/docs',
}

/**
 * Get route for a subdomain
 * @param subdomain - The subdomain (without domain part)
 * @returns The route path or null if no mapping exists
 */
export function getSubdomainRoute(subdomain: string): string | null {
  const normalizedSubdomain = subdomain.toLowerCase().trim()
  return SUBDOMAIN_ROUTES[normalizedSubdomain] || null
}

/**
 * Check if a hostname is a known subdomain
 * @param hostname - Full hostname (e.g., 'project.devfolio.cc' or 'project.localhost:3000')
 * @param mainDomain - Main domain (e.g., 'devfolio.cc')
 * @returns Subdomain name or null
 */
export function extractSubdomain(hostname: string, mainDomain: string): string | null {
  // Remove www prefix if present
  const cleanHostname = hostname.replace(/^www\./, '')
  
  // Handle localhost for development (e.g., project.localhost:3000)
  if (cleanHostname.includes('localhost')) {
    const subdomainMatch = cleanHostname.match(/^([^.]+)\.localhost/)
    if (subdomainMatch) {
      const subdomain = subdomainMatch[1]
      if (getSubdomainRoute(subdomain)) {
        return subdomain
      }
    }
    return null
  }
  
  // Check if it's a subdomain of main domain
  if (cleanHostname === mainDomain) {
    return null // It's the main domain
  }
  
  if (!cleanHostname.endsWith(`.${mainDomain}`)) {
    return null // Not a subdomain of main domain
  }
  
  // Extract subdomain part
  const subdomain = cleanHostname.replace(`.${mainDomain}`, '').split(':')[0] // Remove port if present
  
  // Check if it's a known subdomain route
  if (getSubdomainRoute(subdomain)) {
    return subdomain
  }
  
  return null
}

