"use client"

import { useState, useMemo, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, ChevronsUpDown, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { cn } from "@/lib/utils"
import { appointmentSchema } from "@/lib/validations"
import { useAuth } from "@/providers/auth-provider"
import {
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/hooks/use-appointments"
import { usePatients } from "@/hooks/use-patients"
import { createClient } from "@/lib/supabase/client"
import { useQuery } from "@tanstack/react-query"
import type { Tables } from "@/types/database"
import type { AppointmentCardData } from "./appointment-card"

interface AppointmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment?: AppointmentCardData
  defaultDate?: Date
}

const STATUS_OPTIONS = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const

function generateTimeSlots() {
  const slots: string[] = []
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 20 && m > 0) break
      slots.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      )
    }
  }
  return slots
}

function formatSlotLabel(time: string) {
  const [h, m] = time.split(":")
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${ampm}`
}

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

export function AppointmentForm({
  open,
  onOpenChange,
  appointment,
  defaultDate,
}: AppointmentFormProps) {
  const t = useTranslations("appointments")
  const tc = useTranslations("common")
  const { profile, clinic } = useAuth()

  const isEdit = !!appointment
  const [patientSearch, setPatientSearch] = useState("")
  const [patientPopoverOpen, setPatientPopoverOpen] = useState(false)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const timeSlots = useMemo(() => generateTimeSlots(), [])
  const { data: patients = [] } = usePatients(patientSearch || undefined)
  const { data: dentists = [] } = useDentists()
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()
  const deleteAppointment = useDeleteAppointment()

  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: appointment?.patient_id ?? "",
      dentist_id: appointment?.dentist_id ?? profile?.id ?? "",
      appointment_date: appointment?.appointment_date ??
        (defaultDate ? format(defaultDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")),
      start_time: appointment?.start_time ?? "09:00",
      end_time: appointment?.end_time ?? "",
      status: appointment?.status ?? ("scheduled" as const),
      notes: appointment?.notes ?? "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        patient_id: appointment?.patient_id ?? "",
        dentist_id: appointment?.dentist_id ?? profile?.id ?? "",
        appointment_date: appointment?.appointment_date ??
          (defaultDate ? format(defaultDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")),
        start_time: appointment?.start_time ?? "09:00",
        end_time: appointment?.end_time ?? "",
        status: appointment?.status ?? ("scheduled" as const),
        notes: appointment?.notes ?? "",
      })
      setPatientSearch("")
    }
  }, [open, appointment, defaultDate, profile?.id, form])

  const patientIdValue = form.watch("patient_id")
  const selectedPatient = patients.find((p) => p.id === patientIdValue)

  async function onSubmit(values: Record<string, unknown>) {
    try {
      if (isEdit && appointment) {
        await updateAppointment.mutateAsync({
          id: appointment.id,
          data: values as never,
        })
        toast.success(tc("messages.update_success"))
      } else {
        await createAppointment.mutateAsync({
          ...values,
          clinic_id: clinic!.id,
          created_by: profile!.id,
        } as never)
        toast.success(tc("messages.save_success"))
      }
      onOpenChange(false)
    } catch {
      toast.error(isEdit ? tc("messages.update_error") : tc("messages.save_error"))
    }
  }

  async function handleDelete() {
    if (!appointment) return
    try {
      await deleteAppointment.mutateAsync(appointment.id)
      toast.success(tc("messages.delete_success"))
      onOpenChange(false)
    } catch {
      toast.error(tc("messages.delete_error"))
    }
  }

  const isPending =
    createAppointment.isPending ||
    updateAppointment.isPending ||
    deleteAppointment.isPending

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? t("edit_appointment") : t("new_appointment")}
            </DialogTitle>
            <DialogDescription>
              {isEdit ? t("edit_appointment") : t("new_appointment")}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit as never)}
            className="grid gap-4"
          >
            {/* Patient search/select */}
            <div className="grid gap-2">
              <Label>{t("patient")}</Label>
              <Controller
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <Popover
                    open={patientPopoverOpen}
                    onOpenChange={setPatientPopoverOpen}
                  >
                    <PopoverTrigger
                      className={cn(
                        "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {selectedPatient?.full_name ??
                        appointment?.patients?.full_name ??
                        tc("buttons.select")}
                      <ChevronsUpDown className="size-4 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-[--anchor-width] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder={tc("buttons.search")}
                          value={patientSearch}
                          onValueChange={setPatientSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {tc("labels.no_results")}
                          </CommandEmpty>
                          <CommandGroup>
                            {patients.map((patient) => (
                              <CommandItem
                                key={patient.id}
                                value={patient.id}
                                onSelect={() => {
                                  field.onChange(patient.id)
                                  setPatientPopoverOpen(false)
                                }}
                              >
                                {patient.full_name}
                                {patient.mobile && (
                                  <span className="ms-auto text-xs text-muted-foreground">
                                    {patient.mobile}
                                  </span>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.patient_id && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.patient_id.message as string}
                </p>
              )}
            </div>

            {/* Dentist select */}
            <div className="grid gap-2">
              <Label>{t("dentist")}</Label>
              <Controller
                control={form.control}
                name="dentist_id"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={tc("buttons.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      {dentists.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.dentist_id && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.dentist_id.message as string}
                </p>
              )}
            </div>

            {/* Date picker */}
            <div className="grid gap-2">
              <Label>{t("date")}</Label>
              <Controller
                control={form.control}
                name="appointment_date"
                render={({ field }) => (
                  <Popover
                    open={datePopoverOpen}
                    onOpenChange={setDatePopoverOpen}
                  >
                    <PopoverTrigger
                      className={cn(
                        "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? format(new Date(field.value + "T00:00:00"), "PPP")
                        : tc("buttons.select")}
                      <CalendarIcon className="size-4 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value
                            ? new Date(field.value + "T00:00:00")
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, "yyyy-MM-dd"))
                          }
                          setDatePopoverOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.appointment_date && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.appointment_date.message as string}
                </p>
              )}
            </div>

            {/* Time row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("start_time")}</Label>
                <Controller
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={tc("buttons.select")} />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {formatSlotLabel(slot)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.start_time && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.start_time.message as string}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>{t("end_time")}</Label>
                <Controller
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={tc("buttons.select")} />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {formatSlotLabel(slot)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label>{tc("labels.status")}</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`statuses.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label>{t("notes")}</Label>
              <Textarea
                {...form.register("notes")}
                rows={3}
                placeholder={t("notes")}
              />
            </div>

            <DialogFooter>
              {isEdit && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setDeleteDialogOpen(true)}
                  className="me-auto"
                >
                  <Trash2 />
                  {tc("buttons.delete")}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {tc("buttons.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? tc("buttons.loading")
                  : isEdit
                    ? tc("buttons.update")
                    : tc("buttons.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("cancel_appointment")}
        description={t("confirm_cancel")}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  )
}
