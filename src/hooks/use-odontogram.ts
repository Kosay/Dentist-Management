'use client'

import { useCallback, useState } from 'react'
import type { ToothCondition, ToothSurface } from '@/types/database'
import {
  PERMANENT_TEETH,
  PRIMARY_TEETH,
  type SurfaceCondition,
  type ToothData,
} from '@/components/odontogram/tooth-data'

export interface ToothState {
  toothNumber: number
  condition: ToothCondition
  surfaces: SurfaceCondition[]
  notes: string
}

interface UseOdontogramOptions {
  patientId: string
  isPrimary?: boolean
  readOnly?: boolean
  onToothClick?: (toothNumber: number) => void
  onSurfaceClick?: (toothNumber: number, surface: ToothSurface, condition: ToothCondition) => void
}

function initializeTeethState(teeth: ToothData[]): Map<number, ToothState> {
  const map = new Map<number, ToothState>()
  for (const tooth of teeth) {
    map.set(tooth.number, {
      toothNumber: tooth.number,
      condition: 'healthy',
      surfaces: tooth.surfaces.map((s) => ({ surface: s, condition: 'healthy' as ToothCondition })),
      notes: '',
    })
  }
  return map
}

export function useOdontogram({
  isPrimary = false,
  readOnly = false,
  onToothClick,
  onSurfaceClick,
}: UseOdontogramOptions) {
  const teeth = isPrimary ? PRIMARY_TEETH : PERMANENT_TEETH
  const [teethState, setTeethState] = useState<Map<number, ToothState>>(() =>
    initializeTeethState(teeth)
  )
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)

  const getToothState = useCallback(
    (toothNumber: number): ToothState | undefined => teethState.get(toothNumber),
    [teethState]
  )

  const selectTooth = useCallback(
    (toothNumber: number | null) => {
      setSelectedTooth(toothNumber)
      if (toothNumber !== null) {
        onToothClick?.(toothNumber)
      }
    },
    [onToothClick]
  )

  const setToothCondition = useCallback(
    (toothNumber: number, condition: ToothCondition) => {
      if (readOnly) return
      setTeethState((prev) => {
        const next = new Map(prev)
        const existing = next.get(toothNumber)
        if (existing) {
          next.set(toothNumber, { ...existing, condition })
        }
        return next
      })
    },
    [readOnly]
  )

  const setSurfaceCondition = useCallback(
    (toothNumber: number, surface: ToothSurface, condition: ToothCondition) => {
      if (readOnly) return
      onSurfaceClick?.(toothNumber, surface, condition)
      setTeethState((prev) => {
        const next = new Map(prev)
        const existing = next.get(toothNumber)
        if (existing) {
          const updatedSurfaces = existing.surfaces.map((s) =>
            s.surface === surface ? { ...s, condition } : s
          )
          next.set(toothNumber, { ...existing, surfaces: updatedSurfaces })
        }
        return next
      })
    },
    [readOnly, onSurfaceClick]
  )

  const setToothNotes = useCallback(
    (toothNumber: number, notes: string) => {
      if (readOnly) return
      setTeethState((prev) => {
        const next = new Map(prev)
        const existing = next.get(toothNumber)
        if (existing) {
          next.set(toothNumber, { ...existing, notes })
        }
        return next
      })
    },
    [readOnly]
  )

  const selectedToothData = selectedTooth !== null ? teeth.find((t) => t.number === selectedTooth) ?? null : null
  const selectedToothState = selectedTooth !== null ? getToothState(selectedTooth) ?? null : null

  return {
    teeth,
    teethState,
    selectedTooth,
    selectedToothData,
    selectedToothState,
    selectTooth,
    getToothState,
    setToothCondition,
    setSurfaceCondition,
    setToothNotes,
  }
}
