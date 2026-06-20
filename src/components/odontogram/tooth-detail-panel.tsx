'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import type { ToothCondition, ToothSurface } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TreatmentForm } from '@/components/treatments/treatment-form'
import { useTreatmentPlans } from '@/hooks/use-treatments'
import { getTreatmentTypeLabel } from '@/lib/treatment-types'
import {
  CONDITION_COLORS,
  CONDITIONS,
  getDisplayQuadrantLabel,
  isMissingLikeCondition,
  type ToothData,
} from './tooth-data'
import type { ToothState } from '@/hooks/use-dental-chart'
import { ToothXraySection } from './tooth-xray-section'
import { TreatmentForm } from '@/components/treatments/treatment-form'
import type { Tables, TreatmentStatus } from '@/types/database'

const STATUS_COLORS: Record<TreatmentStatus, string> = {
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
}

interface ToothDetailPanelProps {
  patientId: string
  tooth: ToothData
  toothState: ToothState
  readOnly?: boolean
  isPrimary?: boolean
  toothTreatments?: Tables<'treatment_plans'>[]
  onConditionChange: (condition: ToothCondition) => void
  onSurfaceConditionChange: (surface: ToothSurface, condition: ToothCondition) => void
  onNotesChange: (notes: string) => void
  onClose: () => void
}

function ConditionBadge({ condition }: { condition: ToothCondition }) {
  const t = useTranslations('odontogram')
  const color = CONDITION_COLORS[condition]
  const isLight = condition === 'healthy'

  return (
    <Badge variant="outline" className="gap-1.5 border-border">
      <span
        className="size-2 rounded-full ring-1 ring-foreground/10"
        style={{ backgroundColor: color }}
      />
      <span className={isLight ? 'text-muted-foreground' : ''}>
        {t(`conditions.${condition}`)}
      </span>
    </Badge>
  )
}

export function ToothDetailPanel({
  patientId,
  tooth,
  toothState,
  readOnly = false,
  isPrimary = false,
  toothTreatments = [],
  onConditionChange,
  onSurfaceConditionChange,
  onNotesChange,
  onClose,
}: ToothDetailPanelProps) {
  const t = useTranslations('odontogram')
  const tt = useTranslations('treatments')
  const tc = useTranslations('common')
  const [treatmentFormOpen, setTreatmentFormOpen] = useState(false)

  const { data: allTreatments = [] } = useTreatmentPlans(patientId)

  const toothTreatments = useMemo(
    () =>
      allTreatments.filter(
        (plan) =>
          plan.tooth_number === tooth.number && plan.status !== 'cancelled'
      ),
    [allTreatments, tooth.number]
  )

  const toothName = t(`tooth_names.${tooth.nameKey}`)
  const quadrantLabel = getDisplayQuadrantLabel(tooth.quadrant, isPrimary)
  const isMissingLike = isMissingLikeCondition(toothState.condition)
  const showReplacementActions =
    toothState.condition === 'missing' ||
    toothState.condition === 'implant_planned' ||
    toothState.condition === 'denture_planned'

  const [addTreatmentOpen, setAddTreatmentOpen] = useState(false)

  const isMissing = toothState.condition === 'missing'

  return (
    <>
      <Card className="w-full">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary tabular-nums">
                  {tooth.displayLabel}
                </span>
                <span>{toothName}</span>
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {t('quadrant')} {quadrantLabel}
                </span>
                <span>&middot;</span>
                <span>FDI {tooth.number}</span>
                <span>&middot;</span>
                <ConditionBadge condition={toothState.condition} />
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M11 3L3 11M3 3l8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          {showReplacementActions && !readOnly && (
            <div className="space-y-2">
              <Label>{t('replacement_planning')}</Label>
              <div className="flex flex-wrap gap-2">
                {toothState.condition !== 'implant_planned' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onConditionChange('implant_planned')}
                  >
                    {t('conditions.implant_planned')}
                  </Button>
                )}
                {toothState.condition !== 'denture_planned' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onConditionChange('denture_planned')}
                  >
                    {t('conditions.denture_planned')}
                  </Button>
                )}
                {toothState.condition !== 'missing' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onConditionChange('missing')}
                  >
                    {t('mark_as_missing')}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('select_condition')}</Label>
            <Select
              value={toothState.condition}
              onValueChange={(val) => onConditionChange(val as ToothCondition)}
              disabled={readOnly}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full ring-1 ring-foreground/10"
                        style={{ backgroundColor: CONDITION_COLORS[c] }}
                      />
                      {t(`conditions.${c}`)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isMissingLike && (
            <div className="space-y-2">
              <Label>{t('select_surface')}</Label>
              <div className="space-y-2">
                {toothState.surfaces.map(({ surface, condition }) => (
                  <div
                    key={surface}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
                  >
                    <span className="text-sm font-medium capitalize">
                      {t(`surfaces.${surface}`)}
                    </span>
                    <Select
                      value={condition}
                      onValueChange={(val) =>
                        onSurfaceConditionChange(surface, val as ToothCondition)
                      }
                      disabled={readOnly}
                    >
                      <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            <span className="flex items-center gap-2">
                              <span
                                className="size-2 rounded-full ring-1 ring-foreground/10"
                                style={{ backgroundColor: CONDITION_COLORS[c] }}
                              />
                              {t(`conditions.${c}`)}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>{t('tooth_treatments')}</Label>
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setTreatmentFormOpen(true)}
                >
                  <Plus className="size-3.5" />
                  {t('add_treatment')}
                </Button>
              )}
            </div>
            {toothTreatments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
                {t('no_tooth_treatments')}
              </div>
            ) : (
              <div className="space-y-2">
                {toothTreatments.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                  >
                    <span className="text-sm font-medium">
                      {getTreatmentTypeLabel(
                        (key) => tt(key),
                        plan.treatment_type
                      )}
                    </span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {tt(plan.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{tc('labels.notes')}</Label>
            <Textarea
              value={toothState.notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder={t('no_records')}
              disabled={readOnly}
              className="min-h-[72px] resize-none text-sm"
            />
          </div>

          <ToothXraySection
            patientId={patientId}
            toothNumber={tooth.number}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      <TreatmentForm
        open={treatmentFormOpen}
        onOpenChange={setTreatmentFormOpen}
        patientId={patientId}
        defaultToothNumber={tooth.number}
      />
    </>
  )
}
