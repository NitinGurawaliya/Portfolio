import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/session-validator'

/**
 * ProductHunt OAuth Authorization Endpoint
 * Redirects user to ProductHunt to authorize the application
 */
export async function GET(request: NextRequest) {
  try {
    const sessionValidation = await validateSession(request)
    
    if (!sessionValidation.valid || !sessionValidation.user) {
      return NextResponse.redirect(new URL('/auth?error=unauthorized', request.url))
    }

    const clientId = process.env.PH_API_Key
    if (!clientId) {
      console.error('PH_API_Key is not set in environment variables')
      return NextResponse.redirect(new URL('/dashboard?error=producthunt_config_missing', request.url))
    }

    // Get redirect URI - use production URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const redirectUri = `${baseUrl}/api/auth/producthunt/callback`
    
    // Generate state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      userId: sessionValidation.user.id,
      timestamp: Date.now()
    })).toString('base64')

    // Store state in cookie for verification (7 days expiry)
    const response = NextResponse.redirect(
      `https://api.producthunt.com/v2/oauth/authorize?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=public+private&` +
      `state=${encodeURIComponent(state)}`
    )

    // Store state in httpOnly cookie for security
    response.cookies.set('ph_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error) {
    console.error('ProductHunt OAuth authorization error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=producthunt_auth_failed', request.url))
  }
}

