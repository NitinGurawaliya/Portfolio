import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { devLog } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/sendEmail"
import { generateWelcomeEmail } from "@/lib/templates/welcomeEmail"
import { isPlaceholderEmail, normalizeUserEmail } from "@/lib/utils/user-utils"

const sanitizeUsername = (value?: string | null) => {
  if (!value) return null
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "")
  if (!cleaned) return null
  if (cleaned.length < 3 || cleaned.length > 20) return null
  return cleaned
}

const extractUsernameFromState = (state: string | null | undefined) => {
  if (!state) return null
  const marker = "|u:"
  const markerIndex = state.indexOf(marker)
  if (markerIndex === -1) return null
  const rawUsername = state.slice(markerIndex + marker.length)
  return sanitizeUsername(rawUsername)
}

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
      const randomPart = randomBytes(8).toString("hex");
      const requestedUsername = sanitizeUsername(searchParams.get("username"));
      const state = requestedUsername ? `login-${randomPart}|u:${requestedUsername}` : `login-${randomPart}`;
      githubAuthUrl.searchParams.set("state", state);
      devLog("[GITHUB AUTH] Initiating OAuth | oauth state:", state);
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
      const desiredUsernameFromState = extractUsernameFromState(returnedState)
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
      let assignedUsername: string | null = null
    try {
      devLog("Saving user to database:", userData.login)
      
      // Try to get user's email from GitHub (including private emails)
      let userEmail: string | null = userData.email && userData.email.trim()
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
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { githubId: userData.id.toString() }
      })

      // Normalize email consistently across the app
      userEmail = normalizeUserEmail({
        userId: userData.id.toString(),
        existingUserEmail: existingUser?.email,
        incomingEmail: userEmail,
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

        if (desiredUsernameFromState) {
          try {
            const conflict = await prisma.portfolio.findFirst({
              where: {
                OR: [
                  {
                    customUsername: {
                      equals: desiredUsernameFromState,
                      mode: "insensitive"
                    }
                  },
                  {
                    user: {
                      githubUsername: {
                        equals: desiredUsernameFromState,
                        mode: "insensitive"
                      }
                    }
                  }
                ],
                NOT: {
                  userId: savedUser.id
                }
              },
              select: { id: true }
            })

            if (!conflict) {
              const existingPortfolio = await prisma.portfolio.findUnique({
                where: { userId: savedUser.id },
                select: { id: true, customUsername: true }
              })

              if (!existingPortfolio) {
                await prisma.portfolio.create({
                  data: {
                    userId: savedUser.id,
                    displayName: userData.name || userData.login,
                    bio: userData.bio || "",
                    profilePic: userData.avatar_url || "",
                    customUsername: desiredUsernameFromState,
                    isPublished: false
                  }
                })
                assignedUsername = desiredUsernameFromState
              } else if (!existingPortfolio.customUsername || isNewUser) {
                await prisma.portfolio.update({
                  where: { userId: savedUser.id },
                  data: { customUsername: desiredUsernameFromState }
                })
                assignedUsername = desiredUsernameFromState
              }
            } else {
              devLog("Requested username already taken, skipping assignment:", desiredUsernameFromState)
            }
          } catch (usernameError) {
            console.error("Failed to assign onboarding username:", usernameError)
          }
        }
      
      // Debug logs
      devLog("📧 Email check - isNewUser:", isNewUser, "| userEmail:", userEmail, "| isPlaceholder:", isPlaceholderEmail(userEmail))
      
      // Send welcome email for new users (non-blocking, production-ready)
      if (isNewUser && !isPlaceholderEmail(userEmail)) {
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
    // Increase session lifespan to 30 days
    const sessionLifespanDays = 30
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
      expires: new Date(Date.now() + sessionLifespanDays * 24 * 60 * 60 * 1000).toISOString(),
    }
    
    // Create a simple session cookie
    devLog("Setting session cookie for user:", userData.login)
    
      // Get the current request URL to determine the correct base URL
      const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
      
      let redirectUrl = `${baseUrl}/dashboard`
      if (isNewUser) {
        const onboardingParams = new URLSearchParams()
        onboardingParams.set("fresh", "1")
        if (assignedUsername) {
          onboardingParams.set("username", assignedUsername)
        } else if (desiredUsernameFromState) {
          onboardingParams.set("username", desiredUsernameFromState)
          onboardingParams.set("needsUsernameRetry", "1")
        }
        redirectUrl = `${baseUrl}/onboarding?${onboardingParams.toString()}`
        devLog("[GITHUB AUTH] Redirecting new user to onboarding")
      } else {
        // Handle username assignment feedback for returning users
        const dashboardParams = new URLSearchParams()
        if (desiredUsernameFromState) {
          if (assignedUsername) {
            // Username was successfully assigned
            dashboardParams.set("username_updated", assignedUsername)
            devLog("[GITHUB AUTH] Username assigned to returning user:", assignedUsername)
          } else {
            // Username was requested but not assigned (conflict or other issue)
            dashboardParams.set("username_conflict", desiredUsernameFromState)
            devLog("[GITHUB AUTH] Username conflict for returning user:", desiredUsernameFromState)
          }
        }
        
        const queryString = dashboardParams.toString()
        redirectUrl = queryString ? `${baseUrl}/dashboard?${queryString}` : `${baseUrl}/dashboard`
        devLog("[GITHUB AUTH] Redirecting authenticated user to dashboard")
      }
      devLog("[GITHUB AUTH] Will redirect to:", redirectUrl);

    const response = NextResponse.redirect(redirectUrl)
    // Clear state cookie
    response.cookies.set("oauth_state", "", { path: "/api/auth/github", maxAge: 0 })
    response.cookies.set("github-session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionLifespanDays * 24 * 60 * 60, // 30 days
    })

    devLog("Redirecting to:", redirectUrl)
    return response
    
  } catch (error) {
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    return NextResponse.redirect(`${baseUrl}/auth?error=server_error`);
  }
}
