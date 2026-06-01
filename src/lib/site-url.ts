const DEFAULT_SITE_URL = 'https://dentist-management-taupe.vercel.app'

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return DEFAULT_SITE_URL
}
