import { apiClient } from '@/core/http/apiClient'
import type {
  ApiEnvelope,
  CreatePayoutAccountPayload,
  GeneratePayoutPayload,
  MarkPaidPayload,
  PayoutAdjustment,
  PayoutBankAccount,
  PayoutBatchSummary,
  PayoutDetailResponse,
  PayoutDispute,
  PayoutListParams,
  PayoutListResponse,
  PayoutReconciliation,
  PayoutStatement,
  PayoutSummary,
  PayoutWorkflowPayload,
  PortalPayoutSummary,
  PortalStatementItem,
} from '@/modules/payouts/types/payout.types'
import type { Pagination } from '@/modules/users/services/users.api'

function payoutAction(id: number, action: string, payload?: PayoutWorkflowPayload) {
  return apiClient.post<PayoutDetailResponse>(`/prm/payouts/${id}/${action}`, payload ?? {})
}

export const payoutApi = {
  list(params?: PayoutListParams) {
    return apiClient.get<PayoutListResponse>('/prm/payouts', { params })
  },

  get(id: number) {
    return apiClient.get<PayoutDetailResponse>(`/prm/payouts/${id}`)
  },

  generate(payload: GeneratePayoutPayload) {
    return apiClient.post<ApiEnvelope<{ payouts: PayoutSummary[] }>>('/prm/payouts/generate', payload)
  },

  submit(id: number) {
    return payoutAction(id, 'submit')
  },

  approve(id: number) {
    return payoutAction(id, 'approve')
  },

  reject(id: number, payload: PayoutWorkflowPayload) {
    return payoutAction(id, 'reject', payload)
  },

  process(id: number) {
    return payoutAction(id, 'process')
  },

  fail(id: number, payload: PayoutWorkflowPayload) {
    return payoutAction(id, 'fail', payload)
  },

  reverse(id: number, payload: PayoutWorkflowPayload) {
    return payoutAction(id, 'reverse', payload)
  },

  markPaid(id: number, payload: MarkPaidPayload) {
    const form = new FormData()
    form.append('payment_method', payload.payment_method)
    form.append('remittance_reference', payload.remittance_reference)
    if (payload.payment_date) form.append('payment_date', payload.payment_date)
    if (payload.remarks) form.append('remarks', payload.remarks)
    if (payload.supporting_document) form.append('supporting_document', payload.supporting_document)
    return apiClient.post<PayoutDetailResponse>(`/prm/payouts/${id}/mark-paid`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getStatement(id: number) {
    return apiClient.get<ApiEnvelope<{ statement: PayoutStatement }>>(`/prm/payouts/${id}/statement`)
  },

  downloadProof(id: number) {
    return apiClient.get(`/prm/payouts/${id}/proof`, { responseType: 'blob' })
  },

  exportCsv(params?: PayoutListParams) {
    return apiClient.get('/prm/payouts/export', { params, responseType: 'blob' })
  },

  reconciliation(params?: { from?: string; to?: string }) {
    return apiClient.get<ApiEnvelope<{ reconciliation: PayoutReconciliation }>>('/prm/payout-reconciliation', { params })
  },

  createBatch(payoutIds: number[]) {
    return apiClient.post<ApiEnvelope<{ batch: PayoutBatchSummary }>>('/prm/payout-batches', { payout_ids: payoutIds })
  },

  getBatch(batchId: number) {
    return apiClient.get<ApiEnvelope<{ batch: PayoutBatchSummary; payouts?: PayoutSummary[] }>>(`/prm/payout-batches/${batchId}`)
  },

  processBatch(batchId: number) {
    return apiClient.post<ApiEnvelope<{ batch: PayoutBatchSummary }>>(`/prm/payout-batches/${batchId}/process`)
  },

  markBatchPaid(batchId: number, payload: Omit<MarkPaidPayload, 'supporting_document'>) {
    return apiClient.post<ApiEnvelope<{ batch: PayoutBatchSummary }>>(`/prm/payout-batches/${batchId}/mark-paid`, payload)
  },

  listAdjustments(params?: { per_page?: number; page?: number }) {
    return apiClient.get<ApiEnvelope<{ items: PayoutAdjustment[]; pagination: Pagination }>>('/prm/payout-adjustments', { params })
  },

  createAdjustment(payload: {
    organization_id: number
    payout_id?: number
    type: 'credit' | 'debit'
    amount: number
    currency_code: string
    reason: string
    remarks?: string
  }) {
    return apiClient.post<ApiEnvelope<{ adjustment: PayoutAdjustment }>>('/prm/payout-adjustments', payload)
  },

  listDisputes(params?: { per_page?: number; page?: number }) {
    return apiClient.get<ApiEnvelope<{ items: PayoutDispute[]; pagination: Pagination }>>('/prm/payout-disputes', { params })
  },

  createDispute(payload: { payout_id: number; description: string }) {
    return apiClient.post<ApiEnvelope<{ dispute: PayoutDispute }>>('/prm/payout-disputes', payload)
  },

  resolveDispute(disputeId: number, payload: { resolution: string }) {
    return apiClient.post<ApiEnvelope<{ dispute: PayoutDispute }>>(`/prm/payout-disputes/${disputeId}/resolve`, payload)
  },

  rejectDispute(disputeId: number, payload: { resolution: string }) {
    return apiClient.post<ApiEnvelope<{ dispute: PayoutDispute }>>(`/prm/payout-disputes/${disputeId}/reject`, payload)
  },

  listAccounts(params?: { organization_id?: number; per_page?: number; page?: number }) {
    return apiClient.get<ApiEnvelope<{ items: PayoutBankAccount[]; pagination: Pagination }>>('/prm/payout-accounts', { params })
  },

  createAccount(payload: CreatePayoutAccountPayload) {
    return apiClient.post<ApiEnvelope<{ account: PayoutBankAccount }>>('/prm/payout-accounts', payload)
  },

  updateAccount(accountId: number, payload: Partial<CreatePayoutAccountPayload>) {
    return apiClient.patch<ApiEnvelope<{ account: PayoutBankAccount }>>(`/prm/payout-accounts/${accountId}`, payload)
  },

  verifyAccount(accountId: number) {
    return apiClient.post<ApiEnvelope<{ account: PayoutBankAccount }>>(`/prm/payout-accounts/${accountId}/verify`)
  },

  partnerList(params?: { per_page?: number; page?: number; status?: string }) {
    return apiClient.get<ApiEnvelope<{ items: PortalPayoutSummary[]; pagination: Pagination }>>('/prm/partner/payouts', { params })
  },

  partnerGet(id: number) {
    return apiClient.get<PayoutDetailResponse>(`/prm/partner/payouts/${id}`)
  },

  partnerStatements() {
    return apiClient.get<ApiEnvelope<{ statements: PortalStatementItem[] }>>('/prm/partner/payouts/statements')
  },

  resellerList(params?: { per_page?: number; page?: number; status?: string }) {
    return apiClient.get<ApiEnvelope<{ items: PortalPayoutSummary[]; pagination: Pagination }>>('/prm/reseller/payouts', { params })
  },

  resellerGet(id: number) {
    return apiClient.get<PayoutDetailResponse>(`/prm/reseller/payouts/${id}`)
  },

  resellerStatements() {
    return apiClient.get<ApiEnvelope<{ statements: PortalStatementItem[] }>>('/prm/reseller/payouts/statements')
  },
}
