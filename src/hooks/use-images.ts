'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import {
  buildPatientFileStoragePath,
  isResolvableImageUrl,
  PATIENT_FILES_BUCKET,
  resolvePatientFileUrls,
  normalizePatientFileStoragePath,
} from '@/lib/patient-file-storage'
import { getMaxImageSizeBytes } from '@/lib/image-upload-limits'
import type { Tables, InsertTables, ImageCategory } from '@/types/database'

type PatientImage = Tables<'patient_images'>
type PatientImageInsert = InsertTables<'patient_images'>

export function usePatientImages(patientId: string, category?: ImageCategory) {
  const { clinic } = useAuth()
  const supabase = createClient()

  return useQuery<PatientImage[], Error>({
    queryKey: ['patient_images', clinic?.id, patientId, category],
    queryFn: async () => {
      let query = supabase
        .from('patient_images')
        .select('*')
        .eq('patient_id', patientId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query
      if (error) throw error

      const images = (data ?? []) as unknown as PatientImage[]
      const urlMap = await resolvePatientFileUrls(
        supabase,
        images.map((image) => image.file_url)
      )

      return images
        .map((image) => {
          const signedUrl = urlMap.get(image.file_url)
          if (!signedUrl || !isResolvableImageUrl(signedUrl)) {
            return null
          }
          return { ...image, file_url: signedUrl }
        })
        .filter((image): image is PatientImage => image !== null)
    },
    enabled: !!clinic?.id && !!patientId,
  })
}

interface UploadImageParams {
  file: File
  patientId: string
  category: ImageCategory
  description?: string
  toothNumber?: number
  visitId?: string
  treatmentPlanId?: string
}

export function useUploadImage() {
  const queryClient = useQueryClient()
  const { user, clinic } = useAuth()
  const supabase = createClient()

  return useMutation<PatientImage, Error, UploadImageParams>({
    mutationFn: async ({
      file,
      patientId,
      category,
      description,
      toothNumber,
      visitId,
      treatmentPlanId,
    }) => {
      if (!clinic?.id || !user?.id) throw new Error('Not authenticated')

      const maxBytes = getMaxImageSizeBytes(category)
      if (file.size > maxBytes) {
        const maxMb = Math.round(maxBytes / (1024 * 1024))
        throw new Error(`File exceeds ${maxMb} MB limit`)
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const storagePath = buildPatientFileStoragePath(
        clinic.id,
        patientId,
        category,
        fileName
      )

      // Use R2 if the API route is reachable (R2 env vars configured server-side),
      // otherwise fall back to Supabase Storage.
      let usedStoragePath = storagePath
      try {
        await uploadToR2(storagePath, file)
        // R2 upload succeeded — storagePath is already the R2 key
      } catch (r2Error) {
        // If the upload-url API returns 500 because R2 isn't configured, fall back
        const isNotConfigured =
          r2Error instanceof Error && r2Error.message.includes('not configured')
        if (!isNotConfigured) throw r2Error

        const { error: uploadError } = await supabase.storage
          .from(PATIENT_FILES_BUCKET)
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type || undefined,
          })
        if (uploadError) throw uploadError
      }
      usedStoragePath = storagePath

      const record: PatientImageInsert = {
        clinic_id: clinic.id,
        patient_id: patientId,
        uploaded_by: user.id,
        file_url: usedStoragePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
        category,
        description: description || null,
        tooth_number: toothNumber ?? null,
        visit_id: visitId || null,
        treatment_plan_id: treatmentPlanId || null,
      }

      const { data, error } = await supabase
        .from('patient_images')
        .insert(record as never)
        .select()
        .single()

      if (error) throw error
      return data as unknown as PatientImage
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['patient_images', data.clinic_id, data.patient_id],
      })
    },
  })
}

export function useDeleteImage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<void, Error, PatientImage>({
    mutationFn: async (image) => {
      // Delete the file from storage first
      const storagePath = normalizePatientFileStoragePath(image.file_url)
      const { error: storageError } = await supabase.storage
        .from(PATIENT_FILES_BUCKET)
        .remove([storagePath])

      if (storageError) throw storageError

      // Then mark the database record as deleted
      const { error: dbError } = await supabase
        .from('patient_images')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('id', image.id)

      if (dbError) throw dbError
    },
    onSuccess: (_, image) => {
      queryClient.invalidateQueries({
        queryKey: ['patient_images', image.clinic_id, image.patient_id],
      })
    },
  })
}
