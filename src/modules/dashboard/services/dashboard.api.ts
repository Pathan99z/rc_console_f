import { apiClient } from '@/core/http/apiClient'
import type { LoginDashboardApiEnvelope } from '@/modules/dashboard/types/loginDashboard.types'
import type {
  DashboardApiEnvelope,
  DashboardApiQueryParams,
  OrganizationDashboardApiData,
  ResellerNavigationItem,
} from '@/modules/dashboard/types/dashboard.types'

function orgDashboard(organizationId: number, suffix: string, params?: DashboardApiQueryParams) {
  const path = suffix ? `/organizations/${organizationId}/dashboard/${suffix}` : `/organizations/${organizationId}/dashboard`
  return apiClient.get<DashboardApiEnvelope<OrganizationDashboardApiData>>(path, { params })
}

export const dashboardApi = {
  /** Login home dashboard — GET /api/dashboard */
  getLoginDashboard() {
    return apiClient.get<LoginDashboardApiEnvelope>('/dashboard')
  },

  /** Overview KPIs — GET .../organizations/{id}/dashboard (not /dashboard/overview). */
  getOrganizationDashboardOverview(organizationId: number, params?: DashboardApiQueryParams) {
    return orgDashboard(organizationId, '', params)
  },

  getOrganizationDashboardPipeline(organizationId: number, params?: DashboardApiQueryParams) {
    return orgDashboard(organizationId, 'pipeline', params)
  },

  getOrganizationDashboardRevenue(organizationId: number, params?: DashboardApiQueryParams) {
    return orgDashboard(organizationId, 'revenue', params)
  },

  getOrganizationDashboardCommissions(organizationId: number, params?: DashboardApiQueryParams) {
    return orgDashboard(organizationId, 'commissions', params)
  },

  getOrganizationDashboardPayouts(organizationId: number, params?: DashboardApiQueryParams) {
    return orgDashboard(organizationId, 'payouts', params)
  },

  getOrganizationDashboardLicenses(organizationId: number, params?: DashboardApiQueryParams) {
    return orgDashboard(organizationId, 'licenses', params)
  },

  getOrganizationDashboardActivity(organizationId: number, params?: DashboardApiQueryParams) {
    return orgDashboard(organizationId, 'activity', params)
  },

  getOrganizationDashboardTeam(organizationId: number, params?: DashboardApiQueryParams) {
    return orgDashboard(organizationId, 'team', params)
  },

  getOrganizationDashboardResources(organizationId: number, params?: DashboardApiQueryParams) {
    return orgDashboard(organizationId, 'resources', params)
  },

  getPartnerDashboard(params?: DashboardApiQueryParams) {
    return apiClient.get<DashboardApiEnvelope<OrganizationDashboardApiData>>('/prm/partner/dashboard', { params })
  },

  getResellerDashboard(params?: DashboardApiQueryParams) {
    return apiClient.get<DashboardApiEnvelope<OrganizationDashboardApiData>>('/prm/reseller/dashboard', { params })
  },

  getResellerNavigation() {
    return apiClient.get<DashboardApiEnvelope<{ items: ResellerNavigationItem[] }>>('/prm/reseller/navigation')
  },
}
