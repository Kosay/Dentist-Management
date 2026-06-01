'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { PatientForm } from '@/components/patients/patient-form'
import { useCreatePatient } from '@/hooks/use-patients'
import { useAuth } from '@/providers/auth-provider'
import type { z } from 'zod'
import type { patientSchema } from '@/lib/validations'

type PatientFormValues = z.infer<typeof patientSchema>

export default function NewPatientPage() {
  const t = useTranslations('patients')
  const tc = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const { clinic, profile } = useAuth()
  const createMutation = useCreatePatient()

  const handleSubmit = (data: PatientFormValues) => {
    if (!clinic?.id || !profile?.id) return

    createMutation.mutate(
      {
        ...data,
        clinic_id: clinic.id,
        created_by: profile.id,
      },
      {
        onSuccess: (patient) => {
          toast.success(tc('messages.save_success'))
          router.push(`/${locale}/patients/${patient.id}`)
        },
        onError: () => {
          toast.error(tc('messages.save_error'))
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('add_patient')}
        action={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(`/${locale}/patients`)}
          >
            <ArrowLeft className="size-4" />
            {tc('buttons.back')}
          </Button>
        }
      />

      <PatientForm onSuccess={handleSubmit} isPending={createMutation.isPending} />
    </div>
  )
}
