'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getSiteUrl } from '@/lib/site-url'
import type { UserRole, Json, SubscriptionStatus } from '@/types/database'

export interface Profile {
  id: string
  clinic_id: string | null
  full_name: string
  full_name_ar: string | null
  email: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  settings: Json
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Clinic {
  id: string
  name: string
  name_ar: string | null
  email: string | null
  phone: string | null
  address: string | null
  address_ar: string | null
  logo_url: string | null
  license_number: string | null
  subscription_status: SubscriptionStatus
  subscription_expires_at: string | null
  max_users: number
  settings: Json
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface SignUpParams {
  email: string
  password: string
  full_name: string
  clinic_name: string
  locale: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  clinic: Clinic | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (params: SignUpParams) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchProfileAndClinic = useCallback(
    async (userId: string) => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      const p = profileData as unknown as Profile
      setProfile(p)

      if (p.clinic_id) {
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .select('*')
          .eq('id', p.clinic_id)
          .single()

        if (clinicError) throw clinicError
        setClinic(clinicData as unknown as Clinic)
      } else {
        setClinic(null)
      }
    },
    [supabase]
  )

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        try {
          await fetchProfileAndClinic(currentUser.id)
        } catch {
          // Keep existing profile/clinic on transient failures (e.g. locale navigation)
        }
      } else {
        setProfile(null)
        setClinic(null)
      }

      if (mounted) setLoading(false)
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        try {
          await fetchProfileAndClinic(currentUser.id)
        } catch {
          // Do not clear profile on failed refresh — avoids showing "User" after locale switch
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
        setClinic(null)
      }

      if (mounted) setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfileAndClinic])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    if (!data.user) throw new Error('Unable to sign in')
    return data.user
  }

  const signUp = async ({
    email,
    password,
    full_name,
    clinic_name,
    locale,
  }: SignUpParams) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getSiteUrl()}/api/auth/callback?next=/${locale}/dashboard`,
        data: {
          full_name,
          clinic_name,
        },
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
    setClinic(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndClinic(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        clinic,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
