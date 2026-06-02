import createIntlMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'

const intlMiddleware = createIntlMiddleware(routing)

const AUTH_PATHS = new Set(['/', '/login', '/register', '/verify-email'])

function stripLocale(pathname: string): { locale: string; path: string } {
  const segments = pathname.split('/')
  const maybeLocale = segments[1]
  if (routing.locales.includes(maybeLocale as (typeof routing.locales)[number])) {
    const path = pathname.replace(`/${maybeLocale}`, '') || '/'
    return { locale: maybeLocale, path }
  }
  return { locale: routing.defaultLocale, path: pathname }
}

function mergeCookies(from: NextResponse, into: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    into.cookies.set(cookie.name, cookie.value, cookie)
  })
}

export async function middleware(request: NextRequest) {
  const { response: supabaseResponse, user } = await updateSession(request)
  const intlResponse = intlMiddleware(request)

  mergeCookies(supabaseResponse, intlResponse)

  const { pathname } = request.nextUrl
  const { locale, path: pathWithoutLocale } = stripLocale(pathname)

  const isAuthPath = AUTH_PATHS.has(pathWithoutLocale)
  const isProtectedPath =
    !isAuthPath && !pathWithoutLocale.startsWith('/api')
  const isVerified = Boolean(user?.email_confirmed_at)

  const redirectWithLocale = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}${path}`
    const redirectResponse = NextResponse.redirect(url)
    mergeCookies(supabaseResponse, redirectResponse)
    return redirectResponse
  }

  if (pathWithoutLocale === '/verify-email' && !user) {
    return redirectWithLocale('/login')
  }

  if (user && !isVerified && isProtectedPath) {
    return redirectWithLocale('/verify-email')
  }

  if (!user && isProtectedPath) {
    return redirectWithLocale('/login')
  }

  if (
    user &&
    isVerified &&
    (pathWithoutLocale === '/login' ||
      pathWithoutLocale === '/register' ||
      pathWithoutLocale === '/')
  ) {
    return redirectWithLocale('/dashboard')
  }

  return intlResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
