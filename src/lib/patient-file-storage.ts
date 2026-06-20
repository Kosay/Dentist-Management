import type { SupabaseClient } from '@supabase/supabase-js'

export const PATIENT_FILES_BUCKET = 'patient-files'

export function buildPatientFileStoragePath(
  clinicId: string,
  patientId: string,
  category: string,
  fileName: string
): string {
  return `${clinicId}/${patientId}/${category}/${fileName}`
}

// ---------------------------------------------------------------------------
// R2 storage helpers (client-side — calls our API routes)
// ---------------------------------------------------------------------------

/** Upload a file to R2 via presigned URL. Returns the storage key. */
export async function uploadToR2(key: string, file: File): Promise<string> {
  // Step 1: Get a presigned upload URL from our API
  const res = await fetch('/api/storage/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, contentType: file.type || 'application/octet-stream' }),
  })

  if (!res.ok) {
    const { error } = await res.json() as { error: string }
    throw new Error(error ?? 'Failed to get upload URL')
  }

  const { uploadUrl } = await res.json() as { uploadUrl: string }

  // Step 2: PUT the file directly to R2
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })

  if (!uploadRes.ok) {
    throw new Error(`R2 upload failed: ${uploadRes.status}`)
  }

  return key
}

/** Get a signed (or public) URL for viewing a file from R2. */
export async function resolveR2FileUrl(key: string): Promise<string> {
  const res = await fetch(`/api/storage/signed-url?key=${encodeURIComponent(key)}`)
  if (!res.ok) {
    const { error } = await res.json() as { error: string }
    throw new Error(error ?? 'Failed to get signed URL')
  }
  const { signedUrl } = await res.json() as { signedUrl: string }
  return signedUrl
}

// ---------------------------------------------------------------------------
// Supabase storage helpers (kept for backwards compatibility)
// ---------------------------------------------------------------------------

function extractStoragePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${PATIENT_FILES_BUCKET}/`
  const signedMarker = `/storage/v1/object/sign/${PATIENT_FILES_BUCKET}/`
  const privateMarker = `/storage/v1/object/${PATIENT_FILES_BUCKET}/`

  for (const prefix of [marker, signedMarker, privateMarker]) {
    const index = url.indexOf(prefix)
    if (index !== -1) {
      return url.slice(index + prefix.length).split('?')[0] ?? null
    }
  }

  return null
}

export function normalizePatientFileStoragePath(fileUrlOrPath: string): string {
  if (fileUrlOrPath.startsWith('http://') || fileUrlOrPath.startsWith('https://')) {
    const extracted = extractStoragePathFromPublicUrl(fileUrlOrPath)
    if (extracted) {
      return extracted.replace(/^patient-files\//, '')
    }
    return fileUrlOrPath
  }

  return fileUrlOrPath.replace(/^patient-files\//, '')
}

export function isResolvableImageUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')
}

export async function resolvePatientFileUrlsViaApi(
  paths: string[]
): Promise<Map<string, string>> {
  const uniquePaths = [...new Set(paths.filter(Boolean))]
  if (uniquePaths.length === 0) {
    return new Map()
  }

  const response = await fetch('/api/patient-files/signed-urls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths: uniquePaths }),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(payload?.error ?? 'Failed to resolve image URLs')
  }

  const payload = (await response.json()) as { urls?: Record<string, string> }
  return new Map(Object.entries(payload.urls ?? {}))
}

export async function resolvePatientFileUrl(
  supabase: SupabaseClient,
  fileUrlOrPath: string
): Promise<string> {
  if (isResolvableImageUrl(fileUrlOrPath)) {
    return fileUrlOrPath
  }

  const path = normalizePatientFileStoragePath(fileUrlOrPath)

  const { data, error } = await supabase.storage
    .from(PATIENT_FILES_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24)

  if (!error && data?.signedUrl) {
    return data.signedUrl
  }

  const { data: blob, error: downloadError } = await supabase.storage
    .from(PATIENT_FILES_BUCKET)
    .download(path)

  if (!downloadError && blob) {
    return URL.createObjectURL(blob)
  }

  throw error ?? downloadError ?? new Error('Unable to resolve patient file URL')
}

export async function resolvePatientFileUrls(
  supabase: SupabaseClient,
  paths: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>()

  try {
    const fromApi = await resolvePatientFileUrlsViaApi(paths)
    for (const [path, url] of fromApi.entries()) {
      result.set(path, url)
    }
  } catch {
    // Fall back to per-file client resolution below.
  }

  const unresolved = paths.filter((path) => !result.has(path))

  await Promise.all(
    unresolved.map(async (path) => {
      try {
        const url = await resolvePatientFileUrl(supabase, path)
        result.set(path, url)
      } catch {
        // Leave unresolved — caller should skip broken entries.
      }
    })
  )

  return result
}
