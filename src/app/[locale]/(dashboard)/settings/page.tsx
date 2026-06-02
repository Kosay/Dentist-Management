'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { toast } from 'sonner'
import {
  User,
  Building2,
  Users,
  Palette,
  Loader2,
  Upload,
  UserPlus,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

import { useAuth } from '@/providers/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { profileUpdateSchema, clinicSchema } from '@/lib/validations'
import type { ProfileUpdate, Clinic as ClinicFormValues } from '@/lib/validations'
import type { Profile } from '@/providers/auth-provider'
import type { UserRole } from '@/types/database'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function ProfileTab() {
  const { profile, refreshProfile } = useAuth()
  const t = useTranslations('settings')
  const tc = useTranslations('common')
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdate>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      full_name_ar: profile?.full_name_ar ?? '',
      phone: profile?.phone ?? '',
    },
  })

  const onSubmit = async (data: ProfileUpdate) => {
    if (!profile) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          full_name_ar: data.full_name_ar || null,
          phone: data.phone || null,
        } as never)
        .eq('id', profile.id)

      if (error) throw error
      await refreshProfile()
      toast.success(tc('messages.save_success'))
    } catch {
      toast.error(tc('messages.save_error'))
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${profile.id}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)

      await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl } as never)
        .eq('id', profile.id)

      await refreshProfile()
      toast.success(tc('messages.save_success'))
    } catch {
      toast.error(tc('messages.save_error'))
    } finally {
      setUploading(false)
    }
  }

  if (!profile) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile')}</CardTitle>
        <CardDescription>{t('profile_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-lg">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <Label
              htmlFor="avatar-upload"
              className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {t('change_avatar')}
            </Label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('full_name')}</Label>
              <Input id="full_name" {...register('full_name')} />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name_ar">{t('full_name_ar')}</Label>
              <Input id="full_name_ar" dir="rtl" {...register('full_name_ar')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{tc('labels.email')}</Label>
              <Input value={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input id="phone" {...register('phone')} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="me-2 size-4 animate-spin" />}
              {tc('buttons.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function ClinicTab() {
  const { clinic, refreshProfile } = useAuth()
  const t = useTranslations('settings')
  const tc = useTranslations('common')
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(clinicSchema) as any,
    defaultValues: {
      name: clinic?.name ?? '',
      name_ar: clinic?.name_ar ?? '',
      email: clinic?.email ?? '',
      phone: clinic?.phone ?? '',
      address: clinic?.address ?? '',
      address_ar: clinic?.address_ar ?? '',
      license_number: clinic?.license_number ?? '',
    },
  })

  const onSubmit = async (data: ClinicFormValues) => {
    if (!clinic) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('clinics')
        .update({
          name: data.name,
          name_ar: data.name_ar || null,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          address_ar: data.address_ar || null,
          license_number: data.license_number || null,
        } as never)
        .eq('id', clinic.id)

      if (error) throw error
      await refreshProfile()
      toast.success(tc('messages.save_success'))
    } catch {
      toast.error(tc('messages.save_error'))
    } finally {
      setSaving(false)
    }
  }

  if (!clinic) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('clinic_info')}</CardTitle>
        <CardDescription>{t('clinic_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clinic_name">{t('clinic_name')}</Label>
              <Input id="clinic_name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic_name_ar">{t('clinic_name_ar')}</Label>
              <Input id="clinic_name_ar" dir="rtl" {...register('name_ar')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clinic_email">{t('clinic_email')}</Label>
              <Input id="clinic_email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic_phone">{t('clinic_phone')}</Label>
              <Input id="clinic_phone" {...register('phone')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clinic_address">{t('clinic_address')}</Label>
              <Input id="clinic_address" {...register('address')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic_address_ar">{t('clinic_address_ar')}</Label>
              <Input id="clinic_address_ar" dir="rtl" {...register('address_ar')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_number">{t('license_number')}</Label>
            <Input id="license_number" {...register('license_number')} />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="me-2 size-4 animate-spin" />}
              {tc('buttons.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function UsersTab() {
  const { profile, clinic } = useAuth()
  const t = useTranslations('settings')
  const tc = useTranslations('common')
  const supabase = createClient()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('receptionist')
  const [inviting, setInviting] = useState(false)

  const fetchUsers = async () => {
    if (!clinic) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clinic_id', clinic.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (error) throw error
      setUsers((data ?? []) as unknown as Profile[])
    } catch {
      toast.error(tc('messages.error_occurred'))
    } finally {
      setLoading(false)
    }
  }

  const hasFetchedRef = useRef(false)
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      void fetchUsers()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleUserActive = async (userId: string, currentlyActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentlyActive } as never)
        .eq('id', userId)

      if (error) throw error
      toast.success(currentlyActive ? t('user_deactivated') : t('user_activated'))
      await fetchUsers()
    } catch {
      toast.error(tc('messages.update_error'))
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail || !clinic) return
    setInviting(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: inviteEmail,
        password: crypto.randomUUID().slice(0, 16) + 'Aa1!',
        options: {
          data: {
            full_name: inviteEmail.split('@')[0],
            clinic_id: clinic.id,
            role: inviteRole,
          },
        },
      })
      if (error) throw error
      toast.success(t('invite_sent'))
      setInviteOpen(false)
      setInviteEmail('')
    } catch {
      toast.error(tc('messages.save_error'))
    } finally {
      setInviting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('users')}</CardTitle>
              <CardDescription>{t('users_description')}</CardDescription>
            </div>
            <Button size="sm" onClick={() => setInviteOpen(true)} className="gap-2">
              <UserPlus className="size-4" />
              {t('invite_user')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">{t('no_users')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tc('labels.name')}</TableHead>
                  <TableHead>{tc('labels.email')}</TableHead>
                  <TableHead>{t('user_role')}</TableHead>
                  <TableHead>{tc('labels.status')}</TableHead>
                  <TableHead>{tc('labels.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage src={u.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(u.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{u.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(`roles.${u.role}`)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.is_active ? 'default' : 'secondary'}>
                        {u.is_active ? tc('statuses.active') : tc('statuses.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.id !== profile?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserActive(u.id, u.is_active)}
                          className="gap-1.5"
                        >
                          {u.is_active ? (
                            <ToggleRight className="size-4" />
                          ) : (
                            <ToggleLeft className="size-4" />
                          )}
                          {u.is_active ? tc('statuses.inactive') : tc('statuses.active')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('invite_user')}</DialogTitle>
            <DialogDescription>{t('users_description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{tc('labels.email')}</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('user_role')}</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dentist">{t('roles.dentist')}</SelectItem>
                  <SelectItem value="nurse">{t('roles.nurse')}</SelectItem>
                  <SelectItem value="receptionist">{t('roles.receptionist')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              {tc('buttons.cancel')}
            </Button>
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
              {inviting && <Loader2 className="me-2 size-4 animate-spin" />}
              {tc('buttons.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function PreferencesTab() {
  const t = useTranslations('settings')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const switchLanguage = (newLocale: string | null) => {
    if (!newLocale || newLocale === locale) return
    router.replace(pathname, { locale: newLocale as Locale })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('language_preference')}</CardTitle>
          <CardDescription>{t('preferences_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('language')}</Label>
              <Select value={locale} onValueChange={switchLanguage}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{t('theme_preference')}</Label>
              <Select defaultValue="system">
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('theme_light')}</SelectItem>
                  <SelectItem value="dark">{t('theme_dark')}</SelectItem>
                  <SelectItem value="system">{t('theme_system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('notifications_settings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('coming_soon')}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  const { profile, loading } = useAuth()
  const t = useTranslations('settings')

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'dentist'

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="size-4" />
            {t('profile')}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="clinic" className="gap-2">
              <Building2 className="size-4" />
              {t('clinic_tab')}
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="users" className="gap-2">
              <Users className="size-4" />
              {t('users_tab')}
            </TabsTrigger>
          )}
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="size-4" />
            {t('preferences_tab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="clinic">
            <ClinicTab />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
        )}

        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
