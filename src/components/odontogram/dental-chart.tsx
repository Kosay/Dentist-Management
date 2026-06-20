'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { ToothSurface } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDentalChart } from '@/hooks/use-dental-chart'
import { useTreatmentPlans } from '@/hooks/use-treatments'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import {
  getStructuralTreatmentCode,
  isStructuralTreatmentType,
} from '@/lib/treatment-types'
import { getUpperArch, getLowerArch, type ToothData } from './tooth-data'
import { OdontogramLegend } from './odontogram-legend'
import { ToothDetailPanel } from './tooth-detail-panel'
import { ToothSvg } from './tooth-svg'
import type { Tables } from '@/types/database'

interface DentalChartProps {
  patientId: string
  isPrimary?: boolean
  readOnly?: boolean
  onToothClick?: (toothNumber: number) => void
  onSurfaceClick?: (toothNumber: number, surface: ToothSurface) => void
}

function ToothRow({
  teeth,
  isUpper,
  chart,
  readOnly,
  midIndex,
  treatmentCodes,
}: {
  teeth: ToothData[]
  isUpper: boolean
  chart: ReturnType<typeof useDentalChart>
  readOnly: boolean
  midIndex: number
  treatmentCodes: Map<number, string>
}) {
  return (
    <div className="overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]">
      <div className="mx-auto flex min-w-max items-center justify-center px-1">
        <div className="flex items-end gap-0.5 sm:gap-1">
          {teeth.map((tooth, i) => {
            const state = chart.getToothState(tooth.number)
            if (!state) return null
            return (
              <div key={tooth.number} className="flex shrink-0 items-center">
                <ToothSvg
                  toothNumber={tooth.number}
                  displayLabel={tooth.displayLabel}
                  surfaces={state.surfaces}
                  condition={state.condition}
                  treatmentCode={treatmentCodes.get(tooth.number)}
                  isSelected={chart.selectedTooth === tooth.number}
                  isUpper={isUpper}
                  readOnly={readOnly}
                  size={34}
                  treatmentTypeCode={toothTreatmentMap[tooth.number]}
                  onSurfaceClick={() => {
                    chart.selectTooth(tooth.number)
                  }}
                />
                {i === midIndex - 1 && (
                  <div className="mx-0.5 h-8 w-px shrink-0 bg-border sm:mx-1 sm:h-10" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function DentalChart({
  patientId,
  isPrimary: initialIsPrimary = false,
  readOnly = false,
  onToothClick,
  onSurfaceClick: onSurfaceExternalClick,
}: DentalChartProps) {
  const t = useTranslations('odontogram')

  const chart = useDentalChart({
    patientId,
    isPrimary: initialIsPrimary,
    readOnly,
    onToothClick,
  })

  const { data: treatments = [] } = useTreatmentPlans(patientId)

  const treatmentCodes = useMemo(() => {
    const statusWeight: Record<string, number> = {
      in_progress: 3,
      planned: 2,
      completed: 1,
      cancelled: 0,
    }
    const map = new Map<number, string>()

    for (const plan of treatments) {
      if (!plan.tooth_number || plan.status === 'cancelled') continue
      if (!isStructuralTreatmentType(plan.treatment_type)) continue
      const code = getStructuralTreatmentCode(plan.treatment_type)
      if (!code) continue

      const existing = map.get(plan.tooth_number)
      const existingPlan = treatments.find(
        (item) =>
          item.tooth_number === plan.tooth_number &&
          getStructuralTreatmentCode(item.treatment_type) === existing
      )
      const currentWeight = statusWeight[plan.status] ?? 0
      const existingWeight = existingPlan
        ? statusWeight[existingPlan.status] ?? 0
        : -1

      if (!existing || currentWeight >= existingWeight) {
        map.set(plan.tooth_number, code)
      }
    }

    return map
  }, [treatments])

  const upperTeeth = getUpperArch(initialIsPrimary)
  const lowerTeeth = getLowerArch(initialIsPrimary)
  const midIndex = initialIsPrimary ? 5 : 8

  if (chart.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <Card className="flex-1">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg">{t('title')}</CardTitle>
            <OdontogramLegend />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 overflow-x-hidden pt-4">
          <p className="text-center text-[10px] text-muted-foreground sm:hidden">
            {t('scroll_hint')}
          </p>
          <div className="flex items-center justify-between px-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            <span>{t('upper_right')}</span>
            <span>{t('upper_left')}</span>
          </div>

          <ToothRow
            teeth={upperTeeth}
            isUpper
            chart={chart}
            readOnly={readOnly}
            midIndex={midIndex}
            treatmentCodes={treatmentCodes}
          />

          <div className="mx-auto h-px w-full bg-border" />

          <ToothRow
            teeth={lowerTeeth}
            isUpper={false}
            chart={chart}
            readOnly={readOnly}
            midIndex={midIndex}
            treatmentCodes={treatmentCodes}
          />

          <div className="flex items-center justify-between px-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            <span>{t('lower_right')}</span>
            <span>{t('lower_left')}</span>
          </div>
        </CardContent>
      </Card>

      {chart.selectedToothData && chart.selectedToothState && (
        <div className="w-full shrink-0 lg:w-80">
          <ToothDetailPanel
            patientId={patientId}
            tooth={chart.selectedToothData}
            toothState={chart.selectedToothState}
            isPrimary={initialIsPrimary}
            readOnly={readOnly}
            toothTreatments={selectedToothTreatments}
            onConditionChange={(cond) =>
              chart.setToothCondition(chart.selectedTooth!, cond)
            }
            onSurfaceConditionChange={(surface, cond) =>
              chart.setSurfaceCondition(chart.selectedTooth!, surface, cond)
            }
            onNotesChange={(notes) =>
              chart.setToothNotes(chart.selectedTooth!, notes)
            }
            onClose={() => chart.selectTooth(null)}
          />
        </div>
      )}
    </div>
  )
}
