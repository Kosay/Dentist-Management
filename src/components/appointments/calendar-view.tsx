"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  AppointmentCard,
  type AppointmentCardData,
} from "./appointment-card"

interface CalendarViewProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  appointments: AppointmentCardData[]
  dentistMap?: Record<string, string>
  onAppointmentClick: (appointment: AppointmentCardData) => void
  onDayClick: (date: Date) => void
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

export function CalendarView({
  currentDate,
  onDateChange,
  appointments,
  onAppointmentClick,
  onDayClick,
}: CalendarViewProps) {
  const t = useTranslations("appointments")

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: calStart, end: calEnd })
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onDateChange(subMonths(currentDate, 1))}
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
            onClick={() => onDateChange(addMonths(currentDate, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dateKey = format(day, "yyyy-MM-dd")
            const dayAppointments = appointmentsByDay[dateKey] ?? []
            const inMonth = isSameMonth(day, currentDate)
            const today = isToday(day)

            return (
              <button
                type="button"
                key={idx}
                onClick={() => onDayClick(day)}
                className={cn(
                  "group relative flex min-h-[100px] flex-col border-b border-r p-1 text-start transition-colors hover:bg-muted/30 md:min-h-[120px] md:p-2",
                  !inMonth && "bg-muted/20"
                )}
              >
                <span
                  className={cn(
                    "mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
                    today &&
                      "bg-primary text-primary-foreground",
                    !today && !inMonth && "text-muted-foreground/50",
                    !today && inMonth && "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>

                <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      compact
                      onClick={() => {
                        onAppointmentClick(apt)
                      }}
                    />
                  ))}
                  {dayAppointments.length > 3 && (
                    <span className="px-1.5 text-[10px] font-medium text-muted-foreground">
                      +{dayAppointments.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
