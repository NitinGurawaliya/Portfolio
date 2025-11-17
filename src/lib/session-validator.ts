import { NextRequest } from "next/server"
import { prisma } from "./prisma"

/**
 * Session validation result
 */
export interface SessionValidationResult {
  valid: boolean
  session?: any
  user?: any
  userId?: string
  error?: string
}

/**
 * Validates session cookie and returns user data
 * This is a centralized function to ensure consistent session validation across all API routes
 */
export async function validateSession(req: NextRequest): Promise<SessionValidationResult> {
  try {
    const sessionCookie = req.cookies.get("github-session")?.value
    
    if (!sessionCookie) {
      return { valid: false, error: "Not authenticated" }
    }

    // Parse session
    let session
    try {
      session = JSON.parse(sessionCookie)
    } catch (error) {
      return { valid: false, error: "Invalid session format" }
    }

    // Validate session expiry
    if (session.expires) {
      const expiresDate = new Date(session.expires)
      if (expiresDate < new Date()) {
        return { valid: false, error: "Session expired" }
      }
    }

    // Validate user ID exists in session
    const userId = session.user?.id
    if (!userId) {
      return { valid: false, error: "Invalid session data - missing user ID" }
    }

    // Validate access token exists
    const accessToken = session.accessToken
    if (!accessToken) {
      return { valid: false, error: "Invalid session data - missing access token" }
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { githubId: userId.toString() }
    })

    if (!user) {
      return { valid: false, error: "User not found in database" }
    }

    return {
      valid: true,
      session,
      user,
      userId: userId.toString()
    }
  } catch (error) {
    console.error("Session validation error:", error)
    return { valid: false, error: "Session validation failed" }
  }
}

/**
 * Optional session validation - doesn't throw error if session is invalid
 * Used for routes that work for both authenticated and public users
 */
export async function validateSessionOptional(req: NextRequest): Promise<SessionValidationResult> {
  const result = await validateSession(req)
  // Don't fail for optional validation - just return invalid status
  return result
}

