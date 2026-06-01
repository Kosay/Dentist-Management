'use client'

import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import {
  UserPlus,
  Calendar,
  Stethoscope,
  ClipboardList,
  FileText,
  DollarSign,
  Camera,
  ScanLine,
  FileCheck,
  CalendarClock,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { useTimeline } from '@/hooks/use-timeline'
import { cn } from '@/lib/utils'
import type { TimelineEventType } from '@/types/database'

const EVENT_CONFIG: Record<
  TimelineEventType,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  patient_created: {
    icon: UserPlus,
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
  },
  appointment_created: {
    icon: Calendar,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  appointment_updated: {
    icon: CalendarClock,
    color: 'text-teal-600',
    bg: 'bg-teal-100 dark:bg-teal-900/40',
  },
  visit_completed: {
    icon: Stethoscope,
    color: 'text-violet-600',
    bg: 'bg-violet-100 dark:bg-violet-900/40',
  },
  treatment_added: {
    icon: ClipboardList,
    color: 'text-orange-600',
    bg: 'bg-orange-100 dark:bg-orange-900/40',
  },
  treatment_updated: {
    icon: ClipboardList,
    color: 'text-amber-600',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
  },
  invoice_created: {
    icon: FileText,
    color: 'text-pink-600',
    bg: 'bg-pink-100 dark:bg-pink-900/40',
  },
  payment_received: {
    icon: DollarSign,
    color: 'text-green-600',
    bg: 'bg-green-100 dark:bg-green-900/40',
  },
  image_uploaded: {
    icon: Camera,
    color: 'text-cyan-600',
    bg: 'bg-cyan-100 dark:bg-cyan-900/40',
  },
  odontogram_updated: {
    icon: ScanLine,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100 dark:bg-indigo-900/40',
  },
  consent_signed: {
    icon: FileCheck,
    color: 'text-rose-600',
    bg: 'bg-rose-100 dark:bg-rose-900/40',
  },
}

interface PatientTimelineProps {
  patientId: string
}

export function PatientTimeline({ patientId }: PatientTimelineProps) {
  const t = useTranslations('patients')
  const { data: events = [], isLoading } = useTimeline(patientId)

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <LoadingSpinner size={24} />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="text-sm text-muted-foreground">{t('timeline.no_history')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('timeline.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute start-5 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-6">
            {events.map((event, index) => {
              const config =
                EVENT_CONFIG[event.event_type as TimelineEventType] ??
                EVENT_CONFIG.patient_created
              const Icon = config.icon

              return (
                <div key={event.id} className="relative flex gap-4">
                  <div
                    className={cn(
                      'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full',
                      config.bg
                    )}
                  >
                    <Icon className={cn('size-4', config.color)} />
                  </div>

                  <div className="flex-1 pt-0.5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium">{event.title}</p>
                      <time className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), {
                          addSuffix: true,
                        })}
                      </time>
                    </div>
                    {event.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {index === events.length - 1 && (
                    <div className="absolute start-5 bottom-0 h-1/2 w-px bg-background" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
