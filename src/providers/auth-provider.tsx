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
}

interface AuthState {
  user: User | null
  profile: Profile | null
  clinic: Clinic | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
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
      try {
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
        }
      } catch {
        setProfile(null)
        setClinic(null)
      }
    },
    [supabase]
  )

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await fetchProfileAndClinic(currentUser.id)
      } else {
        setProfile(null)
        setClinic(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfileAndClinic])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async ({ email, password, full_name, clinic_name }: SignUpParams) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
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
