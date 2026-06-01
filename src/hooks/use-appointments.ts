'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import type { Tables, InsertTables, UpdateTables } from '@/types/database'

type Appointment = Tables<'appointments'>
type AppointmentInsert = InsertTables<'appointments'>
type AppointmentUpdate = UpdateTables<'appointments'>

type AppointmentWithPatient = Appointment & {
  patients: { full_name: string } | null
}

export function useAppointments(date?: string, dentistId?: string) {
  const { clinic } = useAuth()
  const supabase = createClient()

  return useQuery<AppointmentWithPatient[], Error>({
    queryKey: ['appointments', clinic?.id, date, dentistId],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select('*, patients(full_name)')
        .is('deleted_at', null)
        .order('start_time', { ascending: true })

      if (date) {
        query = query.eq('appointment_date', date)
      }

      if (dentistId) {
        query = query.eq('dentist_id', dentistId)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as unknown as AppointmentWithPatient[]
    },
    enabled: !!clinic?.id,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<Appointment, Error, AppointmentInsert>({
    mutationFn: async (appointment) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment as never)
        .select()
        .single()

      if (error) throw error
      return data as unknown as Appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<
    Appointment,
    Error,
    { id: string; data: AppointmentUpdate }
  >({
    mutationFn: async ({ id, data: updateData }) => {
      const payload = { ...updateData, updated_at: new Date().toISOString() }
      const { data, error } = await supabase
        .from('appointments')
        .update(payload as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as unknown as Appointment
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({
        queryKey: ['appointment', variables.id],
      })
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('appointments')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
