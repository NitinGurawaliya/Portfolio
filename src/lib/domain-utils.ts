/**
 * Domain Validation Utilities
 * Helper functions for domain validation and normalization
 */

/**
 * Validate domain format
 * @param domain - Domain to validate
 * @returns true if domain format is valid
 */
export function validateDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Remove www prefix for validation
  const cleanDomain = domain.replace(/^www\./, '');

  // Check length
  if (cleanDomain.length < 4 || cleanDomain.length > 253) {
    return false;
  }

  // Domain regex pattern
  // Allows letters, numbers, hyphens, and dots
  // Must start and end with alphanumeric
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

  if (!domainRegex.test(cleanDomain)) {
    return false;
  }

  // Check for reserved/blacklisted domains
  if (isReservedDomain(cleanDomain)) {
    return false;
  }

  return true;
}

/**
 * Normalize domain name
 * - Convert to lowercase
 * - Remove www prefix
 * - Trim whitespace
 */
export function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^www\./, '').trim();
}

/**
 * Check if domain is reserved/blacklisted
 */
export function isReservedDomain(domain: string): boolean {
  const reservedDomains = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'example.com',
    'example.org',
    'example.net',
    'test.com',
    'localhost.localdomain',
  ];

  const lowerDomain = domain.toLowerCase();

  // Check exact matches
  if (reservedDomains.includes(lowerDomain)) {
    return true;
  }

  // Check for local TLDs
  if (lowerDomain.endsWith('.local') || lowerDomain.endsWith('.localhost')) {
    return true;
  }

  // Check for private IP patterns
  if (/^(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\./.test(lowerDomain)) {
    return true;
  }

  return false;
}

/**
 * Extract root domain from subdomain
 * e.g., "blog.nitin.com" -> "nitin.com"
 */
export function getRootDomain(domain: string): string {
  const parts = domain.split('.');
  if (parts.length <= 2) {
    return domain;
  }
  return parts.slice(-2).join('.');
}

/**
 * Check if domain is a subdomain
 */
export function isSubdomain(domain: string): boolean {
  const parts = domain.split('.');
  return parts.length > 2;
}

/**
 * Generate a random verification token
 */
export function generateVerificationToken(): string {
  const randomString = Math.random().toString(36).substring(2, 15) +
                       Math.random().toString(36).substring(2, 15);
  return `devfolio-verify-${randomString}`;
}

/**
 * Validate that domain doesn't conflict with app's own domain
 */
export function isOwnDomain(domain: string): boolean {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'devfolio.cc';
  const lowerDomain = domain.toLowerCase();
  const lowerAppDomain = appDomain.toLowerCase();

  return lowerDomain === lowerAppDomain || lowerDomain.endsWith(`.${lowerAppDomain}`);
}

