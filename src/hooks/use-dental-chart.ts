'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import type {
  Tables,
  UpdateTables,
  ToothCondition,
  ToothSurface,
} from '@/types/database'
import {
  PERMANENT_TEETH,
  PRIMARY_TEETH,
  type ToothData,
} from '@/components/odontogram/tooth-data'
import type { SurfaceCondition } from '@/components/odontogram/tooth-data'

type DentalChart = Tables<'dental_charts'>
type ToothRecord = Tables<'tooth_records'>
type SurfaceRecord = Tables<'surface_records'>
type ToothRecordUpdate = UpdateTables<'tooth_records'>
type SurfaceRecordUpdate = UpdateTables<'surface_records'>

type DentalChartWithRecords = DentalChart & {
  tooth_records: (ToothRecord & {
    surface_records: SurfaceRecord[]
  })[]
}

export interface ToothState {
  condition: ToothCondition
  surfaces: SurfaceCondition[]
  notes: string
}

interface UseDentalChartOptions {
  patientId: string
  isPrimary?: boolean
  readOnly?: boolean
  onToothClick?: (toothNumber: number) => void
}

export function useDentalChart({
  patientId,
  isPrimary = false,
  readOnly = false,
  onToothClick,
}: UseDentalChartOptions) {
  const { clinic } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [localStates, setLocalStates] = useState<Record<number, ToothState>>({})

  const allTeeth = useMemo(
    () => (isPrimary ? PRIMARY_TEETH : PERMANENT_TEETH),
    [isPrimary]
  )

  const queryResult = useQuery<DentalChartWithRecords | null, Error>({
    queryKey: ['dental_chart', clinic?.id, patientId, isPrimary],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dental_charts')
        .select('*, tooth_records(*, surface_records(*))')
        .eq('patient_id', patientId)
        .eq('is_primary', isPrimary)
        .maybeSingle()

      if (error) throw error
      return data as unknown as DentalChartWithRecords | null
    },
    enabled: !!clinic?.id && !!patientId,
  })

  useEffect(() => {
    const chart = queryResult.data
    if (!chart) return

    const states: Record<number, ToothState> = {}
    for (const tooth of allTeeth) {
      const record = chart.tooth_records?.find(
        (r) => r.tooth_number === tooth.number
      )
      if (record) {
        states[tooth.number] = {
          condition: record.condition,
          surfaces: tooth.surfaces.map((s) => {
            const sr = record.surface_records?.find((r) => r.surface === s)
            return { surface: s, condition: sr?.condition ?? 'healthy' }
          }),
          notes: record.notes ?? '',
        }
      } else {
        states[tooth.number] = {
          condition: 'healthy',
          surfaces: tooth.surfaces.map((s) => ({
            surface: s,
            condition: 'healthy' as ToothCondition,
          })),
          notes: '',
        }
      }
    }
    setLocalStates(states)
  }, [queryResult.data, allTeeth])

  const updateToothMutation = useMutation<
    ToothRecord,
    Error,
    { id: string; data: ToothRecordUpdate }
  >({
    mutationFn: async ({ id, data: updateData }) => {
      const payload = { ...updateData, updated_at: new Date().toISOString() }
      const { data, error } = await supabase
        .from('tooth_records')
        .update(payload as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as ToothRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dental_chart'] })
    },
  })

  const updateSurfaceMutation = useMutation<
    SurfaceRecord,
    Error,
    { id: string; data: SurfaceRecordUpdate }
  >({
    mutationFn: async ({ id, data: updateData }) => {
      const payload = { ...updateData, updated_at: new Date().toISOString() }
      const { data, error } = await supabase
        .from('surface_records')
        .update(payload as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as SurfaceRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dental_chart'] })
    },
  })

  const getToothState = useCallback(
    (toothNumber: number): ToothState | undefined => {
      return localStates[toothNumber]
    },
    [localStates]
  )

  const selectTooth = useCallback(
    (toothNumber: number | null) => {
      setSelectedTooth(toothNumber)
      if (toothNumber !== null && onToothClick) {
        onToothClick(toothNumber)
      }
    },
    [onToothClick]
  )

  const setToothCondition = useCallback(
    (toothNumber: number, condition: ToothCondition) => {
      if (readOnly) return
      setLocalStates((prev) => ({
        ...prev,
        [toothNumber]: {
          ...prev[toothNumber],
          condition,
        },
      }))

      const chart = queryResult.data
      if (!chart) return
      const record = chart.tooth_records?.find(
        (r) => r.tooth_number === toothNumber
      )
      if (record) {
        updateToothMutation.mutate({ id: record.id, data: { condition } })
      }
    },
    [readOnly, queryResult.data, updateToothMutation]
  )

  const setSurfaceCondition = useCallback(
    (toothNumber: number, surface: ToothSurface, condition: ToothCondition) => {
      if (readOnly) return
      setLocalStates((prev) => {
        const state = prev[toothNumber]
        if (!state) return prev
        return {
          ...prev,
          [toothNumber]: {
            ...state,
            surfaces: state.surfaces.map((s) =>
              s.surface === surface ? { ...s, condition } : s
            ),
          },
        }
      })

      const chart = queryResult.data
      if (!chart) return
      const record = chart.tooth_records?.find(
        (r) => r.tooth_number === toothNumber
      )
      if (record) {
        const sr = record.surface_records?.find((r) => r.surface === surface)
        if (sr) {
          updateSurfaceMutation.mutate({ id: sr.id, data: { condition } })
        }
      }
    },
    [readOnly, queryResult.data, updateSurfaceMutation]
  )

  const setToothNotes = useCallback(
    (toothNumber: number, notes: string) => {
      if (readOnly) return
      setLocalStates((prev) => ({
        ...prev,
        [toothNumber]: {
          ...prev[toothNumber],
          notes,
        },
      }))

      const chart = queryResult.data
      if (!chart) return
      const record = chart.tooth_records?.find(
        (r) => r.tooth_number === toothNumber
      )
      if (record) {
        updateToothMutation.mutate({ id: record.id, data: { notes } })
      }
    },
    [readOnly, queryResult.data, updateToothMutation]
  )

  const selectedToothData = useMemo(
    (): ToothData | undefined =>
      selectedTooth !== null
        ? allTeeth.find((t) => t.number === selectedTooth)
        : undefined,
    [selectedTooth, allTeeth]
  )

  const selectedToothState = useMemo(
    (): ToothState | undefined =>
      selectedTooth !== null ? localStates[selectedTooth] : undefined,
    [selectedTooth, localStates]
  )

  return {
    ...queryResult,
    selectedTooth,
    selectTooth,
    getToothState,
    setToothCondition,
    setSurfaceCondition,
    setToothNotes,
    selectedToothData,
    selectedToothState,
  }
}
