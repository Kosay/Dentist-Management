'use client'

import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  Pencil,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  User,
  Heart,
  Pill,
  Activity,
  Users,
  CalendarCheck,
  Stethoscope,
  DollarSign,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePatient } from '@/hooks/use-patients'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { PatientTimeline } from '@/components/patients/patient-timeline'

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  )
}

function SwitchBadge({ label, value }: { label: string; value: boolean | null }) {
  if (value === null || value === undefined) return null
  return (
    <Badge variant={value ? 'destructive' : 'secondary'} className="gap-1.5">
      {label}: {value ? 'Yes' : 'No'}
    </Badge>
  )
}

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('patients')

  const { data: patient, isLoading } = usePatient(params.id)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size={28} />
      </div>
    )
  }

  if (!patient) return null

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">{t('patient_details')}</TabsTrigger>
        <TabsTrigger value="timeline">{t('timeline.title')}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-blue-50 p-2.5 dark:bg-blue-950/50">
                <CalendarCheck className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-muted-foreground">
                  {t('timeline.visit')}s
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-950/50">
                <Stethoscope className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-muted-foreground">
                  {t('timeline.treatment')}s
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-violet-50 p-2.5 dark:bg-violet-950/50">
                <DollarSign className="size-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-muted-foreground">Balance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{t('personal_info')}</CardTitle>
                <CardDescription>
                  {patient.full_name_ar && (
                    <span dir="rtl">{patient.full_name_ar}</span>
                  )}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  router.push(`/${locale}/patients/${params.id}/edit`)
                }
              >
                <Pencil className="size-3.5" />
                {t('edit_patient')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                icon={User}
                label={t('fields.gender')}
                value={
                  patient.gender
                    ? t(`fields.${patient.gender}`)
                    : null
                }
              />
              <InfoRow
                icon={User}
                label={t('fields.date_of_birth')}
                value={patient.date_of_birth}
              />
              <InfoRow
                icon={Phone}
                label={t('fields.mobile')}
                value={patient.mobile}
              />
              <InfoRow
                icon={Mail}
                label={t('fields.email')}
                value={patient.email}
              />
              <InfoRow
                icon={MapPin}
                label={t('fields.address')}
                value={patient.address}
              />
              <InfoRow
                icon={Briefcase}
                label={t('fields.occupation')}
                value={patient.occupation}
              />
              {(patient.height_cm || patient.weight_kg) && (
                <div className="flex gap-6">
                  {patient.height_cm && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t('fields.height')}
                      </p>
                      <p className="text-sm font-medium">{patient.height_cm} cm</p>
                    </div>
                  )}
                  {patient.weight_kg && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t('fields.weight')}
                      </p>
                      <p className="text-sm font-medium">{patient.weight_kg} kg</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Companion & Medical combined on right */}
          <div className="space-y-6">
            {/* Companion Info */}
            {(patient.companion_name || patient.companion_mobile) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t('companion_info')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow
                    icon={Users}
                    label={t('fields.companion_name')}
                    value={patient.companion_name}
                  />
                  <InfoRow
                    icon={Phone}
                    label={t('fields.companion_mobile')}
                    value={patient.companion_mobile}
                  />
                </CardContent>
              </Card>
            )}

            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('medical_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <SwitchBadge
                    label={t('fields.smoker')}
                    value={patient.is_smoker}
                  />
                  <SwitchBadge
                    label={t('fields.alcohol')}
                    value={patient.alcohol_consumption}
                  />
                  <SwitchBadge
                    label={t('fields.heart_disease')}
                    value={patient.has_heart_disease}
                  />
                  <SwitchBadge
                    label={t('fields.diabetes')}
                    value={patient.has_diabetes}
                  />
                </div>

                <InfoRow
                  icon={Pill}
                  label={t('fields.drug_allergies')}
                  value={patient.drug_allergies}
                />
                <InfoRow
                  icon={Pill}
                  label={t('fields.current_medications')}
                  value={patient.current_medications}
                />
                <InfoRow
                  icon={Activity}
                  label={t('fields.blood_pressure')}
                  value={patient.blood_pressure_notes}
                />
                <InfoRow
                  icon={Heart}
                  label={t('fields.medical_notes')}
                  value={patient.medical_notes}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="timeline" className="mt-6">
        <PatientTimeline patientId={params.id} />
      </TabsContent>
    </Tabs>
  )
}
