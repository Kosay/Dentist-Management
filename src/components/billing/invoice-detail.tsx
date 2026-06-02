'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  CreditCard,
  Printer,
  FileText,
  Calendar,
  User,
  Building2,
} from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { PaymentForm } from '@/components/billing/payment-form'
import { InvoicePdf } from '@/components/billing/invoice-pdf'
import { useInvoice, usePayments } from '@/hooks/use-invoices'
import { usePatient } from '@/hooks/use-patients'
import { useAuth } from '@/providers/auth-provider'
import type { InvoiceStatus, PaymentMethod } from '@/types/database'
import { cn } from '@/lib/utils'
import { formatCurrencyDecimal } from '@/lib/currency'

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  partially_paid:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  insurance: 'Insurance',
}

interface InvoiceDetailProps {
  invoiceId: string
}

export function InvoiceDetail({ invoiceId }: InvoiceDetailProps) {
  const locale = useLocale()
  const formatMoney = (amount: number) => formatCurrencyDecimal(amount, locale)
  const t = useTranslations('billing')
  const tc = useTranslations('common')
  const { clinic } = useAuth()

  const { data: invoice, isLoading: invoiceLoading } = useInvoice(invoiceId)
  const { data: payments = [], isLoading: paymentsLoading } =
    usePayments(invoiceId)
  const { data: patient } = usePatient(invoice?.patient_id ?? '')

  const [paymentFormOpen, setPaymentFormOpen] = useState(false)
  const [showPrintView, setShowPrintView] = useState(false)

  const handlePrint = () => {
    setShowPrintView(true)
    setTimeout(() => {
      window.print()
      setShowPrintView(false)
    }, 300)
  }

  if (invoiceLoading || paymentsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{t('invoice_not_found')}</p>
      </div>
    )
  }

  const items = invoice.invoice_items ?? []
  const remaining = invoice.remaining_amount

  if (showPrintView) {
    return (
      <InvoicePdf
        invoice={invoice}
        items={items}
        payments={payments}
        patient={patient ?? null}
        clinic={clinic ?? null}
        locale={locale}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              {invoice.invoice_number}
            </h2>
            <Badge
              className={cn(
                'pointer-events-none border-0',
                STATUS_STYLES[invoice.status]
              )}
            >
              {t(invoice.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {format(new Date(invoice.invoice_date), 'MMMM dd, yyyy')}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {remaining > 0 && invoice.status !== 'cancelled' && (
            <Button onClick={() => setPaymentFormOpen(true)}>
              <CreditCard className="mr-1.5 size-4" />
              {t('record_payment')}
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-1.5 size-4" />
            {t('print')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Clinic & Patient Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="size-4" />
                  {t('from')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clinic && (
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{clinic.name}</p>
                    {clinic.address && (
                      <p className="text-muted-foreground">{clinic.address}</p>
                    )}
                    {clinic.phone && (
                      <p className="text-muted-foreground">{clinic.phone}</p>
                    )}
                    {clinic.email && (
                      <p className="text-muted-foreground">{clinic.email}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="size-4" />
                  {t('bill_to')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient && (
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{patient.full_name}</p>
                    {patient.email && (
                      <p className="text-muted-foreground">{patient.email}</p>
                    )}
                    {patient.mobile && (
                      <p className="text-muted-foreground">{patient.mobile}</p>
                    )}
                    {patient.address && (
                      <p className="text-muted-foreground">{patient.address}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4" />
                {t('line_items')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>{t('item_description')}</TableHead>
                    <TableHead className="text-right">{t('quantity')}</TableHead>
                    <TableHead className="text-right">
                      {t('unit_price')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('discount')}
                    </TableHead>
                    <TableHead className="text-right">{t('tax')}</TableHead>
                    <TableHead className="text-right">{t('total')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-red-500">
                        {item.discount > 0
                          ? `-${formatMoney(item.discount)}`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.tax > 0 ? formatMoney(item.tax) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatMoney(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="p-4">
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('subtotal')}</span>
                  <span className="tabular-nums">
                    {formatMoney(invoice.subtotal)}
                  </span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('discount')}
                    </span>
                    <span className="tabular-nums text-red-500">
                      -{formatMoney(invoice.discount)}
                    </span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('tax')}</span>
                    <span className="tabular-nums">
                      +{formatMoney(invoice.tax)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between font-semibold">
                  <span>{t('grand_total')}</span>
                  <span className="text-lg tabular-nums">
                    {formatMoney(invoice.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {tc('labels.notes')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {t('payment_summary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('total')}
                </span>
                <span className="font-semibold tabular-nums">
                  {formatMoney(invoice.total)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('paid')}
                </span>
                <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatMoney(invoice.paid_amount)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('remaining')}</span>
                <span
                  className={cn(
                    'text-lg font-bold tabular-nums',
                    remaining > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  )}
                >
                  {formatMoney(remaining)}
                </span>
              </div>

              {remaining > 0 && invoice.status !== 'cancelled' && (
                <Button
                  className="w-full"
                  onClick={() => setPaymentFormOpen(true)}
                >
                  <CreditCard className="mr-1.5 size-4" />
                  {t('record_payment')}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Payments List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {t('payments')} ({payments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('no_payments')}
                </p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatMoney(payment.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(payment.payment_date),
                            'MMM dd, yyyy'
                          )}
                        </p>
                        {payment.notes && (
                          <p className="text-xs text-muted-foreground">
                            {payment.notes}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {PAYMENT_METHOD_LABELS[payment.payment_method]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentForm
        open={paymentFormOpen}
        onOpenChange={setPaymentFormOpen}
        invoiceId={invoiceId}
        patientId={invoice.patient_id}
        remainingAmount={remaining}
      />
    </div>
  )
}
