import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
})

export const config = {
  // Protect workspace and onboarding routes — exclude API routes, auth routes, static files
  matcher: [
    '/onboarding/:path*',
    '/((?!api|_next/static|_next/image|login|favicon\\.ico)[^/]+)/:path*',
  ],
}
