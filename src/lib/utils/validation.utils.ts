/**
 * Validation utilities for form inputs and data validation
 */

/**
 * Validates if a username is valid (alphanumeric, hyphens, underscores)
 */
export function isValidUsername(username: string): boolean {
  if (!username || username.trim().length === 0) return false
  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  return usernameRegex.test(username.trim())
}

/**
 * Validates if an email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim().length === 0) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validates if a URL is valid
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.trim().length === 0) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validates if a GitHub URL is valid
 */
export function isValidGithubUrl(url: string): boolean {
  if (!isValidUrl(url)) return false
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/.+/
  return githubRegex.test(url)
}

/**
 * Validates file size (in bytes)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 2): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Validates image file type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  return validTypes.includes(file.type)
}

/**
 * Sanitizes input string (removes script tags, etc.)
 */
export function sanitizeInput(input: string): string {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim()
}

