'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import {
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  Camera,
  DollarSign,
  Scan,
} from 'lucide-react'

import { usePatient } from '@/hooks/use-patients'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'overview', href: '', icon: LayoutDashboard },
  { key: 'visits', href: '/visits', icon: CalendarCheck },
  { key: 'odontogram', href: '/odontogram', icon: Scan },
  { key: 'treatments', href: '/treatments', icon: Stethoscope },
  { key: 'images', href: '/images', icon: Camera },
  { key: 'billing', href: '/billing', icon: DollarSign },
] as const

export default function PatientDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams<{ id: string }>()
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tp = useTranslations('patients')

  const { data: patient, isLoading, isError, error } = usePatient(params.id)

  const basePath = `/patients/${params.id}`

  if (pathname.endsWith('/edit')) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">{tp('patient_not_found')}</p>
        {error?.message && (
          <p className="text-xs text-muted-foreground/80">{error.message}</p>
        )}
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">{tp('patient_not_found')}</p>
      </div>
    )
  }

  const isActive = (href: string) => {
    const fullPath = basePath + href
    if (href === '') {
      return pathname === basePath || pathname === basePath + '/'
    }
    return pathname.startsWith(fullPath)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {patient.full_name}
        </h1>
        {patient.file_number && (
          <p className="text-sm text-muted-foreground">
            {tp('fields.file_number')}: {patient.file_number}
          </p>
        )}
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.key}
              href={basePath + tab.href}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              <Icon className="size-4" />
              {t(tab.key)}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
