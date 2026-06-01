'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import type { z } from 'zod'

import { patientSchema } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import type { Tables } from '@/types/database'

type PatientFormValues = z.infer<typeof patientSchema>
type Patient = Tables<'patients'>

interface PatientFormProps {
  patient?: Patient
  onSuccess: (data: PatientFormValues) => void
  isPending?: boolean
}

export function PatientForm({ patient, onSuccess, isPending }: PatientFormProps) {
  const t = useTranslations('patients')
  const tc = useTranslations('common')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PatientFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(patientSchema) as any,
    defaultValues: {
      full_name: patient?.full_name ?? '',
      full_name_ar: patient?.full_name_ar ?? '',
      gender: patient?.gender ?? undefined,
      date_of_birth: patient?.date_of_birth ?? '',
      height_cm: patient?.height_cm ?? undefined,
      weight_kg: patient?.weight_kg ?? undefined,
      occupation: patient?.occupation ?? '',
      address: patient?.address ?? '',
      mobile: patient?.mobile ?? '',
      email: patient?.email ?? '',
      companion_name: patient?.companion_name ?? '',
      companion_mobile: patient?.companion_mobile ?? '',
      drug_allergies: patient?.drug_allergies ?? '',
      current_medications: patient?.current_medications ?? '',
      is_smoker: patient?.is_smoker ?? false,
      alcohol_consumption: patient?.alcohol_consumption ?? false,
      has_heart_disease: patient?.has_heart_disease ?? false,
      has_diabetes: patient?.has_diabetes ?? false,
      blood_pressure_notes: patient?.blood_pressure_notes ?? '',
      medical_notes: patient?.medical_notes ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSuccess)} className="space-y-6">
      <Tabs defaultValue="personal">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="personal">{t('personal_info')}</TabsTrigger>
          <TabsTrigger value="companion">{t('companion_info')}</TabsTrigger>
          <TabsTrigger value="medical">{t('medical_info')}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  {t('fields.full_name')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  aria-invalid={!!errors.full_name}
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name_ar">{t('fields.full_name_ar')}</Label>
                <Input
                  id="full_name_ar"
                  dir="rtl"
                  {...register('full_name_ar')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('fields.gender')}</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('fields.gender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('fields.male')}</SelectItem>
                        <SelectItem value="female">{t('fields.female')}</SelectItem>
                        <SelectItem value="other">{t('fields.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">{t('fields.date_of_birth')}</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...register('date_of_birth')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height_cm">{t('fields.height')}</Label>
                <Input
                  id="height_cm"
                  type="number"
                  {...register('height_cm', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight_kg">{t('fields.weight')}</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  {...register('weight_kg', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">{t('fields.occupation')}</Label>
                <Input id="occupation" {...register('occupation')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">
                  {t('fields.mobile')}{' '}
                  <span className="text-xs text-muted-foreground">({tc('labels.optional')})</span>
                </Label>
                <Input id="mobile" type="tel" dir="ltr" {...register('mobile')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {t('fields.email')}{' '}
                  <span className="text-xs text-muted-foreground">({tc('labels.optional')})</span>
                </Label>
                <Input id="email" type="email" dir="ltr" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">{t('fields.address')}</Label>
                <Input id="address" {...register('address')} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companion" className="mt-6">
          <Card>
            <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companion_name">{t('fields.companion_name')}</Label>
                <Input id="companion_name" {...register('companion_name')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companion_mobile">{t('fields.companion_mobile')}</Label>
                <Input
                  id="companion_mobile"
                  type="tel"
                  dir="ltr"
                  {...register('companion_mobile')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="mt-6">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="drug_allergies">{t('fields.drug_allergies')}</Label>
                  <Textarea
                    id="drug_allergies"
                    rows={3}
                    {...register('drug_allergies')}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="current_medications">
                    {t('fields.current_medications')}
                  </Label>
                  <Textarea
                    id="current_medications"
                    rows={3}
                    {...register('current_medications')}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="is_smoker"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <Label htmlFor="is_smoker" className="cursor-pointer">
                        {t('fields.smoker')}
                      </Label>
                      <Switch
                        id="is_smoker"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="alcohol_consumption"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <Label htmlFor="alcohol_consumption" className="cursor-pointer">
                        {t('fields.alcohol')}
                      </Label>
                      <Switch
                        id="alcohol_consumption"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="has_heart_disease"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <Label htmlFor="has_heart_disease" className="cursor-pointer">
                        {t('fields.heart_disease')}
                      </Label>
                      <Switch
                        id="has_heart_disease"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="has_diabetes"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <Label htmlFor="has_diabetes" className="cursor-pointer">
                        {t('fields.diabetes')}
                      </Label>
                      <Switch
                        id="has_diabetes"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_pressure_notes">
                  {t('fields.blood_pressure')}
                </Label>
                <Textarea
                  id="blood_pressure_notes"
                  rows={2}
                  {...register('blood_pressure_notes')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_notes">{t('fields.medical_notes')}</Label>
                <Textarea
                  id="medical_notes"
                  rows={4}
                  {...register('medical_notes')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending} className="min-w-[120px]">
          {isPending && <Loader2 className="me-2 size-4 animate-spin" />}
          {patient ? tc('buttons.update') : tc('buttons.save')}
        </Button>
      </div>
    </form>
  )
}
