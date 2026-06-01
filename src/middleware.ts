import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const locales = ['en', 'ar']
const defaultLocale = 'en'

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
  const supabaseResponse = await updateSession(request)

  const { pathname } = request.nextUrl
  const locale = getLocale(pathname) ?? defaultLocale
  const pathWithoutLocale = getLocale(pathname)
    ? stripLocale(pathname, locale)
    : pathname

  const hasSession = supabaseResponse.headers
    .getSetCookie()
    .some((c) => c.includes('sb-') && c.includes('auth-token'))

  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes('sb-') && c.name.includes('auth-token'),
  )

  const isAuthenticated = hasSession || hasAuthCookie

  const isLoginPage =
    pathWithoutLocale === '/login' || pathWithoutLocale === '/'
  const isDashboardPage = pathWithoutLocale.startsWith('/dashboard')

  if (!isAuthenticated && isDashboardPage) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  if (isAuthenticated && isLoginPage) {
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
