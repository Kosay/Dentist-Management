import type { ToothCondition, ToothSurface } from '@/types/database'

export interface ToothData {
  number: number
  name: string
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

const PERMANENT_NAMES: Record<number, string> = {
  1: 'Central Incisor',
  2: 'Lateral Incisor',
  3: 'Canine',
  4: 'First Premolar',
  5: 'Second Premolar',
  6: 'First Molar',
  7: 'Second Molar',
  8: 'Third Molar (Wisdom)',
}

const PRIMARY_NAMES: Record<number, string> = {
  1: 'Central Incisor',
  2: 'Lateral Incisor',
  3: 'Canine',
  4: 'First Molar',
  5: 'Second Molar',
}

function isAnterior(position: number, isPrimary: boolean): boolean {
  if (isPrimary) return position <= 3
  return position <= 3
}

function buildTeeth(
  quadrant: number,
  count: number,
  nameMap: Record<number, string>,
  isPrimary: boolean
): ToothData[] {
  return Array.from({ length: count }, (_, i) => {
    const position = i + 1
    const number = quadrant * 10 + position
    return {
      number,
      name: nameMap[position] ?? `Tooth ${number}`,
      quadrant,
      position,
      surfaces: isAnterior(position, isPrimary) ? ANTERIOR_SURFACES : POSTERIOR_SURFACES,
    }
  })
}

export const PERMANENT_TEETH: ToothData[] = [
  ...buildTeeth(1, 8, PERMANENT_NAMES, false),
  ...buildTeeth(2, 8, PERMANENT_NAMES, false),
  ...buildTeeth(3, 8, PERMANENT_NAMES, false),
  ...buildTeeth(4, 8, PERMANENT_NAMES, false),
]

export const PRIMARY_TEETH: ToothData[] = [
  ...buildTeeth(5, 5, PRIMARY_NAMES, true),
  ...buildTeeth(6, 5, PRIMARY_NAMES, true),
  ...buildTeeth(7, 5, PRIMARY_NAMES, true),
  ...buildTeeth(8, 5, PRIMARY_NAMES, true),
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
}

export const CONDITIONS: ToothCondition[] = [
  'healthy',
  'planned',
  'in_progress',
  'completed',
  'diseased',
  'missing',
]

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
