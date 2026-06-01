'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { useAuth } from '@/providers/auth-provider'
import { DentalChart } from '@/components/odontogram/dental-chart'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function OdontogramPage() {
  const params = useParams<{ id: string }>()
  const { profile, loading } = useAuth()
  const t = useTranslations('odontogram')

  const [isPrimary, setIsPrimary] = useState(false)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const readOnly = profile?.role === 'nurse' || profile?.role === 'receptionist'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          {readOnly && (
            <Badge variant="secondary">
              {t('conditions.healthy')}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isPrimary ? 'outline' : 'default'}
            size="sm"
            onClick={() => setIsPrimary(false)}
          >
            {t('permanent_teeth')}
          </Button>
          <Button
            variant={isPrimary ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsPrimary(true)}
          >
            {t('primary_teeth')}
          </Button>
        </div>
      </div>

      <DentalChart
        patientId={params.id}
        isPrimary={isPrimary}
        readOnly={readOnly}
      />
    </div>
  )
}
