"use client"

import { useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { Plus, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { DataTable, type Column } from "@/components/shared/data-table"
import { VisitForm } from "@/components/visits/visit-form"
import { VisitDetail } from "@/components/visits/visit-detail"
import { useVisits } from "@/hooks/use-visits"
import { usePatient } from "@/hooks/use-patients"
import type { Tables } from "@/types/database"

type Visit = Tables<"visits">

export default function PatientVisitsPage() {
  const params = useParams<{ id: string; locale: string }>()
  const patientId = params.id
  const locale = params.locale
  const router = useRouter()
  const t = useTranslations("visits")
  const tc = useTranslations("common")

  const [formOpen, setFormOpen] = useState(false)
  const [editingVisit, setEditingVisit] = useState<Visit | undefined>()
  const [selectedVisit, setSelectedVisit] = useState<Visit | undefined>()

  const { data: visits = [], isLoading } = useVisits(patientId)
  const { data: patient } = usePatient(patientId)

  const handleNewVisit = useCallback(() => {
    setEditingVisit(undefined)
    setFormOpen(true)
  }, [])

  const handleRowClick = useCallback((visit: Visit) => {
    setSelectedVisit((prev) => (prev?.id === visit.id ? undefined : visit))
  }, [])

  const handleEditVisit = useCallback((visit: Visit) => {
    setEditingVisit(visit)
    setFormOpen(true)
  }, [])

  const handleFormOpenChange = useCallback((open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingVisit(undefined)
  }, [])

  const columns: Column<Visit>[] = [
    {
      key: "visit_date",
      label: t("visit_date"),
      render: (visit) =>
        visit.visit_date
          ? format(new Date(visit.visit_date + "T00:00:00"), "PP")
          : "—",
    },
    {
      key: "chief_complaint",
      label: t("chief_complaint"),
      render: (visit) => (
        <span className="line-clamp-1 max-w-[200px]">
          {visit.chief_complaint || "—"}
        </span>
      ),
    },
    {
      key: "diagnosis",
      label: t("diagnosis"),
      render: (visit) => (
        <span className="line-clamp-1 max-w-[200px]">
          {visit.diagnosis || "—"}
        </span>
      ),
    },
    {
      key: "treatment_performed",
      label: t("treatment_performed"),
      render: (visit) => (
        <span className="line-clamp-1 max-w-[200px]">
          {visit.treatment_performed || "—"}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push(`/${locale}/patients/${patientId}`)}
        >
          <ArrowLeft />
        </Button>
        <PageHeader
          title={patient ? `${t("title")} – ${patient.full_name}` : t("title")}
          action={
            <Button
              size="sm"
              className="gap-1.5"
              onClick={handleNewVisit}
            >
              <Plus className="size-4" />
              {t("new_visit")}
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <DataTable<Record<string, unknown>>
            columns={columns as Column<Record<string, unknown>>[]}
            data={visits as unknown as Record<string, unknown>[]}
            emptyMessage={t("no_visits")}
            onRowClick={(item) => handleRowClick(item as unknown as Visit)}
          />

          {selectedVisit && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("visit_details")}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditVisit(selectedVisit)}
                >
                  {tc("buttons.edit")}
                </Button>
              </div>
              <VisitDetail visit={selectedVisit} />
            </div>
          )}
        </>
      )}

      <VisitForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        patientId={patientId}
        visit={editingVisit}
      />
    </div>
  )
}
