import { NextRequest, NextResponse } from "next/server"
import { withAuth, withErrorHandling } from "@/lib/middleware"
import { fetchGitHub } from "@/lib/services"

export const GET = withAuth(
  withErrorHandling(async (req: NextRequest, ctx) => {
    const sessionCookie = req.cookies.get("github-session")?.value
    if (!sessionCookie) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    const session = JSON.parse(sessionCookie)
    const accessToken = session.accessToken as string | undefined
    if (!accessToken) return NextResponse.json({ error: "No access token" }, { status: 401 })
    const url = new URL("https://api.github.com/user/repos")
    url.searchParams.set("sort", "updated")
    url.searchParams.set("per_page", "100")
    const { data, status } = await fetchGitHub(url.toString(), accessToken)
    return NextResponse.json(data, { status })
  })
)

