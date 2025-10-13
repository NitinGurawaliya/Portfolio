import { NextRequest, NextResponse } from "next/server"
import { withAuth, withErrorHandling } from "@/lib/middleware"

export const GET = withAuth(
  withErrorHandling(async (req: NextRequest, ctx) => {
    const sessionCookie = req.cookies.get("github-session")?.value
    if (!sessionCookie) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    const session = JSON.parse(sessionCookie)
    const { accessToken: _omit, ...safeSession } = session
    return NextResponse.json({ success: true, session: safeSession })
  })
)

