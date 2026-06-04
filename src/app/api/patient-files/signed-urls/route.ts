import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  normalizePatientFileStoragePath,
  PATIENT_FILES_BUCKET,
} from '@/lib/patient-file-storage'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { paths?: string[] }
    const paths = body.paths?.filter(Boolean) ?? []

    if (paths.length === 0) {
      return NextResponse.json({ urls: {} })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const urls: Record<string, string> = {}

    await Promise.all(
      paths.map(async (rawPath) => {
        const path = normalizePatientFileStoragePath(rawPath)
        const { data, error } = await supabase.storage
          .from(PATIENT_FILES_BUCKET)
          .createSignedUrl(path, 60 * 60 * 24)

        if (error || !data?.signedUrl) {
          throw new Error(error?.message ?? `Unable to sign URL for ${path}`)
        }

        urls[rawPath] = data.signedUrl
      })
    )

    return NextResponse.json({ urls })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to sign image URLs'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
