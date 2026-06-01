const DEFAULT_SITE_URL = 'https://dentist-management-taupe.vercel.app'
const DEFAULT_SUPABASE_URL = 'https://cgraxbgpcnhcagmkyjme.supabase.co'
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_6d4NL3uE7UWWWn5OtWVTBg_d3ae__wD'

export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? DEFAULT_SUPABASE_URL
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  return url
}

export function getSupabaseKey() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    DEFAULT_SUPABASE_PUBLISHABLE_KEY

  if (!key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    )
  }

  return key
}
