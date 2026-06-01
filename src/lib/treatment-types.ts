export const TREATMENT_TYPE_SLUGS = [
  'filling',
  'crown',
  'root_canal',
  'extraction',
  'cleaning',
  'whitening',
  'implant',
  'bridge',
  'denture',
  'orthodontics',
  'veneer',
  'sealant',
] as const

export type TreatmentTypeSlug = (typeof TREATMENT_TYPE_SLUGS)[number]

const LEGACY_TYPE_MAP: Record<string, TreatmentTypeSlug> = {
  Filling: 'filling',
  Crown: 'crown',
  'Root Canal': 'root_canal',
  Extraction: 'extraction',
  Cleaning: 'cleaning',
  Whitening: 'whitening',
  Implant: 'implant',
  Bridge: 'bridge',
  Denture: 'denture',
  Orthodontics: 'orthodontics',
  Veneer: 'veneer',
  Sealant: 'sealant',
}

export function normalizeTreatmentType(value: string): string {
  if ((TREATMENT_TYPE_SLUGS as readonly string[]).includes(value)) {
    return value
  }
  return LEGACY_TYPE_MAP[value] ?? value
}

export function isTreatmentTypeSlug(value: string): value is TreatmentTypeSlug {
  return (TREATMENT_TYPE_SLUGS as readonly string[]).includes(value)
}

export function getTreatmentTypeLabel(
  translate: (key: string) => string,
  value: string
): string {
  const slug = normalizeTreatmentType(value)
  if (isTreatmentTypeSlug(slug)) {
    return translate(`types.${slug}`)
  }
  return value
}
