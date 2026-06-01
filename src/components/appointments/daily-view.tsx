"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { format, addDays, subDays } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AppointmentStatus } from "@/types/database"
import type { AppointmentCardData } from "./appointment-card"

interface DailyViewProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  appointments: AppointmentCardData[]
  dentistMap: Record<string, string>
  onAppointmentClick: (appointment: AppointmentCardData) => void
  onSlotClick: (date: Date, time: string) => void
}

const START_HOUR = 8
const END_HOUR = 20

const STATUS_BG: Record<AppointmentStatus, string> = {
  scheduled:
    "bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200",
  confirmed:
    "bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-200",
  completed:
    "bg-gray-100 border-gray-300 text-gray-900 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-200",
  cancelled:
    "bg-red-100 border-red-300 text-red-900 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200",
  no_show:
    "bg-yellow-100 border-yellow-300 text-yellow-900 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-200",
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function generateTimeLabels(): string[] {
  const labels: string[] = []
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    labels.push(`${h.toString().padStart(2, "0")}:00`)
    if (h < END_HOUR) {
      labels.push(`${h.toString().padStart(2, "0")}:30`)
    }
  }
  return labels
}

function formatTimeLabel(time: string) {
  const [h] = time.split(":")
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return time.endsWith(":00") ? `${displayHour} ${ampm}` : `${displayHour}:30`
}

export function DailyView({
  currentDate,
  onDateChange,
  appointments,
  dentistMap,
  onAppointmentClick,
  onSlotClick,
}: DailyViewProps) {
  const t = useTranslations("appointments")
  const timeLabels = useMemo(() => generateTimeLabels(), [])

  const dayAppointments = useMemo(() => {
    const dateKey = format(currentDate, "yyyy-MM-dd")
    return appointments.filter((a) => a.appointment_date === dateKey)
  }, [appointments, currentDate])

  const baseMinutes = START_HOUR * 60

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onDateChange(subDays(currentDate, 1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
          >
            {t("today")}
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onDateChange(addDays(currentDate, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="relative flex">
          {/* Time labels */}
          <div className="w-16 shrink-0 border-r bg-muted/30 md:w-20">
            {timeLabels.map((time) => (
              <div
                key={time}
                className="flex h-[30px] items-start justify-end pe-2 text-[10px] text-muted-foreground md:text-xs"
                style={{ marginTop: time === timeLabels[0] ? 0 : undefined }}
              >
                {formatTimeLabel(time)}
              </div>
            ))}
          </div>

          {/* Grid area */}
          <div className="relative flex-1">
            {/* Grid lines */}
            {timeLabels.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onSlotClick(currentDate, time)}
                className={cn(
                  "block h-[30px] w-full border-b transition-colors hover:bg-muted/30",
                  time.endsWith(":00")
                    ? "border-border"
                    : "border-border/40 border-dashed"
                )}
              />
            ))}

            {/* Appointment blocks */}
            {dayAppointments.map((apt) => {
              const startMin = timeToMinutes(apt.start_time)
              const endMin = apt.end_time
                ? timeToMinutes(apt.end_time)
                : startMin + 30
              const top = ((startMin - baseMinutes) / 30) * 30
              const height = Math.max(((endMin - startMin) / 30) * 30, 24)

              return (
                <button
                  key={apt.id}
                  type="button"
                  onClick={() => onAppointmentClick(apt)}
                  className={cn(
                    "absolute inset-x-1 z-10 overflow-hidden rounded-md border px-2 py-1 text-start shadow-sm transition-opacity hover:opacity-90 md:inset-x-2",
                    STATUS_BG[apt.status]
                  )}
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  <p className="truncate text-xs font-medium">
                    {apt.patients?.full_name ?? "—"}
                  </p>
                  {height >= 40 && (
                    <p className="truncate text-[10px] opacity-80">
                      {dentistMap[apt.dentist_id] ?? t("dentist")}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
