'use client'

import { useTranslations } from 'next-intl'
import type { ToothSurface } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOdontogram } from '@/hooks/use-odontogram'
import { getUpperArch, getLowerArch, type ToothData } from './tooth-data'
import { OdontogramLegend } from './odontogram-legend'
import { ToothDetailPanel } from './tooth-detail-panel'
import { ToothSvg } from './tooth-svg'

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
}: {
  teeth: ToothData[]
  isUpper: boolean
  chart: ReturnType<typeof useOdontogram>
  readOnly: boolean
  midIndex: number
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-end gap-0.5">
        {teeth.map((tooth, i) => {
          const state = chart.getToothState(tooth.number)
          if (!state) return null
          return (
            <div key={tooth.number} className="flex items-center">
              <ToothSvg
                toothNumber={tooth.number}
                surfaces={state.surfaces}
                condition={state.condition}
                isSelected={chart.selectedTooth === tooth.number}
                isUpper={isUpper}
                readOnly={readOnly}
                size={44}
                onSurfaceClick={() => {
                  chart.selectTooth(tooth.number)
                }}
              />
              {i === midIndex - 1 && (
                <div className="mx-1 h-10 w-px bg-border" />
              )}
            </div>
          )
        })}
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

  const chart = useOdontogram({
    patientId,
    isPrimary: initialIsPrimary,
    readOnly,
    onToothClick,
    onSurfaceClick: onSurfaceExternalClick
      ? (toothNumber, surface) => onSurfaceExternalClick(toothNumber, surface)
      : undefined,
  })

  const upperTeeth = getUpperArch(initialIsPrimary)
  const lowerTeeth = getLowerArch(initialIsPrimary)
  const midIndex = initialIsPrimary ? 5 : 8

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <Card className="flex-1">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg">{t('title')}</CardTitle>
            <OdontogramLegend />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
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
          />

          <div className="mx-auto h-px w-full bg-border" />

          <ToothRow
            teeth={lowerTeeth}
            isUpper={false}
            chart={chart}
            readOnly={readOnly}
            midIndex={midIndex}
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
            tooth={chart.selectedToothData}
            toothState={chart.selectedToothState}
            readOnly={readOnly}
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
