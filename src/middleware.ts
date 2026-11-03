import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ryzebepvcminpbtlpmit.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_QzgYyfq1We8mT_CSkKGafg_XTZP6M17'

// Route permissions per role
const ROLE_ROUTES: Record<string, string[]> = {
  kasir: ['/pos', '/dashboard', '/profile'],
  admin: ['/pos', '/dashboard', '/products', '/reports', '/tutorial', '/profile'],
  owner: ['*'], // all routes
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Allow API routes to handle their own authentication and response
  if (pathname.startsWith('/api')) {
    return supabaseResponse
  }

  // Redirect obsolete pages to relevant active pages
  if (
    pathname.startsWith('/suppliers') ||
    pathname.startsWith('/purchases') ||
    pathname.startsWith('/repacking') ||
    pathname.startsWith('/inventory')
  ) {
    return NextResponse.redirect(new URL('/products', request.url))
  }
  if (pathname.startsWith('/finance')) {
    return NextResponse.redirect(new URL('/reports', request.url))
  }

  // If not logged in and not on login page, redirect to login
  if (!user && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If logged in and on login page, redirect to dashboard
  if (user && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Role-based access control
  if (user) {
    const role = (user.user_metadata?.role || 'kasir') as string
    const allowedRoutes = ROLE_ROUTES[role] || ROLE_ROUTES['kasir']

    if (allowedRoutes[0] !== '*') {
      const isAllowed = allowedRoutes.some(route => pathname.startsWith(route))
      if (!isAllowed) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
