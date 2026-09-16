import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPER_ADMIN_EMAIL = 'atwoodparkerimc@gmail.com'

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const protectedRoutes = [
    '/dashboard',
    '/manager',
    '/safety',
    '/reporting',
    '/catalog',
    '/profile',
  ]

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // 1. Unauthenticated -> Redirect to /login
  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 2. Already authenticated and visiting /login -> Bounce to /dashboard
  if (pathname === '/login' && user) {
    const redirectTarget = request.nextUrl.searchParams.get('redirect') || '/dashboard'
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = redirectTarget
    redirectUrl.searchParams.delete('redirect')
    return NextResponse.redirect(redirectUrl)
  }

  // 3. Manager Route Protection -> Instant Edge Redirect (No UI Flash)
  if (pathname.startsWith('/manager') && user) {
    const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()

    let hasManagerPrivileges = isSuperAdmin

    if (!hasManagerPrivileges) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      const role = profile?.role?.toLowerCase()
      hasManagerPrivileges =
        role === 'manager' || role === 'admin' || role === 'superadmin'
    }

    if (!hasManagerPrivileges) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}