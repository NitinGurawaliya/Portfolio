import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { devLog } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const returnedState = searchParams.get("state")
  
  if (!code) {
    // Redirect to GitHub OAuth
    const requestUrl = new URL(req.url)
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
    
    const githubAuthUrl = new URL("https://github.com/login/oauth/authorize")
    githubAuthUrl.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!)
    githubAuthUrl.searchParams.set("redirect_uri", `${baseUrl}/api/auth/github`)
    githubAuthUrl.searchParams.set("scope", "read:user user:email public_repo")
    // Generate CSRF state and store in httpOnly cookie
    const state = randomBytes(16).toString("hex")
    githubAuthUrl.searchParams.set("state", state)

    const response = NextResponse.redirect(githubAuthUrl.toString())
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/github",
      maxAge: 10 * 60,
    })
    return response
  }
  
  try {
    // Validate state parameter to prevent CSRF
    const stateCookie = req.cookies.get("oauth_state")?.value
    if (!returnedState || !stateCookie || returnedState !== stateCookie) {
      const requestUrl = new URL(req.url)
      const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
      return NextResponse.redirect(`${baseUrl}/auth?error=state_mismatch`)
    }
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
      const requestUrl = new URL(req.url)
      const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
      return NextResponse.redirect(`${baseUrl}/auth?error=access_denied`)
    }
    
    // Get user data from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Accept": "application/vnd.github.v3+json",
      },
    })
    
    const userData = await userResponse.json()
    
    // Save/update user in database
    try {
      devLog("Saving user to database:", userData.login)
      
      // Handle empty email to avoid unique constraint issues
      const userEmail = userData.email && userData.email.trim() 
        ? userData.email.trim() 
        : `github-${userData.id}@placeholder.com`
      
      await prisma.user.upsert({
        where: { githubId: userData.id.toString() },
        update: {
          name: userData.name || userData.login,
          email: userEmail,
          githubUsername: userData.login,
          avatarUrl: userData.avatar_url,
          bio: userData.bio || null,
          location: userData.location || null,
          websiteUrl: userData.blog || null,
          twitterUsername: userData.twitter_username || null,
          company: userData.company || null,
          publicRepos: userData.public_repos || 0,
          followers: userData.followers || 0,
          following: userData.following || 0,
        },
        create: {
          githubId: userData.id.toString(),
          name: userData.name || userData.login,
          email: userEmail,
          githubUsername: userData.login,
          avatarUrl: userData.avatar_url,
          bio: userData.bio || null,
          location: userData.location || null,
          websiteUrl: userData.blog || null,
          twitterUsername: userData.twitter_username || null,
          company: userData.company || null,
          publicRepos: userData.public_repos || 0,
          followers: userData.followers || 0,
          following: userData.following || 0,
        },
      })
      
      devLog("User saved to database successfully:", userData.login)
    } catch (dbError) {
      console.error("Error saving user to database:", dbError)
      // Continue with authentication even if database save fails
    }
    
    // Store user data in a simple session (you can improve this later)
    const sessionData = {
      user: {
        id: userData.id.toString(),
        name: userData.name || userData.login,
        email: userData.email,
        image: userData.avatar_url,
        githubUsername: userData.login,
      },
      // Keep token server-side only
      accessToken: tokenData.access_token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
    
    // Create a simple session cookie
    devLog("Setting session cookie for user:", userData.login)
    
    // Get the current request URL to determine the correct base URL
    const requestUrl = new URL(req.url)
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
    
    const response = NextResponse.redirect(`${baseUrl}/dashboard`)
    // Clear state cookie
    response.cookies.set("oauth_state", "", { path: "/api/auth/github", maxAge: 0 })
    response.cookies.set("github-session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })
    
    devLog("Redirecting to dashboard at:", `${baseUrl}/dashboard`)
    return response
    
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    const requestUrl = new URL(req.url)
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
    return NextResponse.redirect(`${baseUrl}/auth?error=server_error`)
  }
}
