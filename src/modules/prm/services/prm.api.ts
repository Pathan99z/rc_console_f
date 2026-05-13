import { apiClient } from '@/core/http/apiClient'
import type {
  ApiEnvelope,
  CommissionAccrualsListResponse,
  CreateInvitationPayload,
  InvitationAcceptData,
  InvitationAcceptPayload,
  InvitationPreviewData,
  InvitationsListResponse,
  LicenseAllocatePayload,
  LicenseConsumePayload,
  LicenseEntitlementsListResponse,
  PartnerCollateralsListResponse,
  PartnerDashboardData,
  PartnerLeadPayload,
  PartnerLeadsListResponse,
  PartnerNavigationData,
  PartnerOpportunityPayload,
  ProgramEnrollmentsResponse,
  ProgramEnrollPayload,
  PartnerProgramDetailResponse,
  PartnerProgramUpsertPayload,
  ProgramsListResponse,
} from '@/modules/prm/types/prm.types'
export const prmApi = {
  previewInvitation(token: string) {
    return apiClient.get<ApiEnvelope<InvitationPreviewData>>('/prm/invitations/preview', {
      params: { token },
    })
  },

  acceptInvitation(payload: InvitationAcceptPayload) {
    return apiClient.post<ApiEnvelope<InvitationAcceptData>>('/prm/invitations/accept', payload)
  },

  listOrganizationInvitations(organizationId: number, params?: { per_page?: number; page?: number }) {
    return apiClient.get<InvitationsListResponse>(`/organizations/${organizationId}/invitations`, { params })
  },

  createOrganizationInvitation(organizationId: number, payload: CreateInvitationPayload) {
    return apiClient.post<ApiEnvelope<Record<string, never>>>(`/organizations/${organizationId}/invitations`, payload)
  },

  resendOrganizationInvitation(organizationId: number, invitationId: number) {
    return apiClient.post<ApiEnvelope<Record<string, never>>>(
      `/organizations/${organizationId}/invitations/${invitationId}/resend`,
      {},
    )
  },

  revokeOrganizationInvitation(organizationId: number, invitationId: number) {
    return apiClient.delete<ApiEnvelope<Record<string, never>>>(`/organizations/${organizationId}/invitations/${invitationId}`)
  },

  partnerNavigation() {
    return apiClient.get<ApiEnvelope<PartnerNavigationData>>('/prm/partner/navigation')
  },

  partnerDashboard() {
    return apiClient.get<ApiEnvelope<PartnerDashboardData>>('/prm/partner/dashboard')
  },

  partnerLeadsList(params?: { page?: number; per_page?: number; search?: string }) {
    return apiClient.get<PartnerLeadsListResponse>('/prm/partner/leads', { params })
  },

  partnerLeadCreate(payload: PartnerLeadPayload) {
    return apiClient.post<ApiEnvelope<{ lead: unknown }>>('/prm/partner/leads', payload)
  },

  partnerLeadUpdate(leadId: number, payload: PartnerLeadPayload) {
    return apiClient.put<ApiEnvelope<{ lead: unknown }>>(`/prm/partner/leads/${leadId}`, payload)
  },

  partnerOpportunityRegister(payload: PartnerOpportunityPayload) {
    return apiClient.post<ApiEnvelope<unknown>>('/prm/partner/opportunities', payload)
  },

  partnerCollateralsList(params?: { per_page?: number; page?: number; resource_category?: string }) {
    return apiClient.get<PartnerCollateralsListResponse>('/prm/partner/resources/collaterals', { params })
  },

  partnerCollateralDownload(collateralId: number) {
    return apiClient.post<ApiEnvelope<unknown>>(`/prm/partner/resources/collaterals/${collateralId}/downloads`, {})
  },

  programsList() {
    return apiClient.get<ProgramsListResponse>('/prm/programs')
  },

  programsDetail(programId: number) {
    return apiClient.get<PartnerProgramDetailResponse>(`/prm/programs/${programId}`)
  },

  programsCreate(payload: PartnerProgramUpsertPayload) {
    return apiClient.post<PartnerProgramDetailResponse>('/prm/programs', payload)
  },

  programsUpdate(programId: number, payload: PartnerProgramUpsertPayload) {
    return apiClient.put<PartnerProgramDetailResponse>(`/prm/programs/${programId}`, payload)
  },

  programsPatchStatus(programId: number, status: string) {
    return apiClient.patch<ApiEnvelope<unknown>>(`/prm/programs/${programId}/status`, { status })
  },

  programsEnroll(payload: ProgramEnrollPayload) {
    return apiClient.post<ApiEnvelope<unknown>>('/prm/programs/enroll', payload)
  },

  organizationProgramEnrollments(organizationId: number) {
    return apiClient.get<ProgramEnrollmentsResponse>(`/prm/organizations/${organizationId}/program-enrollments`)
  },

  /** Current user's organization enrollments (partner / reseller channel). */
  partnerProgramEnrollments() {
    return apiClient.get<ProgramEnrollmentsResponse>('/prm/partner/program-enrollments')
  },

  commissionAccrualsList(params?: { per_page?: number; page?: number }) {
    return apiClient.get<CommissionAccrualsListResponse>('/prm/commission-accruals', { params })
  },

  commissionAccrualUpdateStatus(accrualId: number, status: string) {
    return apiClient.patch<ApiEnvelope<unknown>>(`/prm/commission-accruals/${accrualId}/status`, { status })
  },

  licenseEntitlementsList(params?: { per_page?: number; page?: number }) {
    return apiClient.get<LicenseEntitlementsListResponse>('/prm/license-entitlements', { params })
  },

  licenseEntitlementsAllocate(payload: LicenseAllocatePayload) {
    return apiClient.post<ApiEnvelope<unknown>>('/prm/license-entitlements', payload)
  },

  licenseEntitlementsConsume(entitlementId: number, payload: LicenseConsumePayload) {
    return apiClient.post<ApiEnvelope<unknown>>(`/prm/license-entitlements/${entitlementId}/consume`, payload)
  },
}
