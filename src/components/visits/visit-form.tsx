"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { visitSchema } from "@/lib/validations"
import { useAuth } from "@/providers/auth-provider"
import { useCreateVisit, useUpdateVisit } from "@/hooks/use-visits"
import type { Tables } from "@/types/database"

interface VisitFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  visit?: Tables<"visits">
}

export function VisitForm({
  open,
  onOpenChange,
  patientId,
  visit,
}: VisitFormProps) {
  const t = useTranslations("visits")
  const tc = useTranslations("common")
  const { profile, clinic } = useAuth()
  const isEdit = !!visit

  const createVisit = useCreateVisit()
  const updateVisit = useUpdateVisit()

  const form = useForm({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      patient_id: patientId,
      dentist_id: profile?.id ?? "",
      visit_date:
        visit?.visit_date ?? format(new Date(), "yyyy-MM-dd"),
      chief_complaint: visit?.chief_complaint ?? "",
      diagnosis: visit?.diagnosis ?? "",
      treatment_performed: visit?.treatment_performed ?? "",
      prescription: visit?.prescription ?? "",
      next_visit_date: visit?.next_visit_date ?? "",
      clinical_notes: visit?.clinical_notes ?? "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        patient_id: patientId,
        dentist_id: profile?.id ?? "",
        visit_date:
          visit?.visit_date ?? format(new Date(), "yyyy-MM-dd"),
        chief_complaint: visit?.chief_complaint ?? "",
        diagnosis: visit?.diagnosis ?? "",
        treatment_performed: visit?.treatment_performed ?? "",
        prescription: visit?.prescription ?? "",
        next_visit_date: visit?.next_visit_date ?? "",
        clinical_notes: visit?.clinical_notes ?? "",
      })
    }
  }, [open, visit, patientId, profile?.id, form])

  async function onSubmit(values: Record<string, unknown>) {
    try {
      if (isEdit && visit) {
        await updateVisit.mutateAsync({
          id: visit.id,
          data: values as never,
        })
        toast.success(tc("messages.update_success"))
      } else {
        await createVisit.mutateAsync({
          ...values,
          clinic_id: clinic!.id,
        } as never)
        toast.success(tc("messages.save_success"))
      }
      onOpenChange(false)
    } catch {
      toast.error(
        isEdit ? tc("messages.update_error") : tc("messages.save_error")
      )
    }
  }

  const isPending = createVisit.isPending || updateVisit.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("edit_visit") : t("new_visit")}</DialogTitle>
          <DialogDescription>
            {isEdit ? t("edit_visit") : t("new_visit")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit as never)}
          className="grid gap-4"
        >
          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-4 pe-4">
              {/* Visit date */}
              <div className="grid gap-2">
                <Label>{t("visit_date")}</Label>
                <Controller
                  control={form.control}
                  name="visit_date"
                  render={({ field }) => (
                    <DatePickerField
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={tc("buttons.select")}
                    />
                  )}
                />
                {form.formState.errors.visit_date && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.visit_date.message as string}
                  </p>
                )}
              </div>

              {/* Chief complaint */}
              <div className="grid gap-2">
                <Label>{t("chief_complaint")}</Label>
                <Textarea
                  {...form.register("chief_complaint")}
                  rows={2}
                  placeholder={t("chief_complaint")}
                />
              </div>

              {/* Diagnosis */}
              <div className="grid gap-2">
                <Label>{t("diagnosis")}</Label>
                <Textarea
                  {...form.register("diagnosis")}
                  rows={2}
                  placeholder={t("diagnosis")}
                />
              </div>

              {/* Treatment performed */}
              <div className="grid gap-2">
                <Label>{t("treatment_performed")}</Label>
                <Textarea
                  {...form.register("treatment_performed")}
                  rows={2}
                  placeholder={t("treatment_performed")}
                />
              </div>

              {/* Prescription */}
              <div className="grid gap-2">
                <Label>{t("prescription")}</Label>
                <Textarea
                  {...form.register("prescription")}
                  rows={2}
                  placeholder={t("prescription")}
                />
              </div>

              {/* Next visit date */}
              <div className="grid gap-2">
                <Label>{t("next_visit_date")}</Label>
                <Controller
                  control={form.control}
                  name="next_visit_date"
                  render={({ field }) => (
                    <DatePickerField
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder={tc("buttons.select")}
                    />
                  )}
                />
              </div>

              {/* Clinical notes */}
              <div className="grid gap-2">
                <Label>{t("clinical_notes")}</Label>
                <Textarea
                  {...form.register("clinical_notes")}
                  rows={3}
                  placeholder={t("clinical_notes")}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
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
  )
}

function DatePickerField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (val: string) => void
  placeholder: string
}) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
          !value && "text-muted-foreground"
        )}
      >
        {value
          ? format(new Date(value + "T00:00:00"), "PPP")
          : placeholder}
        <CalendarIcon className="size-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value + "T00:00:00") : undefined}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "yyyy-MM-dd"))
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
