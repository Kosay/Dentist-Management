import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { getSupabaseKey, getSupabaseUrl } from '@/lib/supabase/env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // setAll is called from a Server Component where cookies
          // cannot be set. This can be safely ignored when the
          // middleware refreshes the session.
        }
      },
    },
  })
}
