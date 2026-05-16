export function fmtNumber(n: number | undefined | null, opts?: Intl.NumberFormatOptions) {
  if (n === undefined || n === null || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0, ...opts }).format(n)
}

export function fmtCurrency(n: number | undefined | null) {
  if (n === undefined || n === null || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function fmtPercent(n: number | undefined | null) {
  if (n === undefined || n === null || Number.isNaN(n)) return '—'
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n)}%`
}
