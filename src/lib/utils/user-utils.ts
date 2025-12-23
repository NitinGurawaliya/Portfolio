export type UserEmailSources = {
  userId: string
  existingUserEmail?: string | null
  incomingEmail?: string | null
}

export function isPlaceholderEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.includes("@placeholder.com")
}

export function buildPlaceholderEmail(userId: string): string {
  return `github-${userId}@placeholder.com`
}

/**
 * Production-safe email normalization used across APIs.
 *
 * Priority:
 * 1) existing DB email if it's not a placeholder
 * 2) incoming email (trimmed) if present
 * 3) placeholder email
 */
export function normalizeUserEmail(sources: UserEmailSources): string {
  const existing = (sources.existingUserEmail ?? "").trim()
  if (existing && !isPlaceholderEmail(existing)) return existing

  const incoming = (sources.incomingEmail ?? "").trim()
  if (incoming) return incoming

  return buildPlaceholderEmail(sources.userId)
}

