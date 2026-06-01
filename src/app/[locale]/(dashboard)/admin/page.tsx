'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Building2,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  Plus,
  Eye,
  Snowflake,
  Power,
  RefreshCw,
  Loader2,
} from 'lucide-react'

import { useAuth } from '@/providers/auth-provider'
import { createClient } from '@/lib/supabase/client'
import type { Clinic } from '@/providers/auth-provider'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ClinicFormDialog } from '@/components/admin/clinic-form'

interface ClinicWithCount extends Clinic {
  users_count: number
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  frozen: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400',
}

export default function AdminPage() {
  const { profile, loading: authLoading } = useAuth()
  const t = useTranslations('admin')
  const tc = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()

  const [clinics, setClinics] = useState<ClinicWithCount[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean
    clinicId: string
    action: 'freeze' | 'activate'
  }>({ open: false, clinicId: '', action: 'freeze' })
  const [clinicFormOpen, setClinicFormOpen] = useState(false)
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: clinicRows, error: clinicError } = await supabase
        .from('clinics')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (clinicError) throw clinicError

      const { data: profileRows, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .is('deleted_at', null)

      if (profileError) throw profileError

      const countMap = new Map<string, number>()
      for (const p of profileRows ?? []) {
        const clinicId = (p as unknown as { clinic_id: string | null }).clinic_id
        if (clinicId) {
          countMap.set(clinicId, (countMap.get(clinicId) ?? 0) + 1)
        }
      }

      const enriched: ClinicWithCount[] = ((clinicRows ?? []) as unknown as Clinic[]).map((c) => ({
        ...c,
        users_count: countMap.get(c.id) ?? 0,
      }))

      setClinics(enriched)
      setTotalUsers(profileRows?.length ?? 0)
    } catch {
      toast.error(tc('messages.error_occurred'))
    } finally {
      setLoading(false)
    }
  }, [supabase, tc])

  const hasFetchedRef = useRef(false)
  useEffect(() => {
    if (profile?.role === 'super_admin' && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      void fetchData()
    }
  }, [profile?.role, fetchData])

  useEffect(() => {
    if (!authLoading && profile?.role !== 'super_admin') {
      toast.error(t('access_denied'))
      router.replace(`/${locale}/dashboard`)
    }
  }, [authLoading, profile?.role, router, locale, t])

  const stats = useMemo(() => {
    const active = clinics.filter((c) => c.subscription_status === 'active').length
    const expired = clinics.filter((c) => c.subscription_status === 'expired').length
    return { total: clinics.length, active, expired, totalUsers }
  }, [clinics, totalUsers])

  const filteredClinics = useMemo(() => {
    if (!search.trim()) return clinics
    const q = search.toLowerCase()
    return clinics.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.name_ar?.toLowerCase().includes(q)
    )
  }, [clinics, search])

  const handleAction = async () => {
    const { clinicId, action } = confirmAction
    setActionLoading(true)
    try {
      const status = action === 'freeze' ? 'frozen' : 'active'
      const { error } = await supabase
        .from('clinics')
        .update({ subscription_status: status } as never)
        .eq('id', clinicId)

      if (error) throw error
      toast.success(action === 'freeze' ? t('clinic_frozen') : t('clinic_activated'))
      await fetchData()
    } catch {
      toast.error(tc('messages.update_error'))
    } finally {
      setActionLoading(false)
      setConfirmAction({ open: false, clinicId: '', action: 'freeze' })
    }
  }

  const handleRenew = async (clinicId: string) => {
    setActionLoading(true)
    try {
      const newExpiry = new Date()
      newExpiry.setFullYear(newExpiry.getFullYear() + 1)

      const { error } = await supabase
        .from('clinics')
        .update({
          subscription_status: 'active',
          subscription_expires_at: newExpiry.toISOString(),
        } as never)
        .eq('id', clinicId)

      if (error) throw error
      toast.success(t('subscription_renewed'))
      await fetchData()
    } catch {
      toast.error(tc('messages.update_error'))
    } finally {
      setActionLoading(false)
    }
  }

  if (authLoading || (profile?.role !== 'super_admin')) {
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
        description={t('description')}
        action={
          <Button onClick={() => { setEditingClinic(null); setClinicFormOpen(true) }} className="gap-2">
            <Plus className="size-4" />
            {t('create_clinic')}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-medium">{t('total_clinics')}</CardDescription>
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/50">
              <Building2 className="size-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-medium">{t('active_subscriptions')}</CardDescription>
            <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/50">
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-medium">{t('expired_subscriptions')}</CardDescription>
            <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950/50">
              <XCircle className="size-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-medium">{t('total_users')}</CardDescription>
            <div className="rounded-lg bg-violet-50 p-2 dark:bg-violet-950/50">
              <Users className="size-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t('clinics')}</CardTitle>
              <CardDescription>
                {tc('labels.showing')} {filteredClinics.length} {tc('labels.of')} {clinics.length}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('search_clinics')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <LoadingSpinner size={28} />
            </div>
          ) : filteredClinics.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{t('no_clinics')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tc('labels.name')}</TableHead>
                    <TableHead>{tc('labels.email')}</TableHead>
                    <TableHead>{t('subscription_status')}</TableHead>
                    <TableHead>{t('expires_at')}</TableHead>
                    <TableHead>{t('users_count')}</TableHead>
                    <TableHead>{tc('labels.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClinics.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.email ?? '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={STATUS_COLORS[c.subscription_status] ?? ''}
                        >
                          {c.subscription_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.subscription_expires_at
                          ? format(new Date(c.subscription_expires_at), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell>{c.users_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={tc('buttons.view')}
                            onClick={() => {
                              setEditingClinic(c)
                              setClinicFormOpen(true)
                            }}
                          >
                            <Eye className="size-4" />
                          </Button>

                          {c.subscription_status === 'active' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t('freeze')}
                              onClick={() =>
                                setConfirmAction({ open: true, clinicId: c.id, action: 'freeze' })
                              }
                            >
                              <Snowflake className="size-4 text-blue-500" />
                            </Button>
                          )}

                          {(c.subscription_status === 'frozen' || c.subscription_status === 'cancelled') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t('activate')}
                              onClick={() =>
                                setConfirmAction({ open: true, clinicId: c.id, action: 'activate' })
                              }
                            >
                              <Power className="size-4 text-emerald-500" />
                            </Button>
                          )}

                          {c.subscription_status === 'expired' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t('renew')}
                              disabled={actionLoading}
                              onClick={() => handleRenew(c.id)}
                            >
                              {actionLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <RefreshCw className="size-4 text-amber-500" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmAction.open}
        onOpenChange={(open) => setConfirmAction((prev) => ({ ...prev, open }))}
        title={confirmAction.action === 'freeze' ? t('freeze') : t('activate')}
        description={
          confirmAction.action === 'freeze' ? t('confirm_freeze') : t('confirm_activate')
        }
        onConfirm={handleAction}
        variant={confirmAction.action === 'freeze' ? 'destructive' : 'default'}
      />

      <ClinicFormDialog
        open={clinicFormOpen}
        onOpenChange={setClinicFormOpen}
        clinic={editingClinic}
        onSuccess={fetchData}
      />
    </div>
  )
}
