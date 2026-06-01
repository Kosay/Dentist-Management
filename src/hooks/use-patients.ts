'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import type { Tables, InsertTables, UpdateTables } from '@/types/database'

type Patient = Tables<'patients'>
type PatientInsert = InsertTables<'patients'>
type PatientUpdate = UpdateTables<'patients'>

export function usePatients(searchQuery?: string) {
  const { clinic } = useAuth()
  const supabase = createClient()

  return useQuery<Patient[], Error>({
    queryKey: ['patients', clinic?.id, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.ilike('full_name', `%${searchQuery}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as unknown as Patient[]
    },
    enabled: !!clinic?.id,
  })
}

export function usePatient(id: string) {
  const supabase = createClient()

  return useQuery<Patient, Error>({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data as unknown as Patient
    },
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<Patient, Error, PatientInsert>({
    mutationFn: async (patient) => {
      const { data, error } = await supabase
        .from('patients')
        .insert(patient as never)
        .select()
        .single()

      if (error) throw error
      return data as unknown as Patient
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<Patient, Error, { id: string; data: PatientUpdate }>({
    mutationFn: async ({ id, data: updateData }) => {
      const payload = { ...updateData, updated_at: new Date().toISOString() }
      const { data, error } = await supabase
        .from('patients')
        .update(payload as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as unknown as Patient
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] })
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('patients')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}
