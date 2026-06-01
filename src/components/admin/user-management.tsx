'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  UserPlus,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/providers/auth-provider'
import type { UserRole } from '@/types/database'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { LoadingSpinner } from '@/components/shared/loading-spinner'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface UserWithClinic extends Profile {
  clinic_name?: string
}

export function UserManagement() {
  const t = useTranslations('settings')
  const ta = useTranslations('admin')
  const tc = useTranslations('common')
  const supabase = createClient()

  const [users, setUsers] = useState<UserWithClinic[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('receptionist')
  const [inviteClinicId, setInviteClinicId] = useState('')
  const [inviting, setInviting] = useState(false)
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data: profileRows, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (profileError) throw profileError

      const { data: clinicRows } = await supabase
        .from('clinics')
        .select('*')
        .is('deleted_at', null)

      const clinicMap = new Map<string, string>()
      const typedClinics = (clinicRows ?? []) as unknown as { id: string; name: string }[]
      for (const c of typedClinics) {
        clinicMap.set(c.id, c.name)
      }

      setClinics(typedClinics.map((c) => ({ id: c.id, name: c.name })))

      const enriched: UserWithClinic[] = ((profileRows ?? []) as unknown as Profile[]).map((p) => ({
        ...p,
        clinic_name: p.clinic_id ? clinicMap.get(p.clinic_id) ?? '—' : '—',
      }))

      setUsers(enriched)
    } catch {
      toast.error(tc('messages.error_occurred'))
    } finally {
      setLoading(false)
    }
  }, [supabase, tc])

  const hasFetchedRef = useRef(false)
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      void fetchUsers()
    }
  }, [fetchUsers])

  const toggleActive = async (userId: string, currentlyActive: boolean) => {
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

  const changeRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role } as never)
        .eq('id', userId)

      if (error) throw error
      toast.success(tc('messages.update_success'))
      await fetchUsers()
    } catch {
      toast.error(tc('messages.update_error'))
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) return
    setInviting(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: inviteEmail,
        password: crypto.randomUUID().slice(0, 16) + 'Aa1!',
        options: {
          data: {
            full_name: inviteEmail.split('@')[0],
            clinic_id: inviteClinicId || undefined,
            role: inviteRole,
          },
        },
      })
      if (error) throw error
      toast.success(t('invite_sent'))
      setInviteOpen(false)
      setInviteEmail('')
      setInviteClinicId('')
      await fetchUsers()
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
              <CardTitle>{ta('users')}</CardTitle>
              <CardDescription>
                {tc('labels.total')}: {users.length}
              </CardDescription>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tc('labels.name')}</TableHead>
                    <TableHead>{tc('labels.email')}</TableHead>
                    <TableHead>{t('user_role')}</TableHead>
                    <TableHead>{ta('clinics')}</TableHead>
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
                        <Select
                          defaultValue={u.role}
                          onValueChange={(v) => changeRole(u.id, v as UserRole)}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super_admin">{t('roles.super_admin')}</SelectItem>
                            <SelectItem value="dentist">{t('roles.dentist')}</SelectItem>
                            <SelectItem value="nurse">{t('roles.nurse')}</SelectItem>
                            <SelectItem value="receptionist">{t('roles.receptionist')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.clinic_name}</TableCell>
                      <TableCell>
                        <Badge variant={u.is_active ? 'default' : 'secondary'}>
                          {u.is_active ? tc('statuses.active') : tc('statuses.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(u.id, u.is_active)}
                          className="gap-1.5"
                        >
                          {u.is_active ? (
                            <ToggleRight className="size-4" />
                          ) : (
                            <ToggleLeft className="size-4" />
                          )}
                          {u.is_active ? tc('statuses.inactive') : tc('statuses.active')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
            <div className="space-y-2">
              <Label>{ta('clinics')}</Label>
              <Select value={inviteClinicId} onValueChange={(v) => setInviteClinicId(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder={tc('buttons.select')} />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
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
