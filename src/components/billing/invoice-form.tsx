'use client'

import { useEffect, useMemo } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useLocale, useTranslations } from 'next-intl'
import { Plus, Trash2, ClipboardList } from 'lucide-react'
import { format } from 'date-fns'

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
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/providers/auth-provider'
import { useCreateInvoice } from '@/hooks/use-invoices'
import { usePatients } from '@/hooks/use-patients'
import { useTreatmentPlans } from '@/hooks/use-treatments'
import type { Tables } from '@/types/database'
import { formatCurrencyDecimal } from '@/lib/currency'

interface InvoiceItemValues {
  description: string
  quantity: number
  unit_price: number
  discount: number
  tax: number
  treatment_plan_id?: string
}

interface InvoiceFormValues {
  patient_id: string
  invoice_date: string
  notes: string
  items: InvoiceItemValues[]
}

interface InvoiceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId?: string
  invoice?: Tables<'invoices'>
}

export function InvoiceForm({
  open,
  onOpenChange,
  patientId,
  invoice,
}: InvoiceFormProps) {
  const locale = useLocale()
  const t = useTranslations('billing')
  const tc = useTranslations('common')
  const formatMoney = (amount: number) => formatCurrencyDecimal(amount, locale)
  const { user, clinic } = useAuth()
  const createMutation = useCreateInvoice()
  const { data: patients = [] } = usePatients()

  const isEdit = !!invoice

  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      patient_id: patientId ?? '',
      invoice_date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      items: [
        { description: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const selectedPatientId = form.watch('patient_id')
  const { data: treatments = [] } = useTreatmentPlans(
    selectedPatientId || undefined
  )

  const completedTreatments = useMemo(
    () => treatments.filter((tp) => tp.status === 'completed'),
    [treatments]
  )

  useEffect(() => {
    if (open) {
      form.reset({
        patient_id: patientId ?? '',
        invoice_date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
        items: [
          { description: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 },
        ],
      })
    }
  }, [open, patientId, form])

  const watchedItems = form.watch('items')

  const calculations = useMemo(() => {
    const lineItems = (watchedItems ?? []).map((item) => {
      const qty = Number(item.quantity) || 0
      const price = Number(item.unit_price) || 0
      const discount = Number(item.discount) || 0
      const tax = Number(item.tax) || 0
      const lineTotal = qty * price - discount + tax
      return { ...item, lineTotal: Math.max(0, lineTotal) }
    })

    const subtotal = lineItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
      0
    )
    const totalDiscount = lineItems.reduce(
      (sum, item) => sum + (Number(item.discount) || 0),
      0
    )
    const totalTax = lineItems.reduce(
      (sum, item) => sum + (Number(item.tax) || 0),
      0
    )
    const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax)

    return { lineItems, subtotal, totalDiscount, totalTax, grandTotal }
  }, [watchedItems])

  const handleAddFromTreatments = () => {
    for (const tp of completedTreatments) {
      append({
        description: `${tp.treatment_type}${tp.tooth_number ? ` (Tooth #${tp.tooth_number})` : ''}`,
        quantity: 1,
        unit_price: tp.final_cost,
        discount: 0,
        tax: 0,
        treatment_plan_id: tp.id,
      })
    }
  }

  const onSubmit = async (values: InvoiceFormValues) => {
    if (!clinic?.id || !user?.id) return

    const items = values.items.map((item) => ({
      clinic_id: clinic.id,
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      discount: Number(item.discount),
      tax: Number(item.tax),
      total:
        Math.max(
          0,
          Number(item.quantity) * Number(item.unit_price) -
            Number(item.discount) +
            Number(item.tax)
        ),
      treatment_plan_id: item.treatment_plan_id ?? null,
    }))

    await createMutation.mutateAsync({
      invoice: {
        clinic_id: clinic.id,
        patient_id: values.patient_id,
        created_by: user.id,
        invoice_number: `INV-${Date.now()}`,
        invoice_date: values.invoice_date,
        subtotal: calculations.subtotal,
        discount: calculations.totalDiscount,
        tax: calculations.totalTax,
        total: calculations.grandTotal,
        paid_amount: 0,
        status: 'draft',
        notes: values.notes || null,
      },
      items,
    })

    onOpenChange(false)
  }

  const isPending = createMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('edit_invoice') : t('new_invoice')}
          </DialogTitle>
          <DialogDescription>{t('invoice_form_description')}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <form
            id="invoice-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 px-1"
          >
            <div className="grid grid-cols-2 gap-4">
              {!patientId && (
                <div className="space-y-2">
                  <Label>{t('patient')}</Label>
                  <Controller
                    control={form.control}
                    name="patient_id"
                    rules={{ required: t('patient_required') }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('select_patient')} />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.patient_id && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.patient_id.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('invoice_date')}</Label>
                <Input type="date" {...form.register('invoice_date')} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  {t('line_items')}
                </Label>
                <div className="flex gap-2">
                  {selectedPatientId && completedTreatments.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddFromTreatments}
                    >
                      <ClipboardList className="mr-1.5 size-4" />
                      {t('add_from_treatments')}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        description: '',
                        quantity: 1,
                        unit_price: 0,
                        discount: 0,
                        tax: 0,
                      })
                    }
                  >
                    <Plus className="mr-1.5 size-4" />
                    {t('add_item')}
                  </Button>
                </div>
              </div>

              {fields.map((field, index) => {
                const lineTotal = calculations.lineItems[index]?.lineTotal ?? 0
                return (
                  <div
                    key={field.id}
                    className="rounded-lg border bg-muted/30 p-3 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          {t('item_description')}
                        </Label>
                        <Input
                          placeholder={t('item_description_placeholder')}
                          {...form.register(`items.${index}.description`, {
                            required: t('description_required'),
                          })}
                        />
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="mt-6 text-destructive hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {t('quantity')}
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          {...form.register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {t('unit_price')}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...form.register(`items.${index}.unit_price`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {t('discount')}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...form.register(`items.${index}.discount`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {t('tax')}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...form.register(`items.${index}.tax`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {t('line_total')}
                        </Label>
                        <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-semibold tabular-nums">
                          {formatMoney(lineTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span className="tabular-nums">
                  {formatMoney(calculations.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('discount')}</span>
                <span className="tabular-nums text-red-500">
                  -{formatMoney(calculations.totalDiscount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('tax')}</span>
                <span className="tabular-nums">
                  +{formatMoney(calculations.totalTax)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>{t('grand_total')}</span>
                <span className="text-lg tabular-nums">
                  {formatMoney(calculations.grandTotal)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{tc('labels.notes')}</Label>
              <Textarea
                rows={2}
                placeholder={t('notes_placeholder')}
                {...form.register('notes')}
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc('buttons.cancel')}
          </Button>
          <Button type="submit" form="invoice-form" disabled={isPending}>
            {isPending ? tc('buttons.loading') : t('save_draft')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
