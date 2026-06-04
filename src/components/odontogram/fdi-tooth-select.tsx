'use client'

import { useTranslations } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  formatFdiToothLabel,
  getPermanentToothGroups,
  getPrimaryToothGroups,
  isPrimaryToothNumber,
} from '@/lib/odontogram-utils'

interface FdiToothSelectProps {
  value?: number
  onChange: (value: number | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function FdiToothSelect({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: FdiToothSelectProps) {
  const t = useTranslations('odontogram')

  const permanentGroups = getPermanentToothGroups()
  const primaryGroups = getPrimaryToothGroups()

  return (
    <Select
      value={value?.toString() ?? ''}
      onValueChange={(val) => onChange(val ? Number(val) : undefined)}
      disabled={disabled}
    >
      <SelectTrigger className={className ?? 'w-full'}>
        <SelectValue placeholder={placeholder ?? t('select_tooth')} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectGroup>
          <SelectLabel>{t('permanent_teeth')}</SelectLabel>
          {permanentGroups.map((group) => (
            <SelectGroup key={`perm-${group.labelKey}`}>
              <SelectLabel className="text-xs text-muted-foreground">
                {t(group.labelKey)}
              </SelectLabel>
              {group.teeth.map((tooth) => (
                <SelectItem key={tooth.number} value={tooth.number.toString()}>
                  {formatFdiToothLabel(tooth, false)}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>{t('primary_teeth')}</SelectLabel>
          {primaryGroups.map((group) => (
            <SelectGroup key={`prim-${group.labelKey}`}>
              <SelectLabel className="text-xs text-muted-foreground">
                {t(group.labelKey)}
              </SelectLabel>
              {group.teeth.map((tooth) => (
                <SelectItem key={tooth.number} value={tooth.number.toString()}>
                  {formatFdiToothLabel(tooth, true)}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export function formatSelectedToothLabel(toothNumber?: number): string | undefined {
  if (!toothNumber) return undefined
  const isPrimary = isPrimaryToothNumber(toothNumber)
  const groups = isPrimary ? getPrimaryToothGroups() : getPermanentToothGroups()
  for (const group of groups) {
    const tooth = group.teeth.find((item) => item.number === toothNumber)
    if (tooth) {
      return formatFdiToothLabel(tooth, isPrimary)
    }
  }
  return `FDI ${toothNumber}`
}
