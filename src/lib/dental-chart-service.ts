import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  InsertTables,
  ToothCondition,
  TreatmentStatus,
} from '@/types/database'
import {
  getDisplayQuadrantLabel,
  PRIMARY_TEETH,
  PERMANENT_TEETH,
  type ToothData,
} from '@/components/odontogram/tooth-data'
import {
  findToothData,
  isPrimaryToothNumber,
  mapTreatmentStatusToCondition,
} from '@/lib/odontogram-utils'

type ToothRecordInsert = InsertTables<'tooth_records'>
type SurfaceRecordInsert = InsertTables<'surface_records'>

interface SyncTreatmentParams {
  clinicId: string
  patientId: string
  toothNumber: number
  status: TreatmentStatus
}

function getDefaultSurfaces(tooth: ToothData) {
  return tooth.surfaces.map((surface) => ({
    surface,
    condition: 'healthy' as ToothCondition,
  }))
}

async function getOrCreateChart(
  supabase: SupabaseClient,
  clinicId: string,
  patientId: string,
  isPrimary: boolean
) {
  const { data: existing, error: lookupError } = await supabase
    .from('dental_charts')
    .select('id')
    .eq('patient_id', patientId)
    .eq('is_primary', isPrimary)
    .maybeSingle()

  if (lookupError) throw lookupError
  if (existing) return existing

  const { data, error } = await supabase
    .from('dental_charts')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      is_primary: isPrimary,
    } as never)
    .select('id')
    .single()

  if (error) throw error
  return data as { id: string }
}

async function ensureSurfaceRecords(
  supabase: SupabaseClient,
  clinicId: string,
  toothRecordId: string,
  tooth: ToothData,
  condition: ToothCondition
) {
  const { data: existing, error: lookupError } = await supabase
    .from('surface_records')
    .select('surface')
    .eq('tooth_record_id', toothRecordId)

  if (lookupError) throw lookupError

  const existingSurfaces = new Set((existing ?? []).map((row) => row.surface))
  const missing = tooth.surfaces.filter((surface) => !existingSurfaces.has(surface))

  if (missing.length === 0) return

  const inserts: SurfaceRecordInsert[] = missing.map((surface) => ({
    tooth_record_id: toothRecordId,
    clinic_id: clinicId,
    surface,
    condition,
  }))

  const { error } = await supabase.from('surface_records').insert(inserts as never)
  if (error) throw error
}

/**
 * Best-effort sync from a treatment plan to the odontogram.
 * Failures are silent — treatment save is never blocked.
 */
export async function syncTreatmentToOdontogram(
  supabase: SupabaseClient,
  { clinicId, patientId, toothNumber, status }: SyncTreatmentParams
): Promise<void> {
  if (!toothNumber) return

  const tooth = findToothData(toothNumber)
  if (!tooth) return

  const isPrimary = isPrimaryToothNumber(toothNumber)
  const condition = mapTreatmentStatusToCondition(status)
  const chart = await getOrCreateChart(supabase, clinicId, patientId, isPrimary)

  const { data: existingRecord, error: recordLookupError } = await supabase
    .from('tooth_records')
    .select('id, condition')
    .eq('chart_id', chart.id)
    .eq('tooth_number', toothNumber)
    .maybeSingle()

  if (recordLookupError) throw recordLookupError

  if (existingRecord) {
    const { error: updateError } = await supabase
      .from('tooth_records')
      .update({ condition, updated_at: new Date().toISOString() } as never)
      .eq('id', existingRecord.id)

    if (updateError) throw updateError
    await ensureSurfaceRecords(supabase, clinicId, existingRecord.id, tooth, condition)
    return
  }

  const toothInsert: ToothRecordInsert = {
    chart_id: chart.id,
    clinic_id: clinicId,
    tooth_number: tooth.number,
    tooth_name: tooth.nameKey,
    quadrant: getDisplayQuadrantLabel(tooth.quadrant, isPrimary),
    position: tooth.position,
    condition,
    notes: null,
  }

  const { data: created, error: insertError } = await supabase
    .from('tooth_records')
    .insert(toothInsert as never)
    .select('id')
    .single()

  if (insertError) throw insertError

  const surfaceInserts: SurfaceRecordInsert[] = getDefaultSurfaces(tooth).map(
    (surfaceState) => ({
      tooth_record_id: created.id,
      clinic_id: clinicId,
      surface: surfaceState.surface,
      condition: surfaceState.condition,
    })
  )

  const { error: surfaceError } = await supabase
    .from('surface_records')
    .insert(surfaceInserts as never)

  if (surfaceError) throw surfaceError
}

export function getAllToothNumbers(): number[] {
  return [...PERMANENT_TEETH, ...PRIMARY_TEETH].map((tooth) => tooth.number)
}
