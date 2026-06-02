const CURRENCY_CODE = 'SYP'

export function formatCurrency(amount: number, locale = 'en'): string {
  const localeTag = locale === 'ar' ? 'ar-SY' : 'en-SY'

  try {
    return new Intl.NumberFormat(localeTag, {
      style: 'currency',
      currency: CURRENCY_CODE,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    const formatted = amount.toLocaleString(localeTag, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return locale === 'ar' ? `${formatted} ل.س` : `SYP ${formatted}`
  }
}

export function formatCurrencyDecimal(amount: number, locale = 'en'): string {
  const localeTag = locale === 'ar' ? 'ar-SY' : 'en-SY'

  try {
    return new Intl.NumberFormat(localeTag, {
      style: 'currency',
      currency: CURRENCY_CODE,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    const formatted = amount.toLocaleString(localeTag, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return locale === 'ar' ? `${formatted} ل.س` : `SYP ${formatted}`
  }
}
