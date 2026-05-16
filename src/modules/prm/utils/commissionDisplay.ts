import type { CommissionAccrualItem } from '@/modules/prm/types/prm.types'

export function accrualPartnerLabel(row: CommissionAccrualItem): string {
  const org = row.partner_organization
  if (org) {
    const name = (org.display_name || org.legal_name || org.name || '').trim()
    if (name) return org.type ? `${name} (${org.type})` : name
  }
  if (row.partner_organization_id) return `Org #${row.partner_organization_id}`
  return '—'
}

export function accrualQuoteLabel(row: CommissionAccrualItem): string {
  const q = row.quote
  if (q?.quote_number) {
    return q.deal_name ? `${q.quote_number} · ${q.deal_name}` : q.quote_number
  }
  if (row.quote_id) return `Quote #${row.quote_id}`
  return '—'
}

export function accrualAmountLabel(row: CommissionAccrualItem): string {
  const amount = row.commission_amount ?? row.amount
  if (amount == null) return '—'
  const currency = row.currency_code || 'ZAR'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(amount))
  } catch {
    return `${amount} ${currency}`
  }
}

export function accrualSummaryLabel(row: CommissionAccrualItem): string {
  const s = row.summary?.trim()
  if (s) return s
  return `${accrualPartnerLabel(row)} · ${accrualQuoteLabel(row)} · ${accrualAmountLabel(row)}`
}

export function accrualPayoutLabel(row: CommissionAccrualItem): string {
  const p = row.payout
  if (p?.payout_number) return `${p.payout_number} (${p.status || '—'})`
  if (row.in_payout) return 'In payout'
  return '—'
}

export function accrualCanSelectForPayout(row: CommissionAccrualItem): boolean {
  return String(row.status) === 'approved' && row.available_for_payout !== false && !row.in_payout
}
