import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Redirect old portfolio URLs to new format
  if (request.nextUrl.pathname.startsWith('/portfolio/')) {
    const username = request.nextUrl.pathname.replace('/portfolio/', '')
    const newUrl = new URL(`/${username}`, request.url)
    return NextResponse.redirect(newUrl, 301) // Permanent redirect
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/portfolio/:path*'
}
