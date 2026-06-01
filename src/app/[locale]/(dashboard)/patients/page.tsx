'use client'

import { useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { usePatients, useDeletePatient } from '@/hooks/use-patients'
import { toast } from 'sonner'
import type { Tables } from '@/types/database'

type Patient = Tables<'patients'>

export default function PatientsPage() {
  const t = useTranslations('patients')
  const tc = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const { data: patients = [], isLoading } = usePatients(debouncedSearch || undefined)
  const deleteMutation = useDeletePatient()

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300)
  }, [])

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(tc('messages.delete_success'))
        setDeleteTarget(null)
      },
      onError: () => {
        toast.error(tc('messages.delete_error'))
      },
    })
  }

  const columns: Column<Patient>[] = [
    {
      key: 'file_number',
      label: t('fields.file_number'),
      render: (patient) => (
        <span className="font-medium text-muted-foreground">
          {patient.file_number || '—'}
        </span>
      ),
    },
    {
      key: 'full_name',
      label: t('fields.full_name'),
      render: (patient) => (
        <div>
          <p className="font-medium">{patient.full_name}</p>
          {patient.full_name_ar && (
            <p className="text-xs text-muted-foreground" dir="rtl">
              {patient.full_name_ar}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'mobile',
      label: t('fields.mobile'),
      render: (patient) => (
        <span dir="ltr">{patient.mobile || '—'}</span>
      ),
    },
    {
      key: 'gender',
      label: t('fields.gender'),
      render: (patient) =>
        patient.gender ? (
          <Badge variant="secondary" className="capitalize">
            {t(`fields.${patient.gender}`)}
          </Badge>
        ) : (
          '—'
        ),
    },
    {
      key: 'date_of_birth',
      label: t('fields.date_of_birth'),
      render: (patient) => patient.date_of_birth || '—',
    },
    {
      key: 'actions',
      label: tc('labels.actions'),
      render: (patient) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push(`/${locale}/patients/${patient.id}`)}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push(`/${locale}/patients/${patient.id}/edit`)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleteTarget(patient)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={`${patients.length} ${t('total_patients').toLowerCase()}`}
        action={
          <Button
            className="gap-2"
            onClick={() => router.push(`/${locale}/patients/new`)}
          >
            <Plus className="size-4" />
            {t('add_patient')}
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('search_patients')}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="ps-9"
        />
      </div>

      <DataTable<Record<string, unknown>>
        columns={columns as Column<Record<string, unknown>>[]}
        data={patients as unknown as Record<string, unknown>[]}
        emptyMessage={tc('labels.no_results')}
        onRowClick={(item) =>
          router.push(`/${locale}/patients/${item.id as string}`)
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('delete_patient')}
        description={tc('messages.confirm_delete')}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}
