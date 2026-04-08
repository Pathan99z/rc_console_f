import { apiClient } from '@/core/http/apiClient'

export type UserItem = {
  id: number
  tenant_id: number
  team_id?: number | null
  data_scope?: 'self' | 'team'
  role: 'global_admin' | 'company_admin' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
}

export type Pagination = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

type UsersListResponse = {
  success: boolean
  message: string
  data: { items: UserItem[]; pagination: Pagination }
}

type UserResponse = { success: boolean; message: string; data: { user: UserItem } }

export const usersApi = {
  list(perPage = 15, page = 1) {
    return apiClient.get<UsersListResponse>('/users', { params: { per_page: perPage, page } })
  },
  create(payload: {
    name: string
    email: string
    password: string
    status?: string
    tenant_id?: number
    role?: string
    team_id?: number | null
    data_scope?: 'self' | 'team'
  }) {
    return apiClient.post<UserResponse>('/users', payload)
  },
  updateStatus(userId: number, status: 'active' | 'inactive') {
    return apiClient.patch<UserResponse>(`/users/${userId}/status`, { status })
  },
  updateRole(userId: number, role: 'user' | 'company_admin') {
    return apiClient.patch<UserResponse>(`/users/${userId}/role`, { role })
  },
}
