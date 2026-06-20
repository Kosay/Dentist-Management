'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Plus, ClipboardList, Clock, CheckCircle2, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { StatsCard } from '@/components/shared/stats-card'
import { DataTable, type Column } from '@/components/shared/data-table'
import { TreatmentForm } from '@/components/treatments/treatment-form'
import { TreatmentCard } from '@/components/treatments/treatment-card'
import { useTreatmentPlans, useUpdateTreatmentPlan } from '@/hooks/use-treatments'
import { getTreatmentTypeLabel } from '@/lib/treatment-types'
import { getToothFDILabel } from '@/components/odontogram/tooth-data'
import type { Tables, TreatmentStatus } from '@/types/database'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<TreatmentStatus, string> = {
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  in_progress:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  completed:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
}

type ViewMode = 'table' | 'cards'

export default function TreatmentsPage() {
  const params = useParams()
  const patientId = params.id as string
  const t = useTranslations('treatments')
  const tc = useTranslations('common')

  const { data: treatments = [], isLoading } = useTreatmentPlans(patientId)
  const updateMutation = useUpdateTreatmentPlan()

  const [formOpen, setFormOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<
    Tables<'treatment_plans'> | undefined
  >()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')

  const filteredTreatments = useMemo(() => {
    if (statusFilter === 'all') return treatments
    return treatments.filter((tp) => tp.status === statusFilter)
  }, [treatments, statusFilter])

  const stats = useMemo(() => {
    const planned = treatments.filter((tp) => tp.status === 'planned').length
    const inProgress = treatments.filter(
      (tp) => tp.status === 'in_progress'
    ).length
    const completed = treatments.filter(
      (tp) => tp.status === 'completed'
    ).length
    const totalCost = treatments
      .filter((tp) => tp.status !== 'cancelled')
      .reduce((sum, tp) => sum + tp.final_cost, 0)

    return { planned, inProgress, completed, totalCost }
  }, [treatments])

  const handleEdit = (treatment: Tables<'treatment_plans'>) => {
    setEditingTreatment(treatment)
    setFormOpen(true)
  }

  const handleDelete = async (treatment: Tables<'treatment_plans'>) => {
    await updateMutation.mutateAsync({
      id: treatment.id,
      data: { deleted_at: new Date().toISOString() },
    })
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingTreatment(undefined)
  }

  const columns: Column<Tables<'treatment_plans'>>[] = [
    {
      key: 'tooth_number',
      label: t('tooth'),
      render: (item) =>
        item.tooth_number ? (
          <span className="font-mono font-semibold">{getToothFDILabel(item.tooth_number as number)}</span>
        ) : (
          '—'
        ),
    },
    {
      key: 'treatment_type',
      label: t('treatment_type'),
      render: (item) => getTreatmentTypeLabel(t, item.treatment_type),
    },
    {
      key: 'status',
      label: t('status'),
      render: (item) => (
        <Badge
          className={cn('pointer-events-none border-0', STATUS_STYLES[item.status])}
        >
          {t(item.status)}
        </Badge>
      ),
    },
    {
      key: 'cost',
      label: t('cost'),
      render: (item) => (
        <span className="tabular-nums">{item.cost.toFixed(2)}</span>
      ),
    },
    {
      key: 'final_cost',
      label: t('final_cost'),
      render: (item) => (
        <span className="font-semibold tabular-nums">
          {item.final_cost.toFixed(2)}
        </span>
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={`${treatments.length} ${t('total_treatments').toLowerCase()}`}
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            {t('new_plan')}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('planned')}
          value={stats.planned}
          icon={ClipboardList}
        />
        <StatsCard
          title={t('in_progress')}
          value={stats.inProgress}
          icon={Clock}
        />
        <StatsCard
          title={t('completed')}
          value={stats.completed}
          icon={CheckCircle2}
        />
        <StatsCard
          title={tc('labels.total')}
          value={stats.totalCost.toFixed(2)}
          icon={DollarSign}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tc('labels.all')}</SelectItem>
            <SelectItem value="planned">{t('planned')}</SelectItem>
            <SelectItem value="in_progress">{t('in_progress')}</SelectItem>
            <SelectItem value="completed">{t('completed')}</SelectItem>
            <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 rounded-lg border bg-muted p-0.5">
          <button
            onClick={() => setViewMode('cards')}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              viewMode === 'cards'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              viewMode === 'table'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Table
          </button>
        </div>
      </div>

      {filteredTreatments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <ClipboardList className="size-10 text-muted-foreground/50" />
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
            {t('new_plan')}
          </Button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTreatments.map((treatment) => (
            <TreatmentCard
              key={treatment.id}
              treatment={treatment}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <DataTable<Record<string, unknown>>
          columns={columns as Column<Record<string, unknown>>[]}
          data={filteredTreatments as unknown as Record<string, unknown>[]}
          emptyMessage={tc('messages.no_data')}
          onRowClick={(item) =>
            handleEdit(item as unknown as Tables<'treatment_plans'>)
          }
        />
      )}

      <TreatmentForm
        open={formOpen}
        onOpenChange={handleFormClose}
        patientId={patientId}
        treatment={editingTreatment}
      />
    </div>
  )
}
