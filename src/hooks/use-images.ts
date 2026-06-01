'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
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
      return (data ?? []) as unknown as PatientImage[]
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

      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const storagePath = `patient-files/${clinic.id}/${patientId}/${category}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('patient-files')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('patient-files')
        .getPublicUrl(storagePath)

      const record: PatientImageInsert = {
        clinic_id: clinic.id,
        patient_id: patientId,
        uploaded_by: user.id,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        category,
        description: description || null,
        tooth_number: toothNumber || null,
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
      const { error } = await supabase
        .from('patient_images')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('id', image.id)

      if (error) throw error
    },
    onSuccess: (_, image) => {
      queryClient.invalidateQueries({
        queryKey: ['patient_images', image.clinic_id, image.patient_id],
      })
    },
  })
}
