import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  
  if (!code) {
    // Redirect to GitHub OAuth
    const githubAuthUrl = new URL("https://github.com/login/oauth/authorize")
    githubAuthUrl.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!)
    githubAuthUrl.searchParams.set("redirect_uri", `${process.env.NEXTAUTH_URL}/api/auth/github`)
    githubAuthUrl.searchParams.set("scope", "read:user user:email repo")
    githubAuthUrl.searchParams.set("state", "random-state")
    
    return NextResponse.redirect(githubAuthUrl.toString())
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    
    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth?error=access_denied`)
    }
    
    // Get user data from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Accept": "application/vnd.github.v3+json",
      },
    })
    
    const userData = await userResponse.json()
    
    // Store user data in a simple session (you can improve this later)
    const sessionData = {
      user: {
        id: userData.id.toString(),
        name: userData.name || userData.login,
        email: userData.email,
        image: userData.avatar_url,
        githubUsername: userData.login,
        accessToken: tokenData.access_token,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
    
    // Create a simple session cookie
    console.log("Setting session cookie for user:", userData.login)
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`)
    response.cookies.set("github-session", JSON.stringify(sessionData), {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })
    
    console.log("Redirecting to dashboard")
    return response
    
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth?error=server_error`)
  }
}
