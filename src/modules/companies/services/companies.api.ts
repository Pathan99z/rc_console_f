import { apiClient } from '@/core/http/apiClient'
import type { Pagination } from '@/modules/users/services/users.api'

export type CompanyItem = {
  id: number
  tenant_id: number
  name: string
  email: string | null
  phone: string | null
  website: string | null
  status: 'active' | 'inactive' | number
  created_at: string
  updated_at: string
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

export const companiesApi = {
  list(params: { per_page?: number; page?: number; search?: string; status?: number | '' }) {
    return apiClient.get<CompaniesListResponse>('/companies', { params })
  },
  create(payload: { name: string; email?: string; phone?: string; website?: string; status: number }) {
    return apiClient.post<CompanyResponse>('/companies', payload)
  },
  update(companyId: number, payload: { name: string; email?: string; phone?: string; website?: string; status: number }) {
    return apiClient.put<CompanyResponse>(`/companies/${companyId}`, payload)
  },
  remove(companyId: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/companies/${companyId}`)
  },
}
