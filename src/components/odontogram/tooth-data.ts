import type { ToothCondition, ToothSurface } from '@/types/database'

export interface ToothData {
  number: number
  displayLabel: string
  nameKey: string
  quadrant: number
  position: number
  surfaces: ToothSurface[]
}

export interface SurfaceCondition {
  surface: ToothSurface
  condition: ToothCondition
}

const ANTERIOR_SURFACES: ToothSurface[] = ['mesial', 'distal', 'buccal', 'lingual', 'incisal']
const POSTERIOR_SURFACES: ToothSurface[] = ['mesial', 'distal', 'buccal', 'lingual', 'occlusal']

const PERMANENT_NAME_KEYS: Record<number, string> = {
  1: 'central_incisor',
  2: 'lateral_incisor',
  3: 'canine',
  4: 'first_premolar',
  5: 'second_premolar',
  6: 'first_molar',
  7: 'second_molar',
  8: 'third_molar',
}

const PRIMARY_NAME_KEYS: Record<number, string> = {
  1: 'central_incisor',
  2: 'lateral_incisor',
  3: 'canine',
  4: 'first_molar',
  5: 'second_molar',
}

function isAnterior(position: number): boolean {
  return position <= 3
}

function getDisplayLabel(position: number, isPrimary: boolean): string {
  if (isPrimary) {
    return String.fromCharCode(64 + position)
  }
  return String(position)
}

function buildTeeth(
  quadrant: number,
  count: number,
  nameKeys: Record<number, string>,
  isPrimary: boolean
): ToothData[] {
  return Array.from({ length: count }, (_, i) => {
    const position = i + 1
    const number = quadrant * 10 + position
    return {
      number,
      displayLabel: getDisplayLabel(position, isPrimary),
      nameKey: nameKeys[position] ?? 'unknown',
      quadrant,
      position,
      surfaces: isAnterior(position) ? ANTERIOR_SURFACES : POSTERIOR_SURFACES,
    }
  })
}

export const PERMANENT_TEETH: ToothData[] = [
  ...buildTeeth(1, 8, PERMANENT_NAME_KEYS, false),
  ...buildTeeth(2, 8, PERMANENT_NAME_KEYS, false),
  ...buildTeeth(3, 8, PERMANENT_NAME_KEYS, false),
  ...buildTeeth(4, 8, PERMANENT_NAME_KEYS, false),
]

export const PRIMARY_TEETH: ToothData[] = [
  ...buildTeeth(5, 5, PRIMARY_NAME_KEYS, true),
  ...buildTeeth(6, 5, PRIMARY_NAME_KEYS, true),
  ...buildTeeth(7, 5, PRIMARY_NAME_KEYS, true),
  ...buildTeeth(8, 5, PRIMARY_NAME_KEYS, true),
]

export const TOOTH_SURFACES: ToothSurface[] = [
  'mesial',
  'distal',
  'buccal',
  'lingual',
  'occlusal',
  'incisal',
]

export const CONDITION_COLORS: Record<ToothCondition, string> = {
  healthy: '#FFFFFF',
  planned: '#3B82F6',
  in_progress: '#EAB308',
  completed: '#22C55E',
  diseased: '#EF4444',
  missing: '#9CA3AF',
  implant_planned: '#9333EA',
  denture_planned: '#F97316',
}

export const CONDITIONS: ToothCondition[] = [
  'healthy',
  'planned',
  'in_progress',
  'completed',
  'diseased',
  'missing',
  'implant_planned',
  'denture_planned',
]

export function getConditionRingColor(condition: ToothCondition): string | null {
  if (condition === 'healthy') return null
  return CONDITION_COLORS[condition]
}

export function isMissingLikeCondition(condition: ToothCondition): boolean {
  return (
    condition === 'missing' ||
    condition === 'implant_planned' ||
    condition === 'denture_planned'
  )
}

export function getTeethByQuadrant(teeth: ToothData[], quadrant: number): ToothData[] {
  return teeth.filter((t) => t.quadrant === quadrant)
}

export function getUpperArch(isPrimary: boolean): ToothData[] {
  const teeth = isPrimary ? PRIMARY_TEETH : PERMANENT_TEETH
  const q1 = getTeethByQuadrant(teeth, isPrimary ? 5 : 1)
  const q2 = getTeethByQuadrant(teeth, isPrimary ? 6 : 2)
  return [...q1.reverse(), ...q2]
}

export function getLowerArch(isPrimary: boolean): ToothData[] {
  const teeth = isPrimary ? PRIMARY_TEETH : PERMANENT_TEETH
  const q4 = getTeethByQuadrant(teeth, isPrimary ? 8 : 4)
  const q3 = getTeethByQuadrant(teeth, isPrimary ? 7 : 3)
  return [...q4.reverse(), ...q3]
}

export function hasCenterSurface(tooth: ToothData): 'occlusal' | 'incisal' {
  return tooth.surfaces.includes('occlusal') ? 'occlusal' : 'incisal'
}

export function getDisplayQuadrantLabel(quadrant: number, isPrimary: boolean): number {
  if (isPrimary) {
    return quadrant - 4
  }
  return quadrant
}
