import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/session-validator'
import { prisma } from '@/lib/prisma'
import { invalidateCache, CacheKeys } from '@/lib/cache'

/**
 * ProductHunt OAuth Callback Endpoint
 * Handles the redirect from ProductHunt after user authorization
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Check for OAuth errors
    if (error) {
      console.error('ProductHunt OAuth error:', error, errorDescription)
      return NextResponse.redirect(new URL(`/dashboard?error=producthunt_auth_failed&reason=${encodeURIComponent(error)}`, request.url))
    }

    // Validate session
    const sessionValidation = await validateSession(request)
    if (!sessionValidation.valid || !sessionValidation.user) {
      return NextResponse.redirect(new URL('/auth?error=unauthorized', request.url))
    }

    // Verify state to prevent CSRF attacks
    const storedState = request.cookies.get('ph_oauth_state')?.value
    if (!state || !storedState || state !== storedState) {
      console.error('ProductHunt OAuth state mismatch')
      return NextResponse.redirect(new URL('/dashboard?error=producthunt_state_mismatch', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard?error=producthunt_no_code', request.url))
    }

    const clientId = process.env.PH_API_Key
    const clientSecret = process.env.PH_API_Secret

    if (!clientId || !clientSecret) {
      console.error('ProductHunt API credentials not configured')
      return NextResponse.redirect(new URL('/dashboard?error=producthunt_config_missing', request.url))
    }

    // Get redirect URI (must match exactly what was sent in authorization request)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    // Remove www prefix to ensure consistency (must match authorization request)
    // Remove trailing slash if present
    const cleanBaseUrl = baseUrl.replace(/\/$/, '').replace(/^https?:\/\/www\./, 'https://')
    const redirectUri = `${cleanBaseUrl}/api/auth/producthunt/callback`
    
    // Log redirect URI for debugging
    console.log('🔗 ProductHunt OAuth Callback Redirect URI:', redirectUri)

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.producthunt.com/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('ProductHunt token exchange failed:', tokenResponse.status, errorData)
      return NextResponse.redirect(new URL('/dashboard?error=producthunt_token_exchange_failed', request.url))
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    if (!access_token) {
      console.error('No access token received from ProductHunt')
      return NextResponse.redirect(new URL('/dashboard?error=producthunt_no_token', request.url))
    }

    // Fetch user's ProductHunt profile to get username
    const profileResponse = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({
        query: `
          query {
            me {
              username
              name
            }
          }
        `
      })
    })

    let username: string | null = null

    if (!profileResponse.ok) {
      console.error('Failed to fetch ProductHunt profile:', profileResponse.status)
      // Still save the token, user can manually enter username
    } else {
      const profileData = await profileResponse.json()
      username = profileData?.data?.me?.username
    }

    // Calculate token expiration time
    const expiresAt = expires_in 
      ? new Date(Date.now() + expires_in * 1000)
      : null

    // Store OAuth tokens in database
    await prisma.oAuthToken.upsert({
      where: { userId_platform: { userId: sessionValidation.user.id, platform: 'producthunt' } },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresAt: expiresAt,
        updatedAt: new Date()
      },
      create: {
        userId: sessionValidation.user.id,
        platform: 'producthunt',
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresAt: expiresAt
      }
    })

    // Update user's portfolio with ProductHunt username if available
    let portfolio = null
    if (username) {
      portfolio = await prisma.portfolio.upsert({
        where: { userId: sessionValidation.user.id },
        update: {
          productHuntUsername: username,
          updatedAt: new Date()
        },
        create: {
          userId: sessionValidation.user.id,
          displayName: sessionValidation.user.name || '',
          productHuntUsername: username,
          isPublished: false
        },
        include: {
          user: {
            select: {
              githubUsername: true
            }
          }
        }
      })

      // Invalidate cache for public portfolio pages
      // This ensures ProductHunt data shows up immediately
      const usernamesToInvalidate: string[] = []
      if (portfolio.customUsername) {
        usernamesToInvalidate.push(`public_${portfolio.customUsername}`)
        usernamesToInvalidate.push(CacheKeys.portfolio(portfolio.customUsername))
      }
      if (portfolio.user?.githubUsername) {
        usernamesToInvalidate.push(`public_${portfolio.user.githubUsername}`)
        usernamesToInvalidate.push(CacheKeys.portfolio(portfolio.user.githubUsername))
      }
      
      // Invalidate all related cache keys
      for (const usernameKey of usernamesToInvalidate) {
        invalidateCache(usernameKey)
      }
      
      console.log(`✅ ProductHunt connected and cache invalidated for:`, usernamesToInvalidate)
    }

    // Clear the state cookie
    const response = NextResponse.redirect(new URL('/dashboard?producthunt_connected=true', request.url))
    response.cookies.delete('ph_oauth_state')

    return response

  } catch (error) {
    console.error('ProductHunt OAuth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=producthunt_connection_failed', request.url))
  }
}

