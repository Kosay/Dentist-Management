'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import type { Clinic } from '@/providers/auth-provider'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const clinicFormSchema = z.object({
  name: z.string().min(2, { error: 'Clinic name must be at least 2 characters' }),
  name_ar: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  address_ar: z.string().optional(),
  license_number: z.string().optional(),
  max_users: z.number().int().min(1),
  subscription_status: z.enum(['active', 'frozen', 'expired', 'cancelled']),
})

type ClinicFormValues = z.infer<typeof clinicFormSchema>

interface ClinicFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clinic: Clinic | null
  onSuccess: () => void
}

export function ClinicFormDialog({ open, onOpenChange, clinic, onSuccess }: ClinicFormDialogProps) {
  const t = useTranslations('admin')
  const ts = useTranslations('settings')
  const tc = useTranslations('common')
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const isEditing = !!clinic

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: clinic
      ? {
          name: clinic.name,
          name_ar: clinic.name_ar ?? '',
          email: clinic.email ?? '',
          phone: clinic.phone ?? '',
          address: clinic.address ?? '',
          address_ar: clinic.address_ar ?? '',
          license_number: clinic.license_number ?? '',
          max_users: clinic.max_users,
          subscription_status: clinic.subscription_status,
        }
      : {
          name: '',
          name_ar: '',
          email: '',
          phone: '',
          address: '',
          address_ar: '',
          license_number: '',
          max_users: 5,
          subscription_status: 'active' as const,
        },
  })

  const subscriptionStatus = watch('subscription_status')

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
    }
    onOpenChange(newOpen)
  }

  const onSubmit = async (data: ClinicFormValues) => {
    setSaving(true)
    try {
      const payload = {
        name: data.name,
        name_ar: data.name_ar || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        address_ar: data.address_ar || null,
        license_number: data.license_number || null,
        max_users: data.max_users,
        subscription_status: data.subscription_status,
      }

      if (isEditing) {
        const { error } = await supabase.from('clinics').update(payload as never).eq('id', clinic.id)
        if (error) throw error
        toast.success(t('clinic_updated'))
      } else {
        const { error } = await supabase.from('clinics').insert(payload as never)
        if (error) throw error
        toast.success(t('clinic_created'))
      }

      onSuccess()
      handleOpenChange(false)
    } catch {
      toast.error(tc('messages.save_error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('edit_clinic') : t('create_clinic')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cf-name">{ts('clinic_name')}</Label>
              <Input id="cf-name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-name-ar">{ts('clinic_name_ar')}</Label>
              <Input id="cf-name-ar" dir="rtl" {...register('name_ar')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cf-email">{ts('clinic_email')}</Label>
              <Input id="cf-email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-phone">{ts('clinic_phone')}</Label>
              <Input id="cf-phone" {...register('phone')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cf-address">{ts('clinic_address')}</Label>
              <Input id="cf-address" {...register('address')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-address-ar">{ts('clinic_address_ar')}</Label>
              <Input id="cf-address-ar" dir="rtl" {...register('address_ar')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cf-license">{ts('license_number')}</Label>
              <Input id="cf-license" {...register('license_number')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-max-users">{t('max_users')}</Label>
              <Input id="cf-max-users" type="number" min={1} {...register('max_users')} />
              {errors.max_users && (
                <p className="text-sm text-destructive">{errors.max_users.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('subscription_status')}</Label>
            <Select
              value={subscriptionStatus}
              onValueChange={(v) => setValue('subscription_status', v as typeof subscriptionStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{tc('statuses.active')}</SelectItem>
                <SelectItem value="frozen">{tc('statuses.suspended')}</SelectItem>
                <SelectItem value="expired">{tc('statuses.expired')}</SelectItem>
                <SelectItem value="cancelled">{tc('statuses.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {tc('buttons.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="me-2 size-4 animate-spin" />}
              {isEditing ? tc('buttons.update') : tc('buttons.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
