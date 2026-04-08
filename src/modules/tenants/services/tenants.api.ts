import { apiClient } from '@/core/http/apiClient'
import type { Pagination } from '@/modules/users/services/users.api'

export type TenantItem = {
  id: number
  name: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

type TenantsResponse = {
  success: boolean
  message: string
  data: { items: TenantItem[]; pagination: Pagination }
}

type TenantStatusResponse = {
  success: boolean
  message: string
  data: { tenant: TenantItem }
}

export const tenantsApi = {
  list(perPage = 15, page = 1) {
    return apiClient.get<TenantsResponse>('/tenants', { params: { per_page: perPage, page } })
  },
  updateStatus(tenantId: number, status: 'active' | 'suspended') {
    return apiClient.patch<TenantStatusResponse>(`/tenants/${tenantId}/status`, { status })
  },
}
