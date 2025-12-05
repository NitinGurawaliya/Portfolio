import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/session-validator'
import { prisma } from '@/lib/prisma'

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

    if (!profileResponse.ok) {
      console.error('Failed to fetch ProductHunt profile:', profileResponse.status)
      // Still save the token, user can manually enter username
    } else {
      const profileData = await profileResponse.json()
      const username = profileData?.data?.me?.username

      if (username) {
        // Update user's portfolio with ProductHunt username
        await prisma.portfolio.upsert({
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
          }
        })
      }
    }

    // TODO: Store access_token and refresh_token securely in database
    // For now, we'll just save the username
    // In production, you should:
    // 1. Create OAuthToken model in Prisma
    // 2. Encrypt tokens before storing
    // 3. Store refresh_token for token renewal

    // Clear the state cookie
    const response = NextResponse.redirect(new URL('/dashboard?producthunt_connected=true', request.url))
    response.cookies.delete('ph_oauth_state')

    return response

  } catch (error) {
    console.error('ProductHunt OAuth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=producthunt_connection_failed', request.url))
  }
}

