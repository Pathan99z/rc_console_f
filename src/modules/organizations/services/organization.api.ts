import { apiClient } from '@/core/http/apiClient'
import type {
  OrganizationListQuery,
  OrganizationParentOptionsQuery,
  OrganizationParentOptionsResponse,
  OrganizationPayload,
  OrganizationResponse,
  OrganizationsListResponse,
} from '@/modules/organizations/types/organization.types'

export const organizationsApi = {
  list(params: OrganizationListQuery) {
    return apiClient.get<OrganizationsListResponse>('/organizations', { params })
  },
  parentOptions(params: OrganizationParentOptionsQuery) {
    return apiClient.get<OrganizationParentOptionsResponse>('/organizations/parent-options', { params })
  },
  create(payload: OrganizationPayload) {
    return apiClient.post<OrganizationResponse>('/organizations', payload)
  },
  detail(organizationId: number) {
    return apiClient.get<OrganizationResponse>(`/organizations/${organizationId}`)
  },
  update(organizationId: number, payload: Partial<OrganizationPayload>) {
    return apiClient.put<OrganizationResponse>(`/organizations/${organizationId}`, payload)
  },
  updateStatus(organizationId: number, status: 'active' | 'inactive') {
    return apiClient.patch<OrganizationResponse>(`/organizations/${organizationId}/status`, { status })
  },
  approve(organizationId: number) {
    return apiClient.post<OrganizationResponse>(`/organizations/${organizationId}/approve`, {})
  },
  reject(organizationId: number, reason: string) {
    return apiClient.post<OrganizationResponse>(`/organizations/${organizationId}/reject`, { reason })
  },
  suspend(organizationId: number) {
    return apiClient.post<OrganizationResponse>(`/organizations/${organizationId}/suspend`, {})
  },
}
