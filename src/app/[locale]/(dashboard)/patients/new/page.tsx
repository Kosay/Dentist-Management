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
        email: data.email ?? null,
        mobile: data.mobile ?? null,
        full_name_ar: data.full_name_ar ?? null,
        date_of_birth: data.date_of_birth ?? null,
        occupation: data.occupation ?? null,
        address: data.address ?? null,
        companion_name: data.companion_name ?? null,
        companion_mobile: data.companion_mobile ?? null,
        drug_allergies: data.drug_allergies ?? null,
        current_medications: data.current_medications ?? null,
        blood_pressure_notes: data.blood_pressure_notes ?? null,
        medical_notes: data.medical_notes ?? null,
        height_cm: data.height_cm ?? null,
        weight_kg: data.weight_kg ?? null,
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
