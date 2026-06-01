import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const locales = ['en', 'ar']
const defaultLocale = 'en'

const AUTH_PATHS = new Set(['/', '/login', '/register', '/verify-email'])

function getLocale(pathname: string): string | null {
  const segments = pathname.split('/')
  const maybeLocale = segments[1]
  if (locales.includes(maybeLocale)) {
    return maybeLocale
  }
  return null
}

function stripLocale(pathname: string, locale: string): string {
  return pathname.replace(`/${locale}`, '') || '/'
}

export async function middleware(request: NextRequest) {
  const { response: supabaseResponse, user } = await updateSession(request)

  const { pathname } = request.nextUrl
  const locale = getLocale(pathname) ?? defaultLocale
  const pathWithoutLocale = getLocale(pathname)
    ? stripLocale(pathname, locale)
    : pathname

  const isAuthPath = AUTH_PATHS.has(pathWithoutLocale)
  const isProtectedPath =
    !isAuthPath && !pathWithoutLocale.startsWith('/api')
  const isVerified = Boolean(user?.email_confirmed_at)

  if (pathWithoutLocale === '/verify-email' && !user) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  if (user && !isVerified && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/verify-email`
    return NextResponse.redirect(url)
  }

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  if (
    user &&
    isVerified &&
    (pathWithoutLocale === '/login' ||
      pathWithoutLocale === '/register' ||
      pathWithoutLocale === '/')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/dashboard`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
