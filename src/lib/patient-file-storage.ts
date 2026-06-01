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
  if (fileUrlOrPath.startsWith('http://') || fileUrlOrPath.startsWith('https://')) {
    const extracted = extractStoragePathFromPublicUrl(fileUrlOrPath)
    if (!extracted) {
      return fileUrlOrPath
    }
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
