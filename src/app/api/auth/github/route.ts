import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { devLog } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/sendEmail"
import { generateWelcomeEmail } from "@/lib/templates/welcomeEmail"

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");

  if (!code) {
    // --- OAUTH INIT: encode context in state param!
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
    githubAuthUrl.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!);
    githubAuthUrl.searchParams.set("redirect_uri", `${baseUrl}/api/auth/github`);
    githubAuthUrl.searchParams.set("scope", "read:user user:email public_repo");
    // If onboarding requested, mark state, else identify as login
    const onboardingFlag = searchParams.get("onboarding") === "1";
    const randomPart = randomBytes(8).toString("hex");
    const state = onboardingFlag ? `onboarding-${randomPart}` : `login-${randomPart}`;
    githubAuthUrl.searchParams.set("state", state);
    devLog("[GITHUB AUTH] Initiating OAuth | onboarding:", onboardingFlag, "| oauth state:", state);
    // CSRF protection as before
    const response = NextResponse.redirect(githubAuthUrl.toString());
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/github",
      maxAge: 10 * 60,
    });
    return response;
  }

  try {
    // --- CALLBACK: recover context from state only
    const stateCookie = req.cookies.get("oauth_state")?.value;
    devLog("[GITHUB AUTH] Callback state param:", returnedState, "| cookie:", stateCookie);
    if (!returnedState || !stateCookie || returnedState !== stateCookie) {
      const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
      return NextResponse.redirect(`${baseUrl}/auth?error=state_mismatch`);
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
      const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
      return NextResponse.redirect(`${baseUrl}/auth?error=access_denied`);
    }
    
    // Get user data from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Accept": "application/vnd.github.v3+json",
      },
    })
    
    const userData = await userResponse.json()
    
    // Save/update user in database and send welcome email for new users
    let isNewUser = false
    try {
      devLog("Saving user to database:", userData.login)
      
      // Try to get user's email from GitHub (including private emails)
      let userEmail = userData.email && userData.email.trim() 
        ? userData.email.trim() 
        : null
      
      // If no public email, try to fetch from emails endpoint
      if (!userEmail) {
        try {
          const emailsResponse = await fetch("https://api.github.com/user/emails", {
            headers: {
              "Authorization": `Bearer ${tokenData.access_token}`,
              "Accept": "application/vnd.github.v3+json",
            },
          })
          
          if (emailsResponse.ok) {
            const emails = await emailsResponse.json()
            // Find primary and verified email
            const primaryEmail = emails.find((e: any) => e.primary && e.verified)
            if (primaryEmail) {
              userEmail = primaryEmail.email
              devLog("✅ Found primary email from GitHub API:", userEmail)
            }
          }
        } catch (emailError) {
          console.error("Could not fetch user emails:", emailError)
        }
      }
      
      // Fallback to placeholder if still no email
      if (!userEmail) {
        userEmail = `github-${userData.id}@placeholder.com`
        devLog("⚠️ No email found, using placeholder:", userEmail)
      }
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { githubId: userData.id.toString() }
      })
      
      isNewUser = !existingUser
      
      const savedUser = await prisma.user.upsert({
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
      
      // Debug logs
      devLog("📧 Email check - isNewUser:", isNewUser, "| userEmail:", userEmail, "| isPlaceholder:", userEmail.includes('@placeholder.com'))
      
      // Send welcome email for new users (non-blocking, production-ready)
      if (isNewUser && !userEmail.includes('@placeholder.com')) {
        devLog("🎉 New user detected! Sending welcome email to:", userEmail)
        
        // Get current base URL for portfolio link
        const requestUrl = new URL(req.url)
        const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
        
        // Generate welcome email HTML
        const welcomeHtml = generateWelcomeEmail({
          name: userData.name || userData.login,
          username: userData.login,
          portfolioUrl: baseUrl,
        })
        
        // Send email asynchronously (non-blocking)
        sendEmail({
          to: userEmail,
          subject: "🚀 Welcome to DevFolio - Let's Build Your Portfolio!",
          html: welcomeHtml,
        })
          .then((result) => {
            if (result.success) {
              devLog("✅ Welcome email sent successfully to:", userEmail)
            } else {
              console.error("❌ Failed to send welcome email:", result.error)
            }
          })
          .catch((error) => {
            console.error("❌ Welcome email error:", error)
            // Don't fail authentication if email fails
          })
      } else if (!isNewUser) {
        devLog("👋 Returning user:", userData.login)
      }
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
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    const isOnboarding = returnedState.startsWith("onboarding-");
    devLog("[GITHUB AUTH] isOnboarding via state:", isOnboarding, "| state:", returnedState);

    // Decide redirect based on flow and whether user already has a published portfolio
    let redirectUrl: string
    if (isOnboarding) {
      // Even if onboarding was requested, if user already has a published portfolio, skip onboarding
      try {
        const dbUser = await prisma.user.findUnique({ where: { githubId: userData.id.toString() }, select: { id: true } })
        const existingPortfolio = dbUser ? await prisma.portfolio.findFirst({
          where: { userId: dbUser.id, isPublished: true },
          select: { id: true }
        }) : null
        if (existingPortfolio) {
          devLog("[GITHUB AUTH] Onboarding flag present but user already has portfolio. Redirecting to dashboard.")
          redirectUrl = `${baseUrl}/dashboard`
        } else {
          redirectUrl = `${baseUrl}/onbaording?onboarding-auth-success=1`
        }
      } catch (e) {
        devLog("[GITHUB AUTH] Portfolio check failed (onboarding branch), defaulting to onboarding", e)
        redirectUrl = `${baseUrl}/onbaording?onboarding-auth-success=1`
      }
    } else {
      // Check if user already has a published portfolio
      try {
        const dbUser = await prisma.user.findUnique({ where: { githubId: userData.id.toString() }, select: { id: true } })
        const existingPortfolio = dbUser ? await prisma.portfolio.findFirst({
          where: { userId: dbUser.id, isPublished: true },
          select: { id: true }
        }) : null
        if (existingPortfolio) {
          devLog("[GITHUB AUTH] Existing published portfolio found. Redirecting to dashboard.")
          redirectUrl = `${baseUrl}/dashboard`
        } else {
          devLog("[GITHUB AUTH] No published portfolio found. Redirecting to onboarding.")
          redirectUrl = `${baseUrl}/onbaording`
        }
      } catch (e) {
        devLog("[GITHUB AUTH] Portfolio check failed, defaulting to onboarding", e)
        redirectUrl = `${baseUrl}/onbaording`
      }
    }
    devLog("[GITHUB AUTH] Will redirect to:", redirectUrl);

    const response = NextResponse.redirect(redirectUrl)
    // Clear state cookie
    response.cookies.set("oauth_state", "", { path: "/api/auth/github", maxAge: 0 })
    response.cookies.set("github-session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    devLog("Redirecting to:", redirectUrl)
    return response
    
  } catch (error) {
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    return NextResponse.redirect(`${baseUrl}/auth?error=server_error`);
  }
}
