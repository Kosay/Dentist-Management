export function getSupabaseErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const record = error as {
    message?: string
    code?: string
    details?: string
    hint?: string
  }

  const message = record.message?.trim()
  if (!message) return fallback

  if (message.includes('Surface record not found')) {
    return message
  }

  if (record.code === 'PGRST116') {
    return 'Unable to save changes. Please refresh the page and try again.'
  }

  return message
}
