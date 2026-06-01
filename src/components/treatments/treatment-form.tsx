'use client'

import { useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/providers/auth-provider'
import {
  useCreateTreatmentPlan,
  useUpdateTreatmentPlan,
} from '@/hooks/use-treatments'
import type { Tables, TreatmentStatus, ToothSurface } from '@/types/database'

const TREATMENT_TYPES = [
  'Filling',
  'Crown',
  'Root Canal',
  'Extraction',
  'Cleaning',
  'Whitening',
  'Implant',
  'Bridge',
  'Denture',
  'Orthodontics',
  'Veneer',
  'Sealant',
] as const

const SURFACES: ToothSurface[] = [
  'mesial',
  'distal',
  'buccal',
  'lingual',
  'occlusal',
  'incisal',
]

const STATUSES: TreatmentStatus[] = [
  'planned',
  'in_progress',
  'completed',
  'cancelled',
]

interface FormValues {
  tooth_number?: number
  surfaces: string[]
  diagnosis?: string
  treatment_type: string
  description?: string
  cost: number
  discount: number
  tax: number
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
}

interface TreatmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  treatment?: Tables<'treatment_plans'>
}

export function TreatmentForm({
  open,
  onOpenChange,
  patientId,
  treatment,
}: TreatmentFormProps) {
  const t = useTranslations('treatments')
  const tc = useTranslations('common')
  const { user, clinic } = useAuth()
  const createMutation = useCreateTreatmentPlan()
  const updateMutation = useUpdateTreatmentPlan()

  const isEdit = !!treatment

  const form = useForm<FormValues>({
    defaultValues: {
      tooth_number: undefined,
      surfaces: [],
      diagnosis: '',
      treatment_type: '',
      description: '',
      cost: 0,
      discount: 0,
      tax: 0,
      status: 'planned',
      notes: '',
    },
  })

  useEffect(() => {
    if (treatment) {
      form.reset({
        tooth_number: treatment.tooth_number ?? undefined,
        surfaces: treatment.surface ? treatment.surface.split(',') : [],
        diagnosis: treatment.diagnosis ?? '',
        treatment_type: treatment.treatment_type,
        description: treatment.description ?? '',
        cost: treatment.cost,
        discount: treatment.discount,
        tax: treatment.tax,
        status: treatment.status,
        notes: treatment.notes ?? '',
      })
    } else {
      form.reset({
        tooth_number: undefined,
        surfaces: [],
        diagnosis: '',
        treatment_type: '',
        description: '',
        cost: 0,
        discount: 0,
        tax: 0,
        status: 'planned',
        notes: '',
      })
    }
  }, [treatment, form])

  const watchedCost = form.watch('cost')
  const watchedDiscount = form.watch('discount')
  const watchedTax = form.watch('tax')

  const finalCost = useMemo(() => {
    const cost = Number(watchedCost) || 0
    const discount = Number(watchedDiscount) || 0
    const tax = Number(watchedTax) || 0
    return Math.max(0, cost - discount + tax)
  }, [watchedCost, watchedDiscount, watchedTax])

  const onSubmit = async (values: FormValues) => {
    if (!clinic?.id || !user?.id) return

    const payload = {
      clinic_id: clinic.id,
      patient_id: patientId,
      dentist_id: user.id,
      tooth_number: values.tooth_number ?? null,
      surface: values.surfaces.length > 0 ? values.surfaces.join(',') : null,
      diagnosis: values.diagnosis || null,
      treatment_type: values.treatment_type,
      description: values.description || null,
      cost: values.cost,
      discount: values.discount,
      tax: values.tax,
      status: values.status,
      notes: values.notes || null,
    }

    if (isEdit && treatment) {
      await updateMutation.mutateAsync({ id: treatment.id, data: payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onOpenChange(false)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('edit_plan') : t('new_plan')}</DialogTitle>
          <DialogDescription>
            {isEdit ? tc('messages.update_success') : t('new_plan')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <form
            id="treatment-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-1"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tooth_number">{t('tooth')}</Label>
                <Controller
                  control={form.control}
                  name="tooth_number"
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() ?? ''}
                      onValueChange={(val) =>
                        field.onChange(val ? Number(val) : undefined)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('tooth')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 32 }, (_, i) => i + 1).map(
                          (n) => (
                            <SelectItem key={n} value={n.toString()}>
                              {n}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t('status')}</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('surface')}</Label>
              <div className="flex flex-wrap gap-3">
                <Controller
                  control={form.control}
                  name="surfaces"
                  render={({ field }) => (
                    <>
                      {SURFACES.map((surface) => (
                        <label
                          key={surface}
                          className="flex items-center gap-1.5 text-sm"
                        >
                          <Checkbox
                            checked={field.value.includes(surface)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, surface])
                              } else {
                                field.onChange(
                                  field.value.filter(
                                    (s: string) => s !== surface
                                  )
                                )
                              }
                            }}
                          />
                          <span className="capitalize">{surface}</span>
                        </label>
                      ))}
                    </>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment_type">{t('treatment_type')}</Label>
              <Controller
                control={form.control}
                name="treatment_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('treatment_type')} />
                    </SelectTrigger>
                    <SelectContent>
                      {TREATMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.treatment_type && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.treatment_type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">{t('diagnosis') ?? 'Diagnosis'}</Label>
              <Textarea
                id="diagnosis"
                rows={2}
                placeholder="Diagnosis..."
                {...form.register('diagnosis')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {tc('labels.description')}
              </Label>
              <Textarea
                id="description"
                rows={2}
                placeholder={tc('labels.description')}
                {...form.register('description')}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cost">{t('cost')}</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('cost', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">{t('discount')}</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('discount', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">{t('tax')}</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('tax', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('final_cost')}</span>
                <span className="text-lg font-bold tabular-nums">
                  {finalCost.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{tc('labels.notes')}</Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder={tc('labels.notes')}
                {...form.register('notes')}
              />
            </div>
          </form>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc('buttons.cancel')}
          </Button>
          <Button type="submit" form="treatment-form" disabled={isPending}>
            {isPending ? tc('buttons.loading') : tc('buttons.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
