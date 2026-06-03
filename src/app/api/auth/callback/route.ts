import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function sanitizeNextPath(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return null
  }
  return next
}

function defaultDashboardPath(next: string | null): string {
  const sanitized = sanitizeNextPath(next)
  if (sanitized) return sanitized
  return '/en/dashboard'
}

function localeFromPath(path: string): 'en' | 'ar' {
  const segment = path.split('/').filter(Boolean)[0]
  return segment === 'ar' ? 'ar' : 'en'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = defaultDashboardPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  const locale = localeFromPath(next)
  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_callback_failed`)
}
