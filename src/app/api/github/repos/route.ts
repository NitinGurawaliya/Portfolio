import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("github-session")?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const session = JSON.parse(sessionCookie)
    const accessToken = session.accessToken as string | undefined
    if (!accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 })
    }

    const url = new URL("https://api.github.com/user/repos")
    url.searchParams.set("sort", "updated")
    url.searchParams.set("per_page", "100")

    const githubRes = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    })

    const data = await githubRes.json()
    return NextResponse.json(data, { status: githubRes.status })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 500 })
  }
}

