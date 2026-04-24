import { apiClient } from '@/core/http/apiClient'
import type { Pagination } from '@/modules/users/services/users.api'

export type DealStatusCode = 0 | 1 | 2
export type DealStatusLabel = 'open' | 'won' | 'lost'

export type DealHistoryItem = {
  id: number
  event_type: string
  message?: string
  metadata?: Record<string, unknown> | null
  created_at: string
  actor?: { id: number; name: string; email?: string } | null
}

export type DealItem = {
  id: number
  tenant_id: number
  pipeline_id: number
  pipeline_stage_id: number
  contact_id: number
  company_id?: number | null
  owner_user_id?: number | null
  name: string
  estimated_value?: number | string | null
  value?: number | string | null
  currency_code?: string | null
  probability?: number | null
  expected_close_date?: string | null
  status: DealStatusCode | DealStatusLabel
  contact?: { id: number; first_name: string; last_name: string; email?: string | null } | null
  company?: { id: number; name: string } | null
  owner?: { id: number; name: string; email?: string } | null
  stage?: { id: number; name: string; stage_order?: number } | null
  pipeline?: { id: number; name: string } | null
  histories?: DealHistoryItem[]
  created_at: string
  updated_at: string
}

type DealsListResponse = {
  success: boolean
  message: string
  data: { items: DealItem[]; pagination: Pagination }
}

type DealResponse = {
  success: boolean
  message: string
  data: { deal: DealItem }
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const dealsApi = {
  list(params: {
    per_page?: number
    page?: number
    pipeline_id?: number | string
    pipeline_stage_id?: number | string
    owner_user_id?: number | string
    status?: DealStatusCode | ''
    search?: string
    tenant_id?: number | string
  }) {
    return apiClient.get<DealsListResponse>('/deals', {
      params: {
        page: params.page,
        per_page: params.per_page,
        pipeline_id: toOptionalNumber(params.pipeline_id),
        pipeline_stage_id: toOptionalNumber(params.pipeline_stage_id),
        owner_user_id: toOptionalNumber(params.owner_user_id),
        status: params.status === '' ? undefined : params.status,
        tenant_id: toOptionalNumber(params.tenant_id),
        search: params.search || undefined,
      },
    })
  },
  detail(dealId: number) {
    return apiClient.get<DealResponse>(`/deals/${dealId}`)
  },
  create(payload: {
    name: string
    contact_id: number
    company_id?: number
    owner_user_id?: number
    pipeline_id: number
    pipeline_stage_id: number
    value?: number
    currency_code?: string
    probability?: number
    expected_close_date?: string
    tenant_id?: number
  }) {
    return apiClient.post<DealResponse>('/deals', {
      ...payload,
      estimated_value: payload.value,
      currency_code: payload.currency_code || undefined,
      probability: payload.probability ?? undefined,
    })
  },
  update(
    dealId: number,
    payload: {
      name?: string
      contact_id?: number
      company_id?: number
      owner_user_id?: number
      pipeline_id?: number
      pipeline_stage_id?: number
      value?: number
      currency_code?: string
      probability?: number
      expected_close_date?: string
    }
  ) {
    return apiClient.put<DealResponse>(`/deals/${dealId}`, {
      ...payload,
      estimated_value: payload.value,
      currency_code: payload.currency_code || undefined,
      probability: payload.probability ?? undefined,
    })
  },
  remove(dealId: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/deals/${dealId}`)
  },
  moveStage(dealId: number, stageId: number) {
    return apiClient.post<DealResponse>(`/deals/${dealId}/move-stage`, { pipeline_stage_id: stageId })
  },
  updateStatus(dealId: number, status: DealStatusLabel) {
    return apiClient.patch<DealResponse>(`/deals/${dealId}/status`, { status })
  },
}
