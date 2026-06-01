'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import type { Tables, InsertTables, UpdateTables } from '@/types/database'

type TreatmentPlan = Tables<'treatment_plans'>
type TreatmentPlanInsert = InsertTables<'treatment_plans'>
type TreatmentPlanUpdate = UpdateTables<'treatment_plans'>

export function useTreatmentPlans(patientId?: string) {
  const { clinic } = useAuth()
  const supabase = createClient()

  return useQuery<TreatmentPlan[], Error>({
    queryKey: ['treatment_plans', clinic?.id, patientId],
    queryFn: async () => {
      let query = supabase
        .from('treatment_plans')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (patientId) {
        query = query.eq('patient_id', patientId)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as unknown as TreatmentPlan[]
    },
    enabled: !!clinic?.id,
  })
}

export function useCreateTreatmentPlan() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<TreatmentPlan, Error, TreatmentPlanInsert>({
    mutationFn: async (plan) => {
      const { data, error } = await supabase
        .from('treatment_plans')
        .insert(plan as never)
        .select()
        .single()

      if (error) throw error
      return data as unknown as TreatmentPlan
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment_plans'] })
    },
  })
}

export function useUpdateTreatmentPlan() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<
    TreatmentPlan,
    Error,
    { id: string; data: TreatmentPlanUpdate }
  >({
    mutationFn: async ({ id, data: updateData }) => {
      const payload = { ...updateData, updated_at: new Date().toISOString() }
      const { data, error } = await supabase
        .from('treatment_plans')
        .update(payload as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as unknown as TreatmentPlan
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatment_plans'] })
      queryClient.invalidateQueries({
        queryKey: ['treatment_plan', variables.id],
      })
    },
  })
}
