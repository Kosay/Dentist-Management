'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import type { Tables, InsertTables } from '@/types/database'

type TimelineEvent = Tables<'patient_timeline'>
type TimelineEventInsert = InsertTables<'patient_timeline'>

export function useTimeline(patientId: string) {
  const { clinic } = useAuth()
  const supabase = createClient()

  return useQuery<TimelineEvent[], Error>({
    queryKey: ['timeline', clinic?.id, patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_timeline')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as TimelineEvent[]
    },
    enabled: !!clinic?.id && !!patientId,
  })
}

export function useAddTimelineEvent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<TimelineEvent, Error, TimelineEventInsert>({
    mutationFn: async (event) => {
      const { data, error } = await supabase
        .from('patient_timeline')
        .insert(event as never)
        .select()
        .single()

      if (error) throw error
      return data as unknown as TimelineEvent
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['timeline', data.clinic_id, data.patient_id],
      })
    },
  })
}
