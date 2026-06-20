import { NextRequest, NextResponse } from 'next/server'
import { createR2SignedUrl } from '@/lib/r2-storage'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const key = request.nextUrl.searchParams.get('key')
    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }

    // Restrict key to safe path characters to prevent path traversal
    if (!/^[\w\-./]+$/.test(key)) {
      return NextResponse.json({ error: 'Invalid key format' }, { status: 400 })
    }

    const signedUrl = await createR2SignedUrl(key)
    return NextResponse.json({ signedUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate signed URL'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
