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

export async function resolvePatientFileUrl(
  supabase: SupabaseClient,
  fileUrlOrPath: string
): Promise<string> {
  // R2-stored files use a plain storage path (no https:// prefix and no Supabase URL patterns)
  const isSupabaseUrl =
    fileUrlOrPath.startsWith('http://') || fileUrlOrPath.startsWith('https://')
  const isR2Key = !isSupabaseUrl

  if (isR2Key) {
    return resolveR2FileUrl(fileUrlOrPath)
  }

  // Supabase Storage: generate a signed URL
  if (isSupabaseUrl) {
    const extracted = extractStoragePathFromPublicUrl(fileUrlOrPath)
    if (!extracted) return fileUrlOrPath
    fileUrlOrPath = extracted.replace(/^patient-files\//, '')
  } else {
    fileUrlOrPath = fileUrlOrPath.replace(/^patient-files\//, '')
  }

  const { data, error } = await supabase.storage
    .from(PATIENT_FILES_BUCKET)
    .createSignedUrl(fileUrlOrPath, 60 * 60 * 24)

  if (error || !data?.signedUrl) {
    throw error ?? new Error('Unable to resolve patient file URL')
  }

  return data.signedUrl
}
