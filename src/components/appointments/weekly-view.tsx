"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isToday,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AppointmentStatus } from "@/types/database"
import type { AppointmentCardData } from "./appointment-card"

interface WeeklyViewProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  appointments: AppointmentCardData[]
  dentistMap?: Record<string, string>
  onAppointmentClick: (appointment: AppointmentCardData) => void
  onSlotClick: (date: Date, time: string) => void
}

const START_HOUR = 8
const END_HOUR = 20

const STATUS_BG: Record<AppointmentStatus, string> = {
  scheduled:
    "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700",
  confirmed:
    "bg-emerald-100 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700",
  completed:
    "bg-gray-100 border-gray-300 dark:bg-gray-800/50 dark:border-gray-600",
  cancelled:
    "bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700",
  no_show:
    "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700",
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function generateHours(): number[] {
  const hours: number[] = []
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    hours.push(h)
  }
  return hours
}

function formatHourLabel(hour: number) {
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour} ${ampm}`
}

export function WeeklyView({
  currentDate,
  onDateChange,
  appointments,
  onAppointmentClick,
  onSlotClick,
}: WeeklyViewProps) {
  const t = useTranslations("appointments")
  const hours = useMemo(() => generateHours(), [])

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate)
    const end = endOfWeek(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, AppointmentCardData[]> = {}
    for (const apt of appointments) {
      const key = apt.appointment_date
      if (!map[key]) map[key] = []
      map[key].push(apt)
    }
    return map
  }, [appointments])

  const weekStart = weekDays[0]
  const weekEnd = weekDays[6]
  const baseMinutes = START_HOUR * 60
  const hourHeight = 48

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onDateChange(subWeeks(currentDate, 1))}
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
            onClick={() => onDateChange(addWeeks(currentDate, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        {/* Day headers */}
        <div className="sticky top-0 z-20 flex border-b bg-card">
          <div className="w-16 shrink-0 border-r md:w-20" />
          {weekDays.map((day) => {
            const today = isToday(day)
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex flex-1 flex-col items-center border-r py-2 text-center last:border-r-0",
                  today && "bg-primary/5"
                )}
              >
                <span className="text-xs text-muted-foreground">
                  {format(day, "EEE")}
                </span>
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-7 items-center justify-center rounded-full text-sm font-medium",
                    today && "bg-primary text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div className="flex">
          {/* Time labels */}
          <div className="w-16 shrink-0 border-r bg-muted/30 md:w-20">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex items-start justify-end pe-2 text-[10px] text-muted-foreground md:text-xs"
                style={{ height: `${hourHeight}px` }}
              >
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd")
            const dayApts = appointmentsByDay[dateKey] ?? []
            const today = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative flex-1 border-r last:border-r-0",
                  today && "bg-primary/5"
                )}
              >
                {/* Hour gridlines */}
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() =>
                      onSlotClick(
                        day,
                        `${hour.toString().padStart(2, "0")}:00`
                      )
                    }
                    className="block w-full border-b transition-colors hover:bg-muted/40"
                    style={{ height: `${hourHeight}px` }}
                  />
                ))}

                {/* Appointments */}
                {dayApts.map((apt) => {
                  const startMin = timeToMinutes(apt.start_time)
                  const endMin = apt.end_time
                    ? timeToMinutes(apt.end_time)
                    : startMin + 30
                  const top =
                    ((startMin - baseMinutes) / 60) * hourHeight
                  const height = Math.max(
                    ((endMin - startMin) / 60) * hourHeight,
                    20
                  )

                  return (
                    <button
                      key={apt.id}
                      type="button"
                      onClick={() => onAppointmentClick(apt)}
                      className={cn(
                        "absolute inset-x-0.5 z-10 overflow-hidden rounded border px-1 py-0.5 text-start text-[10px] shadow-sm transition-opacity hover:opacity-90",
                        STATUS_BG[apt.status]
                      )}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <p className="truncate font-medium">
                        {apt.patients?.full_name ?? "—"}
                      </p>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
