'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useUpdateTreatmentPlan } from '@/hooks/use-treatments'
import { getTreatmentTypeLabel } from '@/lib/treatment-types'
import { getToothFDILabel } from '@/components/odontogram/tooth-data'
import { MoreVertical, Pencil, Trash2, ArrowRightCircle } from 'lucide-react'
import type { Tables, TreatmentStatus } from '@/types/database'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<
  TreatmentStatus,
  { color: string; bgColor: string }
> = {
  planned: {
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
  in_progress: {
    color: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-950',
  },
  completed: {
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950',
  },
  cancelled: {
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950',
  },
}

interface TreatmentCardProps {
  treatment: Tables<'treatment_plans'>
  onEdit: (treatment: Tables<'treatment_plans'>) => void
  onDelete: (treatment: Tables<'treatment_plans'>) => void
}

export function TreatmentCard({
  treatment,
  onEdit,
  onDelete,
}: TreatmentCardProps) {
  const t = useTranslations('treatments')
  const tSurfaces = useTranslations('odontogram')
  const tc = useTranslations('common')
  const updateMutation = useUpdateTreatmentPlan()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const statusCfg = STATUS_CONFIG[treatment.status]

  const handleStatusUpdate = async (newStatus: TreatmentStatus) => {
    await updateMutation.mutateAsync({
      id: treatment.id,
      data: { status: newStatus },
    })
  }

  const nextStatus: Partial<Record<TreatmentStatus, TreatmentStatus>> = {
    planned: 'in_progress',
    in_progress: 'completed',
  }

  return (
    <>
      <Card className="group relative transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {treatment.tooth_number && (
                <div className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-primary/10 px-2 text-xs font-bold text-primary tabular-nums">
                  {getToothFDILabel(treatment.tooth_number)}
                </div>
              )}
              <div>
                <CardTitle className="text-sm font-semibold">
                  {getTreatmentTypeLabel(t, treatment.treatment_type)}
                </CardTitle>
                {treatment.surface && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {treatment.surface
                      .split(',')
                      .map((s) => tSurfaces(`surfaces.${s.trim() as 'mesial'}`))
                      .join(', ')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  'pointer-events-none border-0',
                  statusCfg.bgColor,
                  statusCfg.color
                )}
              >
                {t(treatment.status)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  }
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(treatment)}>
                    <Pencil className="mr-2 size-4" />
                    {tc('buttons.edit')}
                  </DropdownMenuItem>
                  {nextStatus[treatment.status] && (
                    <DropdownMenuItem
                      onClick={() =>
                        handleStatusUpdate(nextStatus[treatment.status]!)
                      }
                    >
                      <ArrowRightCircle className="mr-2 size-4" />
                      {t(nextStatus[treatment.status]!)}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setConfirmDelete(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    {tc('buttons.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {treatment.diagnosis && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {treatment.diagnosis}
            </p>
          )}
          <div className="flex items-center justify-between border-t pt-2 text-xs">
            <div className="space-y-0.5">
              <p className="text-muted-foreground">
                {t('cost')}: {treatment.cost.toFixed(2)}
              </p>
              {treatment.discount > 0 && (
                <p className="text-muted-foreground">
                  {t('discount')}: -{treatment.discount.toFixed(2)}
                </p>
              )}
              {treatment.tax > 0 && (
                <p className="text-muted-foreground">
                  {t('tax')}: +{treatment.tax.toFixed(2)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t('final_cost')}</p>
              <p className="text-sm font-bold tabular-nums">
                {treatment.final_cost.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/70">
            {new Date(treatment.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={tc('buttons.delete')}
        description={tc('messages.confirm_delete')}
        onConfirm={() => onDelete(treatment)}
        variant="destructive"
      />
    </>
  )
}
