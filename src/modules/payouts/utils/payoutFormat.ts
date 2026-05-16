import type { PayoutStatus } from '@/modules/payouts/types/payout.types'
import type { AxiosResponse } from 'axios'

export function payoutStatusClass(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    submitted: 'bg-sky-50 text-sky-800',
    approved: 'bg-indigo-50 text-indigo-800',
    processing: 'bg-amber-50 text-amber-800',
    paid: 'bg-emerald-50 text-emerald-800',
    failed: 'bg-rose-50 text-rose-800',
    reversed: 'bg-purple-50 text-purple-800',
    cancelled: 'bg-slate-100 text-slate-500',
  }
  return map[status] || 'bg-slate-50 text-slate-700'
}

export function fmtPayoutAmount(amount: number | null | undefined, currency = 'ZAR'): string {
  if (amount == null || Number.isNaN(amount)) return '—'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function downloadBlobResponse(response: AxiosResponse<Blob>, filename: string) {
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
  const url = globalThis.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  globalThis.URL.revokeObjectURL(url)
}

export const PAYOUT_PAYMENT_METHODS = [
  'imps',
  'neft',
  'rtgs',
  'swift',
  'cheque',
  'cash',
  'manual_transfer',
  'other',
] as const

export const PAYOUT_STATUSES: PayoutStatus[] = [
  'draft',
  'submitted',
  'approved',
  'processing',
  'paid',
  'failed',
  'reversed',
  'cancelled',
]
