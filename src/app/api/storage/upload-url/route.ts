import { NextRequest, NextResponse } from 'next/server'
import { createR2UploadUrl } from '@/lib/r2-storage'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key, contentType } = await request.json() as { key: string; contentType: string }

    if (!key || !contentType) {
      return NextResponse.json({ error: 'key and contentType are required' }, { status: 400 })
    }

    // Restrict key to safe path characters to prevent path traversal
    if (!/^[\w\-./]+$/.test(key)) {
      return NextResponse.json({ error: 'Invalid key format' }, { status: 400 })
    }

    const uploadUrl = await createR2UploadUrl(key, contentType)
    return NextResponse.json({ uploadUrl, key })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate upload URL'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
