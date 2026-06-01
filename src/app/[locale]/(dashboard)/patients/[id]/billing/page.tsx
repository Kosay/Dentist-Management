'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Plus,
  DollarSign,
  Receipt,
  AlertCircle,
  FileText,
  Eye,
  CreditCard,
} from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { StatsCard } from '@/components/shared/stats-card'
import { DataTable, type Column } from '@/components/shared/data-table'
import { InvoiceForm } from '@/components/billing/invoice-form'
import { InvoiceDetail } from '@/components/billing/invoice-detail'
import { useInvoices } from '@/hooks/use-invoices'
import type { InvoiceStatus } from '@/types/database'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  partially_paid:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export default function PatientBillingPage() {
  const params = useParams()
  const patientId = params.id as string
  const t = useTranslations('billing')
  const tc = useTranslations('common')

  const { data: invoices = [], isLoading } = useInvoices(patientId)

  const [formOpen, setFormOpen] = useState(false)
  const [detailInvoiceId, setDetailInvoiceId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const active = invoices.filter((inv) => inv.status !== 'cancelled')
    const totalBilled = active.reduce((sum, inv) => sum + inv.total, 0)
    const totalPaid = active.reduce((sum, inv) => sum + inv.paid_amount, 0)
    const outstanding = active.reduce((sum, inv) => sum + inv.remaining_amount, 0)
    return { totalBilled, totalPaid, outstanding }
  }, [invoices])

  const recentPayments = useMemo(() => {
    return invoices
      .filter((inv) => inv.paid_amount > 0)
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      .slice(0, 5)
  }, [invoices])

  const invoiceColumns: Column<Record<string, unknown>>[] = [
    {
      key: 'invoice_number',
      label: t('invoice_number'),
      render: (item) => (
        <span className="font-mono font-semibold text-sm">
          {item.invoice_number as string}
        </span>
      ),
    },
    {
      key: 'invoice_date',
      label: t('date'),
      render: (item) => {
        try {
          return format(new Date(item.invoice_date as string), 'MMM dd, yyyy')
        } catch {
          return '—'
        }
      },
    },
    {
      key: 'total',
      label: t('total'),
      render: (item) => (
        <span className="font-semibold tabular-nums">
          {formatCurrency(item.total as number)}
        </span>
      ),
    },
    {
      key: 'paid_amount',
      label: t('paid'),
      render: (item) => (
        <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatCurrency(item.paid_amount as number)}
        </span>
      ),
    },
    {
      key: 'remaining_amount',
      label: t('remaining'),
      render: (item) => {
        const remaining = item.remaining_amount as number
        return (
          <span
            className={cn(
              'tabular-nums',
              remaining > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground'
            )}
          >
            {formatCurrency(remaining)}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: t('status'),
      render: (item) => {
        const status = item.status as InvoiceStatus
        return (
          <Badge
            className={cn('pointer-events-none border-0', STATUS_STYLES[status])}
          >
            {t(status)}
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      label: '',
      render: (item) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation()
            setDetailInvoiceId(item.id as string)
          }}
        >
          <Eye className="size-4" />
        </Button>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (detailInvoiceId) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDetailInvoiceId(null)}
        >
          ← {t('back_to_billing')}
        </Button>
        <InvoiceDetail invoiceId={detailInvoiceId} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={`${invoices.length} ${t('total_invoices').toLowerCase()}`}
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            {t('new_invoice')}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          title={t('total_billed')}
          value={formatCurrency(stats.totalBilled)}
          icon={Receipt}
        />
        <StatsCard
          title={t('total_paid')}
          value={formatCurrency(stats.totalPaid)}
          icon={DollarSign}
        />
        <StatsCard
          title={t('outstanding_balance')}
          value={formatCurrency(stats.outstanding)}
          icon={AlertCircle}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('invoices')}</h3>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <FileText className="size-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              {t('no_invoices')}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="mr-1.5 size-4" />
              {t('new_invoice')}
            </Button>
          </div>
        ) : (
          <DataTable
            columns={invoiceColumns}
            data={invoices as unknown as Record<string, unknown>[]}
            emptyMessage={tc('messages.no_data')}
            onRowClick={(item) => setDetailInvoiceId(item.id as string)}
          />
        )}
      </div>

      {recentPayments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('recent_payments')}</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentPayments.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                        <CreditCard className="size-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {inv.invoice_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(inv.updated_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(inv.paid_amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <InvoiceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        patientId={patientId}
      />
    </div>
  )
}
