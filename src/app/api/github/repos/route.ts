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

    const repos = await githubRes.json()
    
    // Fetch languages for each repository
    const reposWithLanguages = await Promise.all(
      repos.map(async (repo: any) => {
        try {
          const langRes = await fetch(`https://api.github.com/repos/${repo.full_name}/languages`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
            cache: "no-store",
          })
          
          if (langRes.ok) {
            const languages = await langRes.json()
            repo.languages = Object.keys(languages) // Add languages array
          } else {
            repo.languages = repo.language ? [repo.language] : []
          }
        } catch (error) {
          console.error(`Error fetching languages for ${repo.name}:`, error)
          repo.languages = repo.language ? [repo.language] : []
        }
        return repo
      })
    )
    
    return NextResponse.json(reposWithLanguages, { status: githubRes.status })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 500 })
  }
}

