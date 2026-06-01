'use client'

import { useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/providers/auth-provider'
import { useCreatePayment } from '@/hooks/use-invoices'
import type { PaymentMethod } from '@/types/database'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'insurance', label: 'Insurance' },
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

interface PaymentFormValues {
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  notes: string
}

interface PaymentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string
  patientId: string
  remainingAmount: number
}

export function PaymentForm({
  open,
  onOpenChange,
  invoiceId,
  patientId,
  remainingAmount,
}: PaymentFormProps) {
  const t = useTranslations('billing')
  const tc = useTranslations('common')
  const { user, clinic } = useAuth()
  const createPayment = useCreatePayment()

  const form = useForm<PaymentFormValues>({
    defaultValues: {
      amount: remainingAmount,
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      payment_method: 'cash',
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        amount: remainingAmount,
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: 'cash',
        notes: '',
      })
    }
  }, [open, remainingAmount, form])

  const watchedAmount = form.watch('amount')

  const newRemaining = useMemo(() => {
    const amount = Number(watchedAmount) || 0
    return Math.max(0, remainingAmount - amount)
  }, [watchedAmount, remainingAmount])

  const onSubmit = async (values: PaymentFormValues) => {
    if (!clinic?.id || !user?.id) return

    await createPayment.mutateAsync({
      clinic_id: clinic.id,
      invoice_id: invoiceId,
      patient_id: patientId,
      received_by: user.id,
      amount: Number(values.amount),
      payment_date: values.payment_date,
      payment_method: values.payment_method,
      notes: values.notes || null,
    })

    onOpenChange(false)
  }

  const isPending = createPayment.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('record_payment')}</DialogTitle>
          <DialogDescription>{t('payment_form_description')}</DialogDescription>
        </DialogHeader>

        <form
          id="payment-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('current_balance')}
              </span>
              <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('after_payment')}
              </span>
              <span
                className={`font-semibold tabular-nums ${
                  newRemaining === 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {formatCurrency(newRemaining)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('amount')}</Label>
            <Input
              type="number"
              min="0.01"
              max={remainingAmount}
              step="0.01"
              {...form.register('amount', {
                valueAsNumber: true,
                required: t('amount_required'),
                min: { value: 0.01, message: t('amount_positive') },
                max: {
                  value: remainingAmount,
                  message: t('amount_exceeds_remaining'),
                },
              })}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('payment_date')}</Label>
            <Input type="date" {...form.register('payment_date')} />
          </div>

          <div className="space-y-2">
            <Label>{t('payment_method')}</Label>
            <Controller
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {t(method.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>{tc('labels.notes')}</Label>
            <Textarea
              rows={2}
              placeholder={t('payment_notes_placeholder')}
              {...form.register('notes')}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc('buttons.cancel')}
          </Button>
          <Button type="submit" form="payment-form" disabled={isPending}>
            {isPending ? tc('buttons.loading') : t('record_payment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
