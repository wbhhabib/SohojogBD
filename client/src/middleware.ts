import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Edge Middleware — Maintenance Mode
 *
 * Calls GET /api/v1/settings/public (no auth needed) on every page request.
 * If maintenanceMode is true → redirect to /maintenance.
 *
 * Always bypassed:
 *   /maintenance          avoid redirect loop
 *   /auth/login           admin must be able to log in
 *   /dashboard/admin      admin panel always accessible
 *   /admin/*              admin routes
 */

const BYPASS_PREFIXES = [
  '/maintenance',
  '/auth/login',
  '/auth/google',
  '/dashboard/admin',
  '/admin/',
  '/_next',
  '/favicon',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  try {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'

    const res = await fetch(`${apiBase}/settings/public`, {
      signal: AbortSignal.timeout(2000),
      // no auth header needed — public endpoint
    })

    if (res.ok) {
      const json = await res.json()
      if (json?.data?.maintenanceMode === true) {
        const url = request.nextUrl.clone()
        url.pathname = '/maintenance'
        return NextResponse.redirect(url)
      }
    }
  } catch {
    // settings unreachable → don't block, let app handle it
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}