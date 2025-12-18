import { NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/session-validator"

export async function GET(req: NextRequest) {
  try {
    const sessionValidation = await validateSession(req)
    if (!sessionValidation.valid || !sessionValidation.session) {
      return NextResponse.json(
        { error: sessionValidation.error || "Not authenticated" },
        { status: 401 }
      )
    }

    const session = sessionValidation.session
    const accessToken = session.accessToken as string | undefined
    
    // Verify token is still valid by checking GitHub user endpoint
    try {
      const testResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      })
      
      // If token is invalid (401 or 403), session is invalid
      if (testResponse.status === 401 || testResponse.status === 403) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
      
      // If token is valid but other error, log but don't fail (token might be rate limited)
      if (!testResponse.ok && testResponse.status !== 403) {
        console.error("GitHub API error during session validation:", testResponse.status)
      }
    } catch (tokenError) {
      // Network error or other issue - be conservative and fail
      console.error("Token validation error:", tokenError)
      return NextResponse.json({ error: "Token validation failed" }, { status: 401 })
    }
    
    // Do not return access token to the client
    const { accessToken: _omit, ...safeSession } = session
    return NextResponse.json({ success: true, session: safeSession })
  } catch (error) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }
}

