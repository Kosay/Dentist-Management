'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import type { TreatmentStatus } from '@/types/database'

export interface DashboardStats {
  todayAppointments: number
  activePatients: number
  monthlyRevenue: number
  outstandingBalance: number
  treatmentProgress: Record<TreatmentStatus, number>
}

export function useDashboardStats() {
  const { clinic } = useAuth()
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboard_stats', clinic?.id, today],
    queryFn: async () => {
      if (!clinic?.id) {
        throw new Error('Clinic not found')
      }

      const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')

      const [
        appointmentsResult,
        patientsResult,
        invoicesResult,
        treatmentsResult,
      ] = await Promise.all([
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('appointment_date', today)
          .is('deleted_at', null),
        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null),
        supabase
          .from('invoices')
          .select('paid_amount, remaining_amount, invoice_date, status')
          .is('deleted_at', null),
        supabase
          .from('treatment_plans')
          .select('status')
          .is('deleted_at', null),
      ])

      if (appointmentsResult.error) throw appointmentsResult.error
      if (patientsResult.error) throw patientsResult.error
      if (invoicesResult.error) throw invoicesResult.error
      if (treatmentsResult.error) throw treatmentsResult.error

      const invoices = (invoicesResult.data ?? []) as Array<{
        paid_amount: number
        remaining_amount: number
        invoice_date: string
        status: string
      }>

      const monthlyRevenue = invoices
        .filter(
          (invoice) =>
            invoice.status !== 'cancelled' && invoice.invoice_date >= monthStart
        )
        .reduce((sum, invoice) => sum + (invoice.paid_amount ?? 0), 0)

      const outstandingBalance = invoices
        .filter((invoice) => invoice.status !== 'cancelled' && invoice.status !== 'paid')
        .reduce((sum, invoice) => sum + (invoice.remaining_amount ?? 0), 0)

      const treatments = (treatmentsResult.data ?? []) as Array<{ status: TreatmentStatus }>
      const treatmentCounts: Record<TreatmentStatus, number> = {
        planned: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
      }

      for (const treatment of treatments) {
        treatmentCounts[treatment.status] += 1
      }

      const activeTreatments = treatments.filter(
        (treatment) => treatment.status !== 'cancelled'
      ).length

      const treatmentProgress: Record<TreatmentStatus, number> = {
        planned: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
      }

      if (activeTreatments > 0) {
        treatmentProgress.planned = Math.round(
          (treatmentCounts.planned / activeTreatments) * 100
        )
        treatmentProgress.in_progress = Math.round(
          (treatmentCounts.in_progress / activeTreatments) * 100
        )
        treatmentProgress.completed = Math.round(
          (treatmentCounts.completed / activeTreatments) * 100
        )
      }

      return {
        todayAppointments: appointmentsResult.count ?? 0,
        activePatients: patientsResult.count ?? 0,
        monthlyRevenue,
        outstandingBalance,
        treatmentProgress,
      }
    },
    enabled: !!clinic?.id,
  })
}

export function useTodayAppointments() {
  const { clinic } = useAuth()
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['dashboard_today_appointments', clinic?.id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_time, status, patients(full_name)')
        .eq('appointment_date', today)
        .is('deleted_at', null)
        .order('start_time', { ascending: true })
        .limit(8)

      if (error) throw error
      return (data ?? []) as Array<{
        id: string
        start_time: string
        status: string
        patients: { full_name: string } | null
      }>
    },
    enabled: !!clinic?.id,
  })
}

export function useDashboardStatsViewModel(stats: DashboardStats | undefined) {
  return useMemo(
    () => [
      {
        key: 'today_appointments' as const,
        value: String(stats?.todayAppointments ?? 0),
      },
      {
        key: 'active_patients' as const,
        value: String(stats?.activePatients ?? 0),
      },
      {
        key: 'monthly_revenue' as const,
        value: new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(stats?.monthlyRevenue ?? 0),
      },
      {
        key: 'outstanding' as const,
        value: new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(stats?.outstandingBalance ?? 0),
      },
    ],
    [stats]
  )
}
