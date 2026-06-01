'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import type { Tables, InsertTables, UpdateTables } from '@/types/database'

type Visit = Tables<'visits'>
type VisitInsert = InsertTables<'visits'>
type VisitUpdate = UpdateTables<'visits'>

export function useVisits(patientId: string) {
  const { clinic } = useAuth()
  const supabase = createClient()

  return useQuery<Visit[], Error>({
    queryKey: ['visits', clinic?.id, patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('patient_id', patientId)
        .is('deleted_at', null)
        .order('visit_date', { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as Visit[]
    },
    enabled: !!clinic?.id && !!patientId,
  })
}

export function useCreateVisit() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<Visit, Error, VisitInsert>({
    mutationFn: async (visit) => {
      const { data, error } = await supabase
        .from('visits')
        .insert(visit as never)
        .select()
        .single()

      if (error) throw error
      return data as unknown as Visit
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['visits', data.clinic_id, data.patient_id],
      })
    },
  })
}

export function useUpdateVisit() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<Visit, Error, { id: string; data: VisitUpdate }>({
    mutationFn: async ({ id, data: updateData }) => {
      const payload = { ...updateData, updated_at: new Date().toISOString() }
      const { data, error } = await supabase
        .from('visits')
        .update(payload as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as unknown as Visit
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['visits', data.clinic_id, data.patient_id],
      })
    },
  })
}
