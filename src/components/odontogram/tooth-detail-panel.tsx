'use client'

import { useState } from 'react'
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
import { CONDITION_COLORS, CONDITIONS, getDisplayQuadrantLabel, type ToothData } from './tooth-data'
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
    <Badge
      variant="outline"
      className="gap-1.5 border-border"
    >
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
  const tT = useTranslations('treatments')
  const tc = useTranslations('common')
  const toothName = t(`tooth_names.${tooth.nameKey}`)
  const quadrantLabel = getDisplayQuadrantLabel(tooth.quadrant, isPrimary)

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
                <span>{t('quadrant')} {quadrantLabel}</span>
                <span>&middot;</span>
                <ConditionBadge condition={toothState.condition} />
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          {/* Overall condition */}
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

          {/* Implant / Denture quick buttons for missing teeth */}
          {isMissing && !readOnly && (
            <div className="space-y-2">
              <Label>{t('prosthetic_plan')}</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-violet-300 text-violet-700 hover:bg-violet-50"
                  onClick={() => onConditionChange('implant_planned')}
                >
                  {t('conditions.implant_planned')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={() => onConditionChange('denture_planned')}
                >
                  {t('conditions.denture_planned')}
                </Button>
              </div>
            </div>
          )}

          {/* Revert to missing if implant/denture planned */}
          {(toothState.condition === 'implant_planned' || toothState.condition === 'denture_planned') && !readOnly && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => onConditionChange('missing')}
              >
                {t('mark_as_missing')}
              </Button>
            </div>
          )}

          {/* Per-surface conditions */}
          {!isMissing && toothState.condition !== 'implant_planned' && toothState.condition !== 'denture_planned' && (
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
                        {CONDITIONS.filter(c => !['implant_planned', 'denture_planned'].includes(c)).map((c) => (
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

          {/* Treatment plans for this tooth */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('treatments_for_tooth')}</Label>
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setAddTreatmentOpen(true)}
                >
                  <Plus className="size-3" />
                  {t('add_treatment')}
                </Button>
              )}
            </div>
            {toothTreatments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 text-center text-xs text-muted-foreground">
                {t('no_records')}
              </div>
            ) : (
              <div className="space-y-1.5">
                {toothTreatments.map((tp) => (
                  <div
                    key={tp.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">
                        {tT(`types.${tp.treatment_type}` as 'types.filling')}
                      </p>
                      {tp.surface && (
                        <p className="text-[10px] text-muted-foreground">
                          {tp.surface}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={`shrink-0 border-0 text-[10px] ${STATUS_COLORS[tp.status]}`}
                    >
                      {tT(tp.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
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

          {!readOnly && (
            <Button className="w-full" onClick={onClose}>
              {tc('buttons.save')}
            </Button>
          )}
        </CardContent>
      </Card>

      <TreatmentForm
        open={addTreatmentOpen}
        onOpenChange={setAddTreatmentOpen}
        patientId={patientId}
        initialToothNumber={tooth.number}
      />
    </>
  )
}
