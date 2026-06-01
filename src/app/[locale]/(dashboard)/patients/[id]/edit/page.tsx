'use client'

import { useParams, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { PatientForm } from '@/components/patients/patient-form'
import { usePatient, useUpdatePatient } from '@/hooks/use-patients'
import type { z } from 'zod'
import type { patientSchema } from '@/lib/validations'

type PatientFormValues = z.infer<typeof patientSchema>

export default function EditPatientPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('patients')
  const tc = useTranslations('common')

  const { data: patient, isLoading } = usePatient(params.id)
  const updateMutation = useUpdatePatient()

  const handleSubmit = (data: PatientFormValues) => {
    updateMutation.mutate(
      { id: params.id, data },
      {
        onSuccess: () => {
          toast.success(tc('messages.update_success'))
          router.push(`/${locale}/patients/${params.id}`)
        },
        onError: () => {
          toast.error(tc('messages.update_error'))
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!patient) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('edit_patient')}
        description={patient.full_name}
        action={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(`/${locale}/patients/${params.id}`)}
          >
            <ArrowLeft className="size-4" />
            {tc('buttons.back')}
          </Button>
        }
      />

      <PatientForm
        patient={patient}
        onSuccess={handleSubmit}
        isPending={updateMutation.isPending}
      />
    </div>
  )
}
