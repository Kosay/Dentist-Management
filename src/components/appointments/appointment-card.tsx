"use client"

import { useTranslations } from "next-intl"
import { Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AppointmentStatus } from "@/types/database"

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  scheduled:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  confirmed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  completed:
    "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  no_show:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
}

const STATUS_DOT: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-500",
  confirmed: "bg-emerald-500",
  completed: "bg-gray-500",
  cancelled: "bg-red-500",
  no_show: "bg-yellow-500",
}

export interface AppointmentCardData {
  id: string
  patient_id: string
  dentist_id: string
  appointment_date: string
  start_time: string
  end_time: string | null
  status: AppointmentStatus
  notes: string | null
  patients: { full_name: string } | null
}

interface AppointmentCardProps {
  appointment: AppointmentCardData
  dentistName?: string
  compact?: boolean
  onClick?: () => void
}

function formatTime(time: string) {
  const [h, m] = time.split(":")
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${ampm}`
}

export function AppointmentCard({
  appointment,
  dentistName,
  compact = false,
  onClick,
}: AppointmentCardProps) {
  const t = useTranslations("appointments")
  const status = appointment.status

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-start text-xs transition-colors hover:bg-muted/80",
          "border-l-2",
          status === "scheduled" && "border-l-blue-500",
          status === "confirmed" && "border-l-emerald-500",
          status === "completed" && "border-l-gray-400",
          status === "cancelled" && "border-l-red-500",
          status === "no_show" && "border-l-yellow-500"
        )}
      >
        <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[status])} />
        <span className="truncate font-medium">
          {appointment.patients?.full_name ?? "—"}
        </span>
        <span className="ms-auto shrink-0 text-muted-foreground">
          {formatTime(appointment.start_time)}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-lg border bg-card p-3 text-start shadow-sm transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {appointment.patients?.full_name ?? "—"}
          </p>
          {dentistName && (
            <p className="truncate text-xs text-muted-foreground">
              {t("dentist")}: {dentistName}
            </p>
          )}
        </div>
        <Badge
          variant="secondary"
          className={cn("shrink-0 text-[10px]", STATUS_STYLES[status])}
        >
          {t(`statuses.${status}`)}
        </Badge>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3" />
        <span>
          {formatTime(appointment.start_time)}
          {appointment.end_time && ` – ${formatTime(appointment.end_time)}`}
        </span>
      </div>
    </button>
  )
}
