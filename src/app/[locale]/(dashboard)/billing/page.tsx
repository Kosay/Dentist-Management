'use client'

import { useState, useMemo } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  DollarSign,
  AlertCircle,
  FileText,
  CreditCard,
  Plus,
  Search,
  Eye,
  Printer,
} from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { StatsCard } from '@/components/shared/stats-card'
import { DataTable, type Column } from '@/components/shared/data-table'
import { InvoiceForm } from '@/components/billing/invoice-form'
import { InvoiceDetail } from '@/components/billing/invoice-detail'
import { useInvoices } from '@/hooks/use-invoices'
import { usePatients } from '@/hooks/use-patients'
import type { InvoiceStatus } from '@/types/database'
import { cn } from '@/lib/utils'
import { formatCurrencyDecimal } from '@/lib/currency'

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  partially_paid:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
}

export default function BillingPage() {
  const locale = useLocale()
  const t = useTranslations('billing')
  const tc = useTranslations('common')
  const formatMoney = (amount: number) => formatCurrencyDecimal(amount, locale)



  const { data: invoices = [], isLoading } = useInvoices()
  const { data: patients = [] } = usePatients()

  const [formOpen, setFormOpen] = useState(false)
  const [detailInvoiceId, setDetailInvoiceId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const patientMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of patients) {
      map[p.id] = p.full_name
    }
    return map
  }, [patients])

  const filteredInvoices = useMemo(() => {
    let result = invoices
    if (statusFilter !== 'all') {
      result = result.filter((inv) => inv.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((inv) => {
        const patientName = patientMap[inv.patient_id]?.toLowerCase() ?? ''
        return (
          patientName.includes(q) ||
          inv.invoice_number.toLowerCase().includes(q)
        )
      })
    }
    return result
  }, [invoices, statusFilter, searchQuery, patientMap])

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = invoices.filter((inv) => {
      const d = new Date(inv.invoice_date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

    const totalRevenue = invoices
      .filter((inv) => inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.paid_amount, 0)

    const outstanding = invoices
      .filter((inv) => inv.status !== 'cancelled' && inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.remaining_amount, 0)

    const invoicesThisMonth = thisMonth.length
    const paymentsThisMonth = thisMonth.reduce(
      (sum, inv) => sum + inv.paid_amount,
      0
    )

    return { totalRevenue, outstanding, invoicesThisMonth, paymentsThisMonth }
  }, [invoices])

  const handlePrint = (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDetailInvoiceId(invoiceId)
  }

  const columns: Column<Record<string, unknown>>[] = [
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
      key: 'patient_id',
      label: t('patient'),
      render: (item) => patientMap[item.patient_id as string] ?? '—',
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
          {formatMoney(item.total as number)}
        </span>
      ),
    },
    {
      key: 'paid_amount',
      label: t('paid'),
      render: (item) => (
        <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatMoney(item.paid_amount as number)}
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
            {formatMoney(remaining)}
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
        <div className="flex items-center gap-1">
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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => handlePrint(item.id as string, e)}
          >
            <Printer className="size-4" />
          </Button>
        </div>
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
        description={t('description')}
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            {t('new_invoice')}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('total_revenue')}
          value={formatMoney(stats.totalRevenue)}
          icon={DollarSign}
        />
        <StatsCard
          title={t('outstanding_balance')}
          value={formatMoney(stats.outstanding)}
          icon={AlertCircle}
        />
        <StatsCard
          title={t('invoices_this_month')}
          value={stats.invoicesThisMonth}
          icon={FileText}
        />
        <StatsCard
          title={t('payments_this_month')}
          value={formatMoney(stats.paymentsThisMonth)}
          icon={CreditCard}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v)}
        >
          <TabsList>
            <TabsTrigger value="all">{tc('labels.all')}</TabsTrigger>
            <TabsTrigger value="draft">{t('draft')}</TabsTrigger>
            <TabsTrigger value="partially_paid">{t('partially_paid')}</TabsTrigger>
            <TabsTrigger value="paid">{t('paid')}</TabsTrigger>
            <TabsTrigger value="cancelled">{t('cancelled')}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <FileText className="size-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            {tc('messages.no_data')}
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
          columns={columns}
          data={filteredInvoices as unknown as Record<string, unknown>[]}
          emptyMessage={tc('messages.no_data')}
          onRowClick={(item) => setDetailInvoiceId(item.id as string)}
        />
      )}

      <InvoiceForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
