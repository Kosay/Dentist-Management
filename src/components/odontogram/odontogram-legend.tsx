'use client'

import { useTranslations } from 'next-intl'
import { CONDITION_COLORS, CONDITIONS } from './tooth-data'

export function OdontogramLegend() {
  const t = useTranslations('odontogram')

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {CONDITIONS.map((condition) => (
        <div key={condition} className="flex items-center gap-1.5">
          <span
            className="inline-block size-3.5 shrink-0 rounded-sm ring-1 ring-foreground/15"
            style={{ backgroundColor: CONDITION_COLORS[condition] }}
          />
          <span className="text-xs text-muted-foreground">
            {t(`conditions.${condition}`)}
          </span>
        </div>
      ))}
    </div>
  )
}
