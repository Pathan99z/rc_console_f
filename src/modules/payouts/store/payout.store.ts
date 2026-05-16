import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { payoutApi } from '@/modules/payouts/services/payout.api'
import type {
  GeneratePayoutPayload,
  MarkPaidPayload,
  OrganizationDashboardPayouts,
  PayoutAdjustment,
  PayoutBankAccount,
  PayoutBatchSummary,
  PayoutDetail,
  PayoutDispute,
  PayoutListParams,
  PayoutReconciliation,
  PayoutStatement,
  PayoutSummary,
  PayoutWorkflowPayload,
  PortalPayoutSummary,
  PortalStatementItem,
} from '@/modules/payouts/types/payout.types'
import type { Pagination } from '@/modules/users/services/users.api'

const emptyPagination = (): Pagination => ({
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
})

export const usePayoutStore = defineStore('payout', () => {
  const message = ref('')
  const loading = ref(false)
  const detailLoading = ref(false)

  const payouts = ref<PayoutSummary[]>([])
  const pagination = ref<Pagination>(emptyPagination())
  const currentPayout = ref<PayoutDetail | null>(null)
  const statement = ref<PayoutStatement | null>(null)
  const reconciliation = ref<PayoutReconciliation | null>(null)
  const batches = ref<PayoutBatchSummary[]>([])
  const currentBatch = ref<PayoutBatchSummary | null>(null)
  const adjustments = ref<PayoutAdjustment[]>([])
  const disputes = ref<PayoutDispute[]>([])
  const accounts = ref<PayoutBankAccount[]>([])
  const dashboardPayouts = ref<OrganizationDashboardPayouts | null>(null)

  const portalPayouts = ref<PortalPayoutSummary[]>([])
  const portalStatements = ref<PortalStatementItem[]>([])
  const portalPagination = ref<Pagination>(emptyPagination())

  async function fetchPayouts(params?: PayoutListParams) {
    loading.value = true
    try {
      const { data } = await payoutApi.list(params)
      payouts.value = data.data.items
      pagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      message.value = toApiError(error).message
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchPayout(id: number) {
    detailLoading.value = true
    try {
      const { data } = await payoutApi.get(id)
      currentPayout.value = data.data.payout
      message.value = data.message
      return data.data.payout
    } catch (error) {
      message.value = toApiError(error).message
      throw error
    } finally {
      detailLoading.value = false
    }
  }

  async function generatePayouts(payload: GeneratePayoutPayload) {
    const { data } = await payoutApi.generate(payload)
    message.value = data.message
    return data.data.payouts
  }

  async function runWorkflow(id: number, action: string, payload?: PayoutWorkflowPayload) {
    let response
    switch (action) {
      case 'submit':
        response = await payoutApi.submit(id)
        break
      case 'approve':
        response = await payoutApi.approve(id)
        break
      case 'reject':
        response = await payoutApi.reject(id, payload || {})
        break
      case 'process':
        response = await payoutApi.process(id)
        break
      case 'fail':
        response = await payoutApi.fail(id, payload || {})
        break
      case 'reverse':
        response = await payoutApi.reverse(id, payload || {})
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }
    currentPayout.value = response.data.data.payout
    message.value = response.data.message
    return currentPayout.value
  }

  async function markPaid(id: number, payload: MarkPaidPayload) {
    const { data } = await payoutApi.markPaid(id, payload)
    currentPayout.value = data.data.payout
    message.value = data.message
    return currentPayout.value
  }

  async function fetchStatement(id: number) {
    const { data } = await payoutApi.getStatement(id)
    statement.value = data.data.statement
    message.value = data.message
    return statement.value
  }

  async function fetchReconciliation(params?: { from?: string; to?: string }) {
    loading.value = true
    try {
      const { data } = await payoutApi.reconciliation(params)
      reconciliation.value = data.data.reconciliation
      message.value = data.message
    } catch (error) {
      message.value = toApiError(error).message
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchAdjustments(page = 1) {
    const { data } = await payoutApi.listAdjustments({ page, per_page: 15 })
    adjustments.value = data.data.items
    message.value = data.message
  }

  async function fetchDisputes(page = 1) {
    const { data } = await payoutApi.listDisputes({ page, per_page: 15 })
    disputes.value = data.data.items
    message.value = data.message
  }

  async function fetchAccounts(organizationId?: number) {
    const { data } = await payoutApi.listAccounts({ organization_id: organizationId, per_page: 50 })
    accounts.value = data.data.items
    message.value = data.message
  }

  async function fetchPartnerPayouts(page = 1, status?: string) {
    loading.value = true
    try {
      const { data } = await payoutApi.partnerList({ page, per_page: 15, status })
      portalPayouts.value = data.data.items
      portalPagination.value = data.data.pagination
      message.value = data.message
    } finally {
      loading.value = false
    }
  }

  async function fetchResellerPayouts(page = 1, status?: string) {
    loading.value = true
    try {
      const { data } = await payoutApi.resellerList({ page, per_page: 15, status })
      portalPayouts.value = data.data.items
      portalPagination.value = data.data.pagination
      message.value = data.message
    } finally {
      loading.value = false
    }
  }

  async function fetchPortalPayout(id: number, portal: 'partner' | 'reseller') {
    detailLoading.value = true
    try {
      const { data } = portal === 'partner' ? await payoutApi.partnerGet(id) : await payoutApi.resellerGet(id)
      currentPayout.value = data.data.payout
      message.value = data.message
    } finally {
      detailLoading.value = false
    }
  }

  async function fetchPortalStatements(portal: 'partner' | 'reseller') {
    const { data } = portal === 'partner' ? await payoutApi.partnerStatements() : await payoutApi.resellerStatements()
    portalStatements.value = data.data.statements
    message.value = data.message
  }

  function setDashboardPayouts(data: OrganizationDashboardPayouts | null) {
    dashboardPayouts.value = data
  }

  return {
    message,
    loading,
    detailLoading,
    payouts,
    pagination,
    currentPayout,
    statement,
    reconciliation,
    batches,
    currentBatch,
    adjustments,
    disputes,
    accounts,
    dashboardPayouts,
    portalPayouts,
    portalStatements,
    portalPagination,
    fetchPayouts,
    fetchPayout,
    generatePayouts,
    runWorkflow,
    markPaid,
    fetchStatement,
    fetchReconciliation,
    fetchAdjustments,
    fetchDisputes,
    fetchAccounts,
    fetchPartnerPayouts,
    fetchResellerPayouts,
    fetchPortalPayout,
    fetchPortalStatements,
    setDashboardPayouts,
  }
})
