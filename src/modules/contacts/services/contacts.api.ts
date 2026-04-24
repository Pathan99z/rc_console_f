import { apiClient } from '@/core/http/apiClient'
import type { Pagination } from '@/modules/users/services/users.api'

export type LifecycleStage = 'lead' | 'prospect' | 'customer' | 'inactive'

export type ContactActivity = {
  id: number
  type: string
  note: string
  occurred_at: string
  created_at?: string
}

export type ContactItem = {
  id: number
  tenant_id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  lifecycle_stage: LifecycleStage
  company_id?: number | null
  assigned_user_id?: number | null
  meta?: Record<string, unknown> | null
  company?: { id: number; name: string } | null
  assigned_user?: { id: number; name: string; email: string } | null
  created_by_user?: { id: number; name: string; email: string } | null
  updated_by_user?: { id: number; name: string; email: string } | null
  activities?: ContactActivity[]
  created_at: string
  updated_at: string
}

type ContactsListResponse = {
  success: boolean
  message: string
  data: { items: ContactItem[]; pagination: Pagination }
}

type ContactResponse = {
  success: boolean
  message: string
  data: { contact: ContactItem }
}

type ContactDetailResponse = {
  success: boolean
  message: string
  data: { contact: ContactItem }
}

type ImportResponse = {
  success: boolean
  message: string
  data: { created: number; skipped: number }
}

const stageToCodeMap: Record<string, number> = {
  lead: 0,
  prospect: 1,
  customer: 2,
  inactive: 3,
}

function toQueryNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : undefined
}

function normalizeContactQuery(params: {
  per_page?: number
  page?: number
  stage?: number | string
  owner_id?: number | string
  company_id?: number | string
  search?: string
}) {
  const stageValue =
    typeof params.stage === 'string'
      ? stageToCodeMap[params.stage]
      : toQueryNumber(params.stage)

  return {
    page: params.page,
    per_page: params.per_page,
    stage: stageValue,
    owner_id: toQueryNumber(params.owner_id),
    company_id: toQueryNumber(params.company_id),
    search: params.search || undefined,
  }
}

export const contactsApi = {
  list(params: { per_page?: number; page?: number; stage?: number | string; owner_id?: number | string; company_id?: number | string; search?: string }) {
    return apiClient.get<ContactsListResponse>('/contacts', { params: normalizeContactQuery(params) })
  },
  detail(contactId: number) {
    return apiClient.get<ContactDetailResponse>(`/contacts/${contactId}`)
  },
  create(payload: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
    lifecycle_stage: number
    company_id?: number
    assigned_user_id?: number
    meta?: Record<string, unknown>
  }) {
    return apiClient.post<ContactResponse>('/contacts', payload)
  },
  update(contactId: number, payload: { lifecycle_stage?: number; assigned_user_id?: number }) {
    return apiClient.put<ContactResponse>(`/contacts/${contactId}`, payload)
  },
  remove(contactId: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/contacts/${contactId}`)
  },
  addActivity(contactId: number, payload: { type: string; note: string; occurred_at: string }) {
    return apiClient.post<ContactDetailResponse>(`/contacts/${contactId}/activities`, payload)
  },
  attachCompany(contactId: number, companyId: number) {
    return apiClient.post<ContactDetailResponse>(`/contacts/${contactId}/attach-company`, { company_id: companyId })
  },
  detachCompany(contactId: number) {
    return apiClient.post<ContactDetailResponse>(`/contacts/${contactId}/detach-company`, {})
  },
  importCsv(file: File) {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<ImportResponse>('/contacts/import', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  exportCsv(params: { stage?: number | string; owner_id?: number | string; company_id?: number | string; search?: string }) {
    return apiClient.get('/contacts/export', { params: normalizeContactQuery(params), responseType: 'blob' })
  },
}
