import { createClient } from '@/lib/supabase/client'
import type { ToothCondition, TreatmentStatus } from '@/types/database'
import { PERMANENT_TEETH, PRIMARY_TEETH, getDisplayQuadrantLabel } from '@/components/odontogram/tooth-data'

function treatmentStatusToCondition(status: TreatmentStatus): ToothCondition {
  switch (status) {
    case 'planned': return 'planned'
    case 'in_progress': return 'in_progress'
    case 'completed': return 'completed'
    case 'cancelled': return 'healthy'
  }
}

export async function syncTreatmentToOdontogram({
  clinicId,
  patientId,
  toothNumber,
  treatmentStatus,
}: {
  clinicId: string
  patientId: string
  toothNumber: number
  treatmentStatus: TreatmentStatus
}) {
  const supabase = createClient()
  const isPrimary = toothNumber >= 51
  const allTeeth = isPrimary ? PRIMARY_TEETH : PERMANENT_TEETH
  const tooth = allTeeth.find((t) => t.number === toothNumber)
  if (!tooth) return

  const condition = treatmentStatusToCondition(treatmentStatus)

  // Find or create dental chart
  let chart: { id: string } | null = null
  {
    const { data } = await supabase
      .from('dental_charts')
      .select('id')
      .eq('patient_id', patientId)
      .eq('is_primary', isPrimary)
      .maybeSingle()
    chart = data as { id: string } | null
  }

  if (!chart) {
    const { data: newChart, error } = await supabase
      .from('dental_charts')
      .insert({ clinic_id: clinicId, patient_id: patientId, is_primary: isPrimary } as never)
      .select('id')
      .single()
    if (error || !newChart) return
    chart = newChart as { id: string }
  }

  // Get existing tooth record
  let existing: { id: string; condition: string } | null = null
  {
    const { data } = await supabase
      .from('tooth_records')
      .select('id, condition')
      .eq('chart_id', chart.id)
      .eq('tooth_number', toothNumber)
      .maybeSingle()
    existing = data as { id: string; condition: string } | null
  }

  if (existing) {
    // Only update condition if the new one is more actionable
    const priority: Record<ToothCondition, number> = {
      healthy: 0, planned: 1, in_progress: 2, completed: 3,
      diseased: 4, missing: 5, implant_planned: 6, denture_planned: 6,
    }
    const currentPriority = priority[existing.condition as ToothCondition] ?? 0
    const newPriority = priority[condition] ?? 0
    // Always update so dentist's explicit choice is reflected
    if (currentPriority !== newPriority || existing.condition !== condition) {
      await supabase
        .from('tooth_records')
        .update({ condition, updated_at: new Date().toISOString() } as never)
        .eq('id', existing.id)
    }
  } else {
    // Create tooth record with condition
    const quadrantLabel = getDisplayQuadrantLabel(tooth.quadrant, isPrimary)
    const { data: toothRecord, error: toothError } = await supabase
      .from('tooth_records')
      .insert({
        chart_id: chart.id,
        clinic_id: clinicId,
        tooth_number: toothNumber,
        tooth_name: tooth.nameKey,
        quadrant: quadrantLabel,
        position: tooth.position,
        condition,
      } as never)
      .select('id')
      .single()

    if (toothError || !toothRecord) return

    // Create surface records for the tooth
    const record = toothRecord as { id: string }
    const surfaceInserts = tooth.surfaces.map((surface) => ({
      tooth_record_id: record.id,
      clinic_id: clinicId,
      surface,
      condition: 'healthy' as const,
    }))

    if (surfaceInserts.length > 0) {
      await supabase
        .from('surface_records')
        .insert(surfaceInserts as never)
    }
  }
}
