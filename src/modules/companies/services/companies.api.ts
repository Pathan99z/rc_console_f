import { apiClient } from '@/core/http/apiClient'
import type { Pagination } from '@/modules/users/services/users.api'

export type CompanyItem = {
  id: number
  tenant_id: number
  name: string
  industry?: string | null
  company_type?: string | null
  employees?: number | null
  revenue?: string | number | null
  timezone?: string | null
  linkedin_url?: string | null
  assigned_user_id?: number | null
  address?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
  description?: string | null
  email: string | null
  phone: string | null
  website: string | null
  status: 'active' | 'inactive' | number
  created_by_user?: { id: number; name: string; email: string } | null
  assigned_user?: { id: number; name: string; email: string } | null
  created_at: string
  updated_at: string
}

export type CompanyPayload = {
  name: string
  website?: string
  industry?: string
  company_type?: string
  employees?: number
  revenue?: number
  phone?: string
  email?: string
  timezone?: string
  linkedin_url?: string
  assigned_user_id?: number
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  description?: string
  status?: number
}

type CompaniesListResponse = {
  success: boolean
  message: string
  data: { items: CompanyItem[]; pagination: Pagination }
}

type CompanyResponse = {
  success: boolean
  message: string
  data: { company: CompanyItem }
}

type ImportCompaniesResponse = {
  success: boolean
  message: string
  data: { created: number; skipped: number }
}

export const companiesApi = {
  list(params: { per_page?: number; page?: number; search?: string; status?: number | '' }) {
    return apiClient.get<CompaniesListResponse>('/companies', { params })
  },
  create(payload: CompanyPayload) {
    return apiClient.post<CompanyResponse>('/companies', payload)
  },
  update(companyId: number, payload: CompanyPayload) {
    return apiClient.put<CompanyResponse>(`/companies/${companyId}`, payload)
  },
  detail(companyId: number) {
    return apiClient.get<CompanyResponse>(`/companies/${companyId}`)
  },
  remove(companyId: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/companies/${companyId}`)
  },
  importCsv(file: File, tenantId?: number) {
    const form = new FormData()
    form.append('file', file)
    if (tenantId) form.append('tenant_id', String(tenantId))
    return apiClient.post<ImportCompaniesResponse>('/companies/import', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  exportCsv(params: { search?: string; status?: number | ''; tenant_id?: number | '' }) {
    return apiClient.get('/companies/export', { params, responseType: 'blob' })
  },
}
