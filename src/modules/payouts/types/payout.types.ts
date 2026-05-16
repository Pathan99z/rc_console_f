import type { Pagination } from '@/modules/users/services/users.api'

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export type PayoutStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'reversed'
  | 'cancelled'

export type PayoutPaymentMethod =
  | 'imps'
  | 'neft'
  | 'rtgs'
  | 'swift'
  | 'cheque'
  | 'cash'
  | 'manual_transfer'
  | 'other'

export type PayoutSummary = {
  id: number
  payout_number: string
  beneficiary_organization_id: number
  status: PayoutStatus
  currency_code: string
  gross_amount: number
  net_amount: number
  adjustment_amount?: number
  tax_amount?: number
  paid_at?: string | null
  remittance_reference?: string | null
  has_payment_proof?: boolean
  payment_method?: PayoutPaymentMethod | null
  created_at?: string
}

export type PayoutLineItem = {
  id: number
  commission_accrual_id: number
  amount: number
  currency_code?: string
  quote_id?: number
  payment_record_id?: number
  base_amount?: number
}

export type PayoutDetail = PayoutSummary & {
  remarks?: string | null
  failure_reason?: string | null
  period_from?: string | null
  period_to?: string | null
  line_items?: PayoutLineItem[]
  payment_proof_url?: string | null
}

export type PayoutListParams = {
  per_page?: number
  page?: number
  status?: PayoutStatus | string
  beneficiary_organization_id?: number
  payment_method?: string
  from?: string
  to?: string
}

export type PayoutListResponse = ApiEnvelope<{
  items: PayoutSummary[]
  pagination: Pagination
}>

export type PayoutDetailResponse = ApiEnvelope<{ payout: PayoutDetail }>

export type GeneratePayoutPayload = {
  beneficiary_organization_id?: number
  accrual_ids?: number[]
  period_from?: string
  period_to?: string
  tax_amount?: number
}

export type MarkPaidPayload = {
  payment_method: PayoutPaymentMethod
  remittance_reference: string
  payment_date?: string
  remarks?: string
  supporting_document?: File
}

export type PayoutWorkflowPayload = {
  remarks?: string
  failure_reason?: string
  reason?: string
  reference?: string
}

export type PayoutStatement = {
  payout: PayoutDetail
  beneficiary: {
    organization_id: number
    display_name?: string
    legal_name?: string
  }
  line_items: PayoutLineItem[]
  adjustments: unknown[]
  has_payment_proof: boolean
}

export type PayoutBatchSummary = {
  id: number
  batch_number: string
  status: string
  total_amount: number
  payout_count: number
}

export type PayoutAdjustment = {
  id: number
  organization_id: number
  payout_id?: number | null
  type: 'credit' | 'debit'
  amount: number
  currency_code: string
  reason: string
  remarks?: string | null
  created_at?: string
}

export type PayoutDispute = {
  id: number
  payout_id: number
  status: string
  description: string
  resolution?: string | null
  created_at?: string
}

export type PayoutBankAccount = {
  id: number
  organization_id: number
  account_holder_name: string
  bank_name: string
  branch_name?: string | null
  account_number_masked: string
  ifsc_code?: string | null
  swift_code?: string | null
  currency_code: string
  account_type?: string
  is_primary: boolean
  verification_status: string
  verified_at?: string | null
}

export type CreatePayoutAccountPayload = {
  organization_id: number
  account_holder_name: string
  account_number: string
  bank_name: string
  branch_name?: string
  ifsc_code?: string
  swift_code?: string
  currency_code: string
  account_type?: string
  is_primary?: boolean
}

export type PayoutReconciliation = {
  period: { from?: string; to?: string }
  customer_cash_in: number
  commission_accrued: number
  commission_liability_approved: number
  payouts_paid_out: number
  variance_cash_minus_accrued: number
  variance_accrued_minus_paid: number
}

export type OrganizationDashboardPayouts = {
  pending_approval_count?: number
  processing_amount?: number
  paid_mtd?: number
  failed_count?: number
  commission_liability_approved?: number
  last_payout_amount?: number
  last_payout_at?: string | null
  next_payout_estimate?: number
  recent?: PayoutSummary[]
}

export type PortalPayoutSummary = {
  id: number
  payout_number: string
  status: PayoutStatus
  net_amount: number
  paid_at?: string | null
  currency_code?: string
}

export type PortalStatementItem = {
  payout_id: number
  payout_number: string
  net_amount: number
  paid_at?: string | null
}
