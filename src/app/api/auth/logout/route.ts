import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" })
    
    // Clear session cookie by setting it to expire immediately
    // Must match the exact same settings as when cookie was set
    response.cookies.set("github-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expire immediately
      expires: new Date(0) // Also set expires to past date
    })
    
    // Also clear oauth_state cookie if it exists
    response.cookies.set("oauth_state", "", {
      path: "/api/auth/github",
      maxAge: 0,
      expires: new Date(0)
    })
    
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    )
  }
}

