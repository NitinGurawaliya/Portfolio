import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("github-session")?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie)
    
    // Check if session has expired (if expires field exists)
    if (session.expires) {
      const expiresDate = new Date(session.expires)
      if (expiresDate < new Date()) {
        return NextResponse.json({ error: "Session expired" }, { status: 401 })
      }
    }
    
    // Validate token by making a test API call to GitHub
    const accessToken = session.accessToken as string | undefined
    if (!accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 })
    }
    
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

