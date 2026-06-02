'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseErrorMessage } from '@/lib/supabase/errors'
import { useAuth } from '@/providers/auth-provider'
import type {
  Tables,
  InsertTables,
  UpdateTables,
  ToothCondition,
  ToothSurface,
} from '@/types/database'
import {
  PERMANENT_TEETH,
  PRIMARY_TEETH,
  getDisplayQuadrantLabel,
  type ToothData,
} from '@/components/odontogram/tooth-data'
import type { SurfaceCondition } from '@/components/odontogram/tooth-data'

type DentalChart = Tables<'dental_charts'>
type ToothRecord = Tables<'tooth_records'>
type SurfaceRecord = Tables<'surface_records'>
type ToothRecordUpdate = UpdateTables<'tooth_records'>
type SurfaceRecordUpdate = UpdateTables<'surface_records'>
type ToothRecordInsert = InsertTables<'tooth_records'>
type SurfaceRecordInsert = InsertTables<'surface_records'>

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

function buildDefaultState(tooth: ToothData): ToothState {
  return {
    condition: 'healthy',
    surfaces: tooth.surfaces.map((surface) => ({
      surface,
      condition: 'healthy' as ToothCondition,
    })),
    notes: '',
  }
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
  const { clinic, loading: authLoading } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [localStates, setLocalStates] = useState<Record<number, ToothState>>({})
  const [isSaving, setIsSaving] = useState(false)

  const allTeeth = useMemo(
    () => (isPrimary ? PRIMARY_TEETH : PERMANENT_TEETH),
    [isPrimary]
  )

  const queryKey = ['dental_chart', clinic?.id, patientId, isPrimary] as const

  const queryResult = useQuery<DentalChartWithRecords | null, Error>({
    queryKey,
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
    const states: Record<number, ToothState> = {}

    for (const tooth of allTeeth) {
      const record = chart?.tooth_records?.find(
        (r) => r.tooth_number === tooth.number
      )

      if (record) {
        states[tooth.number] = {
          condition: record.condition,
          surfaces: tooth.surfaces.map((surface) => {
            const surfaceRecord = record.surface_records?.find(
              (r) => r.surface === surface
            )
            return {
              surface,
              condition: surfaceRecord?.condition ?? 'healthy',
            }
          }),
          notes: record.notes ?? '',
        }
      } else {
        states[tooth.number] = buildDefaultState(tooth)
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
      if (!data) throw new Error('Unable to save tooth')
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
      if (!data) throw new Error('Unable to save surface')
      return data as unknown as SurfaceRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dental_chart'] })
    },
  })

  const ensureSurfaceRecords = useCallback(
    async (
      record: ToothRecord & { surface_records: SurfaceRecord[] },
      tooth: ToothData,
      state: ToothState
    ): Promise<ToothRecord & { surface_records: SurfaceRecord[] }> => {
      if (!clinic?.id) {
        throw new Error('Clinic not found')
      }

      const existingSurfaces = new Set(
        (record.surface_records ?? []).map((item) => item.surface)
      )
      const missingSurfaces = state.surfaces.filter(
        (surfaceState) => !existingSurfaces.has(surfaceState.surface)
      )

      if (missingSurfaces.length === 0) {
        return record
      }

      const surfaceInserts: SurfaceRecordInsert[] = missingSurfaces.map(
        (surfaceState) => ({
          tooth_record_id: record.id,
          clinic_id: clinic.id,
          surface: surfaceState.surface,
          condition: surfaceState.condition,
        })
      )

      const { data: inserted, error } = await supabase
        .from('surface_records')
        .insert(surfaceInserts as never)
        .select()

      if (error) throw error

      const merged = {
        ...record,
        surface_records: [
          ...(record.surface_records ?? []),
          ...((inserted ?? []) as unknown as SurfaceRecord[]),
        ],
      }

      queryClient.setQueryData<DentalChartWithRecords | null>(queryKey, (current) => {
        if (!current) return current
        return {
          ...current,
          tooth_records: (current.tooth_records ?? []).map((item) =>
            item.id === record.id ? merged : item
          ),
        }
      })

      return merged
    },
    [clinic?.id, supabase, queryClient, queryKey]
  )

  const getOrCreateChart = useCallback(async (): Promise<DentalChartWithRecords> => {
    if (!clinic?.id) {
      throw new Error('Clinic not found')
    }

    if (queryResult.data) {
      return queryResult.data
    }

    const { data, error } = await supabase
      .from('dental_charts')
      .insert({
        clinic_id: clinic.id,
        patient_id: patientId,
        is_primary: isPrimary,
      } as never)
      .select('*, tooth_records(*, surface_records(*))')
      .single()

    if (error) throw error

    const chart = data as unknown as DentalChartWithRecords
    queryClient.setQueryData(queryKey, chart)
    return chart
  }, [clinic?.id, queryResult.data, patientId, isPrimary, supabase, queryClient, queryKey])

  const getOrCreateToothRecord = useCallback(
    async (
      chart: DentalChartWithRecords,
      tooth: ToothData,
      state: ToothState
    ): Promise<ToothRecord & { surface_records: SurfaceRecord[] }> => {
      if (!clinic?.id) {
        throw new Error('Clinic not found')
      }

      let existing = chart.tooth_records?.find(
        (record) => record.tooth_number === tooth.number
      )

      if (!existing) {
        const { data: existingRow, error: lookupError } = await supabase
          .from('tooth_records')
          .select('*, surface_records(*)')
          .eq('chart_id', chart.id)
          .eq('tooth_number', tooth.number)
          .maybeSingle()

        if (lookupError) throw lookupError
        if (existingRow) {
          existing = existingRow as unknown as ToothRecord & {
            surface_records: SurfaceRecord[]
          }
          return ensureSurfaceRecords(existing, tooth, state)
        }
      }

      if (existing) {
        return ensureSurfaceRecords(existing, tooth, state)
      }

      const toothInsert: ToothRecordInsert = {
        chart_id: chart.id,
        clinic_id: clinic.id,
        tooth_number: tooth.number,
        tooth_name: tooth.nameKey,
        quadrant: getDisplayQuadrantLabel(tooth.quadrant, isPrimary),
        position: tooth.position,
        condition: state.condition,
        notes: state.notes || null,
      }

      const { data: toothRecord, error: toothError } = await supabase
        .from('tooth_records')
        .insert(toothInsert as never)
        .select()
        .single()

      if (toothError) throw toothError

      const record = toothRecord as unknown as ToothRecord

      const surfaceInserts: SurfaceRecordInsert[] = state.surfaces.map(
        (surfaceState) => ({
          tooth_record_id: record.id,
          clinic_id: clinic.id,
          surface: surfaceState.surface,
          condition: surfaceState.condition,
        })
      )

      const { data: surfaceRecords, error: surfaceError } = await supabase
        .from('surface_records')
        .insert(surfaceInserts as never)
        .select()

      if (surfaceError) throw surfaceError

      const fullRecord = {
        ...record,
        surface_records: (surfaceRecords ?? []) as unknown as SurfaceRecord[],
      }

      queryClient.setQueryData<DentalChartWithRecords | null>(queryKey, (current) => {
        if (!current) {
          return { ...chart, tooth_records: [fullRecord] }
        }
        const withoutDuplicate = (current.tooth_records ?? []).filter(
          (item) => item.tooth_number !== tooth.number
        )
        return {
          ...current,
          tooth_records: [...withoutDuplicate, fullRecord],
        }
      })

      return fullRecord
    },
    [clinic?.id, isPrimary, supabase, queryClient, queryKey, ensureSurfaceRecords]
  )

  const resolveToothRecord = useCallback(
    async (toothNumber: number, stateOverride?: ToothState) => {
      if (authLoading) {
        throw new Error('Please wait, session is loading')
      }
      if (!clinic?.id) {
        throw new Error('Clinic not found. Please refresh the page or sign in again.')
      }

      const tooth = allTeeth.find((item) => item.number === toothNumber)
      const state = stateOverride ?? localStates[toothNumber]
      if (!tooth || !state) {
        throw new Error('Tooth not found')
      }

      const chart = await getOrCreateChart()
      return getOrCreateToothRecord(chart, tooth, state)
    },
    [authLoading, clinic?.id, allTeeth, localStates, getOrCreateChart, getOrCreateToothRecord]
  )

  const getToothState = useCallback(
    (toothNumber: number): ToothState | undefined => localStates[toothNumber],
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

      const tooth = allTeeth.find((item) => item.number === toothNumber)
      if (!tooth) return

      const nextState: ToothState = {
        ...(localStates[toothNumber] ?? buildDefaultState(tooth)),
        condition,
      }

      setLocalStates((prev) => ({
        ...prev,
        [toothNumber]: nextState,
      }))

      void (async () => {
        setIsSaving(true)
        try {
          const record = await resolveToothRecord(toothNumber, nextState)
          if (record.condition !== condition) {
            await updateToothMutation.mutateAsync({
              id: record.id,
              data: { condition },
            })
          }
        } catch (error) {
          toast.error(getSupabaseErrorMessage(error, 'Failed to save tooth'))
        } finally {
          setIsSaving(false)
        }
      })()
    },
    [readOnly, allTeeth, localStates, resolveToothRecord, updateToothMutation]
  )

  const setSurfaceCondition = useCallback(
    (toothNumber: number, surface: ToothSurface, condition: ToothCondition) => {
      if (readOnly) return

      const tooth = allTeeth.find((item) => item.number === toothNumber)
      const current = localStates[toothNumber] ?? (tooth ? buildDefaultState(tooth) : null)
      if (!current) return

      const nextState: ToothState = {
        ...current,
        surfaces: current.surfaces.map((surfaceState) =>
          surfaceState.surface === surface
            ? { ...surfaceState, condition }
            : surfaceState
        ),
      }

      setLocalStates((prev) => ({
        ...prev,
        [toothNumber]: nextState,
      }))

      void (async () => {
        setIsSaving(true)
        try {
          const record = await resolveToothRecord(toothNumber, nextState)
          const surfaceRecord = record.surface_records?.find(
            (item) => item.surface === surface
          )
          if (!surfaceRecord) {
            throw new Error('Surface record not found')
          }
          await updateSurfaceMutation.mutateAsync({
            id: surfaceRecord.id,
            data: { condition },
          })
        } catch (error) {
          toast.error(getSupabaseErrorMessage(error, 'Failed to save surface'))
        } finally {
          setIsSaving(false)
        }
      })()
    },
    [readOnly, allTeeth, localStates, resolveToothRecord, updateSurfaceMutation]
  )

  const setToothNotes = useCallback(
    (toothNumber: number, notes: string) => {
      if (readOnly) return

      const tooth = allTeeth.find((item) => item.number === toothNumber)
      const current = localStates[toothNumber] ?? (tooth ? buildDefaultState(tooth) : null)
      if (!current) return

      const nextState: ToothState = { ...current, notes }

      setLocalStates((prev) => ({
        ...prev,
        [toothNumber]: nextState,
      }))

      void (async () => {
        setIsSaving(true)
        try {
          const record = await resolveToothRecord(toothNumber, nextState)
          await updateToothMutation.mutateAsync({
            id: record.id,
            data: { notes },
          })
        } catch (error) {
          toast.error(getSupabaseErrorMessage(error, 'Failed to save notes'))
        } finally {
          setIsSaving(false)
        }
      })()
    },
    [readOnly, allTeeth, localStates, resolveToothRecord, updateToothMutation]
  )

  const selectedToothData = useMemo(
    (): ToothData | undefined =>
      selectedTooth !== null
        ? allTeeth.find((tooth) => tooth.number === selectedTooth)
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
    isSaving,
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
