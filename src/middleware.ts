import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  
  // Get main domain from environment variable
  const mainDomain = process.env.NEXT_PUBLIC_BASE_URL 
    ? new URL(process.env.NEXT_PUBLIC_BASE_URL).hostname.replace('www.', '')
    : 'devfolio.cc'
  
  // Extract hostname without port
  const cleanHostname = hostname.split(':')[0].replace('www.', '')
  
  // Check if this is a custom domain (not main domain and not localhost)
  const isCustomDomain = cleanHostname !== mainDomain && 
                         !cleanHostname.includes('localhost') && 
                         !cleanHostname.includes('127.0.0.1') &&
                         !cleanHostname.includes('vercel.app')
  
  // If custom domain and root path, rewrite to portfolio lookup
  // The [username] route will handle finding the portfolio by hostname
  if (isCustomDomain && pathname === '/') {
    // Rewrite to use hostname as username parameter
    // The portfolio page will handle the lookup
    const newUrl = new URL(`/${cleanHostname}`, request.url)
    return NextResponse.rewrite(newUrl)
  }
  
  // Redirect old portfolio URLs to new format
  if (pathname.startsWith('/portfolio/')) {
    const username = pathname.replace('/portfolio/', '')
    const newUrl = new URL(`/${username}`, request.url)
    return NextResponse.redirect(newUrl, 301) // Permanent redirect
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/portfolio/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
