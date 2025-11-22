import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl

  // Redirect old portfolio URLs to new format
  if (url.pathname.startsWith('/portfolio/')) {
    const username = url.pathname.replace('/portfolio/', '')
    const newUrl = new URL(`/${username}`, request.url)
    return NextResponse.redirect(newUrl, 301) // Permanent redirect
  }

  // Skip custom domain logic for localhost and dev environment
  if (
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    process.env.NODE_ENV === 'development'
  ) {
    return NextResponse.next()
  }

  // Custom domain routing (only in production)
  // Get main app domain
  const mainDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'devfolio.cc'
  
  // If it's our main domain or subdomain, continue normally
  if (hostname === mainDomain || hostname.endsWith(`.${mainDomain}`)) {
    return NextResponse.next()
  }

  // This is a custom domain - fetch mapping from API
  const normalizedDomain = hostname.replace(/^www\./, '')
  
  console.log(`[Middleware] Checking custom domain: ${normalizedDomain}`)
  
  try {
    // Call internal API to get domain mapping
    // This API route uses Prisma in Node.js runtime (not Edge)
    const apiUrl = new URL('/api/custom-domain/lookup', request.url)
    apiUrl.searchParams.set('domain', normalizedDomain)
    
    console.log(`[Middleware] Calling lookup API: ${apiUrl.toString()}`)
    
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'x-middleware-request': 'true',
      },
    })

    console.log(`[Middleware] Lookup API response status: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log(`[Middleware] Lookup API response:`, data)
      
      if (data.success && data.username) {
        // Rewrite to user's portfolio
        const username = data.username
        console.log(`[Middleware] Rewriting to portfolio: /${username}`)
        url.pathname = `/${username}`
        return NextResponse.rewrite(url)
      } else {
        console.log(`[Middleware] No username found for domain: ${normalizedDomain}`)
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.error(`[Middleware] Lookup API failed:`, errorData)
    }
  } catch (error) {
    console.error('[Middleware] Error checking custom domain:', error)
  }

  // No custom domain found, continue with normal routing
  console.log(`[Middleware] No custom domain mapping found, continuing with normal routing`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (to avoid infinite loops)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
