"use client"

import { useState, useMemo, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { CalendarView } from "@/components/appointments/calendar-view"
import { DailyView } from "@/components/appointments/daily-view"
import { WeeklyView } from "@/components/appointments/weekly-view"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { useAppointments } from "@/hooks/use-appointments"
import { useAuth } from "@/providers/auth-provider"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database"
import type { AppointmentCardData } from "@/components/appointments/appointment-card"

function useDentists() {
  const { clinic } = useAuth()
  const supabase = createClient()

  return useQuery<Tables<"profiles">[], Error>({
    queryKey: ["dentists", clinic?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "dentist")
        .eq("is_active", true)
        .is("deleted_at", null)

      if (error) throw error
      return (data ?? []) as unknown as Tables<"profiles">[]
    },
    enabled: !!clinic?.id,
  })
}

type ViewMode = "calendar" | "daily" | "weekly"

export default function AppointmentsPage() {
  const t = useTranslations("appointments")
  const tc = useTranslations("common")

  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dentistFilter, setDentistFilter] = useState<string>("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentCardData | undefined>()
  const [defaultFormDate, setDefaultFormDate] = useState<Date | undefined>()

  const { data: allAppointments = [], isLoading } = useAppointments(
    undefined,
    dentistFilter || undefined
  )
  const { data: dentists = [] } = useDentists()

  const dentistMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const d of dentists) {
      map[d.id] = d.full_name
    }
    return map
  }, [dentists])

  const handleAppointmentClick = useCallback(
    (apt: AppointmentCardData) => {
      setEditingAppointment(apt)
      setDefaultFormDate(undefined)
      setFormOpen(true)
    },
    []
  )

  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date)
    setViewMode("daily")
  }, [])

  const handleSlotClick = useCallback((date: Date, _time: string) => {
    setEditingAppointment(undefined)
    setDefaultFormDate(date)
    setFormOpen(true)
  }, [])

  const handleNewAppointment = useCallback(() => {
    setEditingAppointment(undefined)
    setDefaultFormDate(currentDate)
    setFormOpen(true)
  }, [currentDate])

  const handleFormOpenChange = useCallback((open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setEditingAppointment(undefined)
      setDefaultFormDate(undefined)
    }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        action={
          <Button size="sm" className="gap-1.5" onClick={handleNewAppointment}>
            <Plus className="size-4" />
            {t("new_appointment")}
          </Button>
        }
      />

      <Tabs
        defaultValue="calendar"
        value={viewMode}
        onValueChange={(v) => setViewMode(v as ViewMode)}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="calendar">{t("calendar_view")}</TabsTrigger>
            <TabsTrigger value="daily">{t("daily_view")}</TabsTrigger>
            <TabsTrigger value="weekly">{t("weekly_view")}</TabsTrigger>
          </TabsList>

          <Select
            value={dentistFilter}
            onValueChange={(v) => setDentistFilter(v ?? "")}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("dentist")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tc("labels.all")}</SelectItem>
              {dentists.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <TabsContent value="calendar">
              <CalendarView
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                appointments={allAppointments as unknown as AppointmentCardData[]}
                dentistMap={dentistMap}
                onAppointmentClick={handleAppointmentClick}
                onDayClick={handleDayClick}
              />
            </TabsContent>

            <TabsContent value="daily">
              <DailyView
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                appointments={allAppointments as unknown as AppointmentCardData[]}
                dentistMap={dentistMap}
                onAppointmentClick={handleAppointmentClick}
                onSlotClick={handleSlotClick}
              />
            </TabsContent>

            <TabsContent value="weekly">
              <WeeklyView
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                appointments={allAppointments as unknown as AppointmentCardData[]}
                dentistMap={dentistMap}
                onAppointmentClick={handleAppointmentClick}
                onSlotClick={handleSlotClick}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      <AppointmentForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        appointment={editingAppointment}
        defaultDate={defaultFormDate}
      />
    </div>
  )
}
