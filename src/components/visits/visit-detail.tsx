"use client"

import { useTranslations } from "next-intl"
import { format } from "date-fns"
import {
  Calendar,
  Stethoscope,
  FileText,
  Pill,
  ClipboardList,
  CalendarClock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Tables } from "@/types/database"

interface VisitDetailProps {
  visit: Tables<"visits">
}

function InfoSection({
  icon: Icon,
  title,
  content,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  content: string | null | undefined
}) {
  if (!content) return null

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        {title}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
    </div>
  )
}

export function VisitDetail({ visit }: VisitDetailProps) {
  const t = useTranslations("visits")

  const formattedDate = visit.visit_date
    ? format(new Date(visit.visit_date + "T00:00:00"), "PPP")
    : "—"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{t("visit_details")}</CardTitle>
        <Badge variant="secondary" className="gap-1.5">
          <Calendar className="size-3" />
          {formattedDate}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <InfoSection
            icon={Stethoscope}
            title={t("chief_complaint")}
            content={visit.chief_complaint}
          />
          <InfoSection
            icon={FileText}
            title={t("diagnosis")}
            content={visit.diagnosis}
          />
          <InfoSection
            icon={ClipboardList}
            title={t("treatment_performed")}
            content={visit.treatment_performed}
          />
          <InfoSection
            icon={Pill}
            title={t("prescription")}
            content={visit.prescription}
          />
          <InfoSection
            icon={FileText}
            title={t("clinical_notes")}
            content={visit.clinical_notes}
          />
          {visit.next_visit_date && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CalendarClock className="size-4" />
                {t("next_visit_date")}
              </div>
              <p className="text-sm">
                {format(
                  new Date(visit.next_visit_date + "T00:00:00"),
                  "PPP"
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
