import { apiClient } from '@/core/http/apiClient'
import type { Pagination } from '@/modules/users/services/users.api'

export type TeamItem = {
  id: number
  tenant_id: number
  name: string
  status: number
  created_at: string
  updated_at: string
}

type TeamsListResponse = {
  success: boolean
  message: string
  data: { items: TeamItem[]; pagination: Pagination }
}

type TeamResponse = {
  success: boolean
  message: string
  data: { team: TeamItem }
}

export const teamsApi = {
  list(params: { per_page?: number; page?: number; search?: string; status?: number | '' }) {
    return apiClient.get<TeamsListResponse>('/teams', { params })
  },
  create(payload: { name: string; status: number }) {
    return apiClient.post<TeamResponse>('/teams', payload)
  },
  update(teamId: number, payload: { name: string; status: number }) {
    return apiClient.put<TeamResponse>(`/teams/${teamId}`, payload)
  },
  remove(teamId: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/teams/${teamId}`)
  },
}
