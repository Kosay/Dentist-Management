import type { ToothCondition } from '@/types/database'
import type { TreatmentStatus } from '@/types/database'
import {
  PERMANENT_TEETH,
  PRIMARY_TEETH,
  getDisplayQuadrantLabel,
  type ToothData,
} from '@/components/odontogram/tooth-data'

export function isPrimaryToothNumber(toothNumber: number): boolean {
  const quadrant = Math.floor(toothNumber / 10)
  return quadrant >= 5 && quadrant <= 8
}

export function findToothData(toothNumber: number): ToothData | undefined {
  const teeth = isPrimaryToothNumber(toothNumber) ? PRIMARY_TEETH : PERMANENT_TEETH
  return teeth.find((tooth) => tooth.number === toothNumber)
}

export function mapTreatmentStatusToCondition(
  status: TreatmentStatus
): ToothCondition {
  switch (status) {
    case 'planned':
      return 'planned'
    case 'in_progress':
      return 'in_progress'
    case 'completed':
      return 'completed'
    case 'cancelled':
      return 'healthy'
    default:
      return 'healthy'
  }
}

export interface FdiToothGroup {
  labelKey: string
  teeth: ToothData[]
}

export function getPermanentToothGroups(): FdiToothGroup[] {
  return [
    { labelKey: 'upper_right', teeth: getTeethByQuadrantOrdered(PERMANENT_TEETH, 1, true) },
    { labelKey: 'upper_left', teeth: getTeethByQuadrantOrdered(PERMANENT_TEETH, 2) },
    { labelKey: 'lower_left', teeth: getTeethByQuadrantOrdered(PERMANENT_TEETH, 3) },
    { labelKey: 'lower_right', teeth: getTeethByQuadrantOrdered(PERMANENT_TEETH, 4, true) },
  ]
}

export function getPrimaryToothGroups(): FdiToothGroup[] {
  return [
    { labelKey: 'upper_right', teeth: getTeethByQuadrantOrdered(PRIMARY_TEETH, 5, true) },
    { labelKey: 'upper_left', teeth: getTeethByQuadrantOrdered(PRIMARY_TEETH, 6) },
    { labelKey: 'lower_left', teeth: getTeethByQuadrantOrdered(PRIMARY_TEETH, 7) },
    { labelKey: 'lower_right', teeth: getTeethByQuadrantOrdered(PRIMARY_TEETH, 8, true) },
  ]
}

function getTeethByQuadrantOrdered(
  teeth: ToothData[],
  quadrant: number,
  reverse = false
): ToothData[] {
  const items = teeth
    .filter((tooth) => tooth.quadrant === quadrant)
    .sort((a, b) => a.position - b.position)
  return reverse ? [...items].reverse() : items
}

export function formatFdiToothLabel(tooth: ToothData, isPrimary: boolean): string {
  const quadrant = getDisplayQuadrantLabel(tooth.quadrant, isPrimary)
  return `${tooth.displayLabel} (FDI ${tooth.number}, Q${quadrant})`
}
