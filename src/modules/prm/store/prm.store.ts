import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { prmApi } from '@/modules/prm/services/prm.api'
import type {
  CommissionAccrualItem,
  InvitationAcceptData,
  InvitationAcceptPayload,
  InvitationPreviewData,
  LicenseEntitlementItem,
  OrganizationInvitationItem,
  PartnerCollateralItem,
  PartnerDashboardSummary,
  PartnerLeadItem,
  PartnerNavItem,
  PartnerProgramItem,
  ProgramEnrollmentItem,
} from '@/modules/prm/types/prm.types'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const usePrmStore = defineStore('prm', () => {
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})

  const invitePreview = ref<InvitationPreviewData | null>(null)
  const invitePreviewLoading = ref(false)

  const partnerNavItems = ref<PartnerNavItem[]>([])
  const partnerNavLoading = ref(false)

  const dashboardSummary = ref<PartnerDashboardSummary | null>(null)
  const dashboardLoading = ref(false)

  const leads = ref<PartnerLeadItem[]>([])
  const leadsPagination = ref<Pagination>(defaultPagination)
  const leadsLoading = ref(false)
  const leadsSearchQuery = ref<string | undefined>(undefined)

  const collaterals = ref<PartnerCollateralItem[]>([])
  const collateralsPagination = ref<Pagination>(defaultPagination)
  const collateralsLoading = ref(false)

  const programs = ref<PartnerProgramItem[]>([])
  const programsLoading = ref(false)
  const programDetail = ref<PartnerProgramItem | null>(null)
  const programDetailLoading = ref(false)

  const enrollments = ref<ProgramEnrollmentItem[]>([])
  const enrollmentsLoading = ref(false)

  const partnerProgramEnrollments = ref<ProgramEnrollmentItem[]>([])
  const partnerProgramEnrollmentsLoading = ref(false)

  const accruals = ref<CommissionAccrualItem[]>([])
  const accrualsPagination = ref<Pagination>(defaultPagination)
  const accrualsLoading = ref(false)

  const entitlements = ref<LicenseEntitlementItem[]>([])
  const entitlementsPagination = ref<Pagination>(defaultPagination)
  const entitlementsLoading = ref(false)

  const invitations = ref<OrganizationInvitationItem[]>([])
  const invitationsPagination = ref<Pagination>(defaultPagination)
  const invitationsLoading = ref(false)

  async function fetchPartnerNavigation() {
    partnerNavLoading.value = true
    try {
      const { data } = await prmApi.partnerNavigation()
      partnerNavItems.value = data.data.items
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      partnerNavLoading.value = false
    }
  }

  async function fetchPartnerDashboard() {
    dashboardLoading.value = true
    try {
      const { data } = await prmApi.partnerDashboard()
      dashboardSummary.value = data.data.summary
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      dashboardLoading.value = false
    }
  }

  async function fetchInvitationPreview(token: string) {
    invitePreviewLoading.value = true
    invitePreview.value = null
    try {
      const { data } = await prmApi.previewInvitation(token)
      invitePreview.value = data.data
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      invitePreviewLoading.value = false
    }
  }

  async function submitInvitationAccept(payload: InvitationAcceptPayload): Promise<InvitationAcceptData> {
    const { data } = await prmApi.acceptInvitation(payload)
    message.value = data.message
    return data.data
  }

  async function fetchPartnerLeads(page = 1, perPage = 15, search?: string) {
    leadsSearchQuery.value = search
    leadsLoading.value = true
    try {
      const { data } = await prmApi.partnerLeadsList({ page, per_page: perPage, search })
      leads.value = data.data.items
      leadsPagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      errors.value = n.fieldErrors
      throw n
    } finally {
      leadsLoading.value = false
    }
  }

  async function createPartnerLead(payload: Parameters<typeof prmApi.partnerLeadCreate>[0]) {
    const { data } = await prmApi.partnerLeadCreate(payload)
    message.value = data.message
    await fetchPartnerLeads(leadsPagination.value.current_page, leadsPagination.value.per_page, leadsSearchQuery.value)
  }

  async function updatePartnerLead(leadId: number, payload: Parameters<typeof prmApi.partnerLeadUpdate>[1]) {
    const { data } = await prmApi.partnerLeadUpdate(leadId, payload)
    message.value = data.message
    await fetchPartnerLeads(leadsPagination.value.current_page, leadsPagination.value.per_page, leadsSearchQuery.value)
  }

  async function registerPartnerOpportunity(payload: Parameters<typeof prmApi.partnerOpportunityRegister>[0]) {
    const { data } = await prmApi.partnerOpportunityRegister(payload)
    message.value = data.message
    return data.data
  }

  async function fetchPartnerCollaterals(page = 1, perPage = 15, resourceCategory?: string) {
    collateralsLoading.value = true
    try {
      const { data } = await prmApi.partnerCollateralsList({ page, per_page: perPage, resource_category: resourceCategory })
      collaterals.value = data.data.items
      collateralsPagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      collateralsLoading.value = false
    }
  }

  async function trackCollateralDownload(collateralId: number) {
    const { data } = await prmApi.partnerCollateralDownload(collateralId)
    message.value = data.message
  }

  async function fetchPrograms() {
    programsLoading.value = true
    try {
      const { data } = await prmApi.programsList()
      programs.value = data.data.items
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      programsLoading.value = false
    }
  }

  async function fetchProgram(programId: number) {
    programDetailLoading.value = true
    programDetail.value = null
    try {
      const { data } = await prmApi.programsDetail(programId)
      const raw = data.data as { program?: PartnerProgramItem } & Record<string, unknown>
      programDetail.value =
        raw.program ?? (typeof raw.id === 'number' ? (raw as unknown as PartnerProgramItem) : null)
      if (!programDetail.value) {
        message.value = 'Invalid program response.'
        throw new Error('Invalid program response')
      }
      message.value = data.message
      return programDetail.value
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      errors.value = n.fieldErrors
      throw n
    } finally {
      programDetailLoading.value = false
    }
  }

  async function createProgram(payload: Parameters<typeof prmApi.programsCreate>[0]) {
    const { data } = await prmApi.programsCreate(payload)
    message.value = data.message
    await fetchPrograms()
    const raw = data.data as { program?: PartnerProgramItem } & Record<string, unknown>
    return raw.program ?? (typeof raw.id === 'number' ? (raw as unknown as PartnerProgramItem) : undefined)
  }

  async function updateProgram(programId: number, payload: Parameters<typeof prmApi.programsUpdate>[1]) {
    const { data } = await prmApi.programsUpdate(programId, payload)
    message.value = data.message
    await fetchPrograms()
    const raw = data.data as { program?: PartnerProgramItem } & Record<string, unknown>
    return raw.program ?? (typeof raw.id === 'number' ? (raw as unknown as PartnerProgramItem) : undefined)
  }

  async function patchProgramStatus(programId: number, status: string) {
    const { data } = await prmApi.programsPatchStatus(programId, status)
    message.value = data.message
    await fetchPrograms()
    return data
  }

  async function enrollProgram(payload: Parameters<typeof prmApi.programsEnroll>[0]) {
    const { data } = await prmApi.programsEnroll(payload)
    message.value = data.message
  }

  async function fetchProgramEnrollments(organizationId: number) {
    enrollmentsLoading.value = true
    try {
      const { data } = await prmApi.organizationProgramEnrollments(organizationId)
      enrollments.value = data.data.items
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      enrollmentsLoading.value = false
    }
  }

  async function fetchPartnerProgramEnrollments() {
    partnerProgramEnrollmentsLoading.value = true
    try {
      const { data } = await prmApi.partnerProgramEnrollments()
      partnerProgramEnrollments.value = data.data.items
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      partnerProgramEnrollmentsLoading.value = false
    }
  }

  async function fetchCommissionAccruals(page = 1, perPage = 15) {
    accrualsLoading.value = true
    try {
      const { data } = await prmApi.commissionAccrualsList({ page, per_page: perPage })
      accruals.value = data.data.items
      accrualsPagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      errors.value = n.fieldErrors
      throw n
    } finally {
      accrualsLoading.value = false
    }
  }

  async function updateCommissionAccrualStatus(accrualId: number, status: string) {
    const { data } = await prmApi.commissionAccrualUpdateStatus(accrualId, status)
    message.value = data.message
    await fetchCommissionAccruals(accrualsPagination.value.current_page, accrualsPagination.value.per_page)
  }

  async function fetchLicenseEntitlements(page = 1, perPage = 15) {
    entitlementsLoading.value = true
    try {
      const { data } = await prmApi.licenseEntitlementsList({ page, per_page: perPage })
      entitlements.value = data.data.items
      entitlementsPagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      throw n
    } finally {
      entitlementsLoading.value = false
    }
  }

  async function allocateLicenses(payload: Parameters<typeof prmApi.licenseEntitlementsAllocate>[0]) {
    const { data } = await prmApi.licenseEntitlementsAllocate(payload)
    message.value = data.message
    await fetchLicenseEntitlements(entitlementsPagination.value.current_page, entitlementsPagination.value.per_page)
  }

  async function consumeLicenseUnits(entitlementId: number, units: number) {
    const { data } = await prmApi.licenseEntitlementsConsume(entitlementId, { units })
    message.value = data.message
    await fetchLicenseEntitlements(entitlementsPagination.value.current_page, entitlementsPagination.value.per_page)
  }

  async function transferLicenses(payload: Parameters<typeof prmApi.licenseEntitlementsTransfer>[0]) {
    const { data } = await prmApi.licenseEntitlementsTransfer(payload)
    message.value = data.message
    await fetchLicenseEntitlements(entitlementsPagination.value.current_page, entitlementsPagination.value.per_page)
  }

  async function activateLicense(entitlementId: number, payload: Parameters<typeof prmApi.licenseEntitlementsActivate>[1]) {
    const { data } = await prmApi.licenseEntitlementsActivate(entitlementId, payload)
    message.value = data.message
    await fetchLicenseEntitlements(entitlementsPagination.value.current_page, entitlementsPagination.value.per_page)
  }

  async function fetchInvitations(organizationId: number, page = 1, perPage = 15) {
    invitationsLoading.value = true
    errors.value = {}
    try {
      const { data } = await prmApi.listOrganizationInvitations(organizationId, { page, per_page: perPage })
      invitations.value = data.data.items
      invitationsPagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const n = toApiError(error)
      message.value = n.message
      errors.value = n.fieldErrors
      throw n
    } finally {
      invitationsLoading.value = false
    }
  }

  async function createInvitation(organizationId: number, payload: Parameters<typeof prmApi.createOrganizationInvitation>[1]) {
    const { data } = await prmApi.createOrganizationInvitation(organizationId, payload)
    message.value = data.message
    await fetchInvitations(organizationId, invitationsPagination.value.current_page, invitationsPagination.value.per_page)
  }

  async function resendInvitation(organizationId: number, invitationId: number) {
    const { data } = await prmApi.resendOrganizationInvitation(organizationId, invitationId)
    message.value = data.message
    await fetchInvitations(organizationId, invitationsPagination.value.current_page, invitationsPagination.value.per_page)
  }

  async function revokeInvitation(organizationId: number, invitationId: number) {
    const { data } = await prmApi.revokeOrganizationInvitation(organizationId, invitationId)
    message.value = data.message
    await fetchInvitations(organizationId, invitationsPagination.value.current_page, invitationsPagination.value.per_page)
  }

  return {
    message,
    errors,
    invitePreview,
    invitePreviewLoading,
    partnerNavItems,
    partnerNavLoading,
    dashboardSummary,
    dashboardLoading,
    leads,
    leadsPagination,
    leadsLoading,
    collaterals,
    collateralsPagination,
    collateralsLoading,
    programs,
    programsLoading,
    programDetail,
    programDetailLoading,
    enrollments,
    enrollmentsLoading,
    partnerProgramEnrollments,
    partnerProgramEnrollmentsLoading,
    accruals,
    accrualsPagination,
    accrualsLoading,
    entitlements,
    entitlementsPagination,
    entitlementsLoading,
    invitations,
    invitationsPagination,
    invitationsLoading,
    fetchPartnerNavigation,
    fetchPartnerDashboard,
    fetchPartnerLeads,
    createPartnerLead,
    updatePartnerLead,
    registerPartnerOpportunity,
    fetchPartnerCollaterals,
    trackCollateralDownload,
    fetchPrograms,
    fetchProgram,
    createProgram,
    updateProgram,
    patchProgramStatus,
    enrollProgram,
    fetchProgramEnrollments,
    fetchPartnerProgramEnrollments,
    fetchCommissionAccruals,
    updateCommissionAccrualStatus,
    fetchLicenseEntitlements,
    allocateLicenses,
    consumeLicenseUnits,
    transferLicenses,
    activateLicense,
    fetchInvitations,
    createInvitation,
    resendInvitation,
    revokeInvitation,
    fetchInvitationPreview,
    submitInvitationAccept,
  }
})
