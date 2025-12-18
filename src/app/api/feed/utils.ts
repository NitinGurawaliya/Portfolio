import { NextRequest } from "next/server"
import { validateSessionOptional } from "@/lib/session-validator"

export async function resolveCurrentUserId(req: NextRequest) {
  try {
    const sessionValidation = await validateSessionOptional(req)
    if (!sessionValidation.valid || !sessionValidation.user) return null
    return sessionValidation.user.id ?? null
  } catch (error) {
    console.error("❌ Feed: Error resolving session user:", error)
    return null
  }
}
