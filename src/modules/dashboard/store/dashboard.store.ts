import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { dashboardApi } from '@/modules/dashboard/services/dashboard.api'
import { buildDashboardApiParams, dashboardRangeCacheKey, resolveDashboardDateRange } from '@/modules/dashboard/utils/dashboardDateParams'
import {
  unwrapActivityPayload,
  unwrapCommissionsPayload,
  unwrapPayoutsPayload,
  unwrapLicensesPayload,
  unwrapOverviewPayload,
  unwrapPipelinePayload,
  unwrapResourcesPayload,
  unwrapRevenuePayload,
  unwrapTeamPayload,
} from '@/modules/dashboard/utils/dashboardResponse'
import type {
  DashboardDateRange,
  DashboardSectionKey,
  OrganizationDashboardActivity,
  OrganizationDashboardCommissions,
  OrganizationDashboardPayouts,
  OrganizationDashboardLicenses,
  OrganizationDashboardOverview,
  OrganizationDashboardPipeline,
  OrganizationDashboardResources,
  OrganizationDashboardRevenue,
  OrganizationDashboardTeam,
  PartnerDashboardAnalytics,
  ResellerDashboardAnalytics,
} from '@/modules/dashboard/types/dashboard.types'

type SectionCache = { key: string; fetchedAt: number; rangeKey: string }

const CACHE_TTL_MS = 60_000

function rangeKey(range: DashboardDateRange) {
  return dashboardRangeCacheKey(range)
}

export const useDashboardStore = defineStore('dashboard', () => {
  const message = ref('')
  const dateRange = ref<DashboardDateRange>({
    preset: 'last_30_days',
    ...resolveDashboardDateRange({ preset: 'last_30_days' }),
  })
  const includesChildren = ref(true)
  const activeOrganizationId = ref<number | null>(null)

  const overview = ref<OrganizationDashboardOverview | null>(null)
  const pipeline = ref<OrganizationDashboardPipeline | null>(null)
  const revenue = ref<OrganizationDashboardRevenue | null>(null)
  const commissions = ref<OrganizationDashboardCommissions | null>(null)
  const payouts = ref<OrganizationDashboardPayouts | null>(null)
  const licenses = ref<OrganizationDashboardLicenses | null>(null)
  const activity = ref<OrganizationDashboardActivity | null>(null)
  const team = ref<OrganizationDashboardTeam | null>(null)
  const resources = ref<OrganizationDashboardResources | null>(null)

  const partnerDashboard = ref<PartnerDashboardAnalytics | null>(null)
  const resellerDashboard = ref<ResellerDashboardAnalytics | null>(null)

  const loading = ref<Record<DashboardSectionKey, boolean>>({
    overview: false,
    pipeline: false,
    revenue: false,
    commissions: false,
    payouts: false,
    licenses: false,
    activity: false,
    team: false,
    resources: false,
  })

  const errors = ref<Partial<Record<DashboardSectionKey, string>>>({})
  const sectionCache = ref<Partial<Record<DashboardSectionKey, SectionCache>>>({})

  const partnerLoading = ref(false)
  const resellerLoading = ref(false)
  const partnerError = ref<string | null>(null)
  const resellerError = ref<string | null>(null)

  function apiParams() {
    return buildDashboardApiParams(dateRange.value)
  }

  function isCacheValid(section: DashboardSectionKey, orgId: number | null) {
    const entry = sectionCache.value[section]
    if (!entry) return false
    if (entry.key !== String(orgId)) return false
    if (entry.rangeKey !== rangeKey(dateRange.value, includesChildren.value)) return false
    return Date.now() - entry.fetchedAt < CACHE_TTL_MS
  }

  function markCached(section: DashboardSectionKey, orgId: number | null) {
    sectionCache.value[section] = {
      key: String(orgId),
      fetchedAt: Date.now(),
      rangeKey: rangeKey(dateRange.value),
    }
  }

  function setDateRange(range: DashboardDateRange) {
    dateRange.value = { ...range }
    sectionCache.value = {}
  }

  function invalidateCache() {
    sectionCache.value = {}
  }

  function resetDashboard() {
    overview.value = null
    pipeline.value = null
    revenue.value = null
    commissions.value = null
    licenses.value = null
    activity.value = null
    team.value = null
    resources.value = null
    partnerDashboard.value = null
    resellerDashboard.value = null
    errors.value = {}
    sectionCache.value = {}
    activeOrganizationId.value = null
  }

  async function fetchOverview(orgId: number, force = false) {
    if (!force && isCacheValid('overview', orgId) && overview.value) return
    activeOrganizationId.value = orgId
    loading.value.overview = true
    errors.value.overview = undefined
    try {
      const { data } = await dashboardApi.getOrganizationDashboardOverview(orgId, apiParams())
      overview.value = unwrapOverviewPayload(data.data)
      message.value = data.message
      markCached('overview', orgId)
    } catch (error) {
      const n = toApiError(error)
      errors.value.overview = n.message
      throw n
    } finally {
      loading.value.overview = false
    }
  }

  async function fetchPipeline(orgId: number, force = false) {
    if (!force && isCacheValid('pipeline', orgId) && pipeline.value) return
    loading.value.pipeline = true
    errors.value.pipeline = undefined
    try {
      const { data } = await dashboardApi.getOrganizationDashboardPipeline(orgId, apiParams())
      pipeline.value = unwrapPipelinePayload(data.data)
      markCached('pipeline', orgId)
    } catch (error) {
      errors.value.pipeline = toApiError(error).message
      throw error
    } finally {
      loading.value.pipeline = false
    }
  }

  async function fetchRevenue(orgId: number, force = false) {
    if (!force && isCacheValid('revenue', orgId) && revenue.value) return
    loading.value.revenue = true
    errors.value.revenue = undefined
    try {
      const { data } = await dashboardApi.getOrganizationDashboardRevenue(orgId, apiParams())
      revenue.value = unwrapRevenuePayload(data.data)
      markCached('revenue', orgId)
    } catch (error) {
      errors.value.revenue = toApiError(error).message
      throw error
    } finally {
      loading.value.revenue = false
    }
  }

  async function fetchCommissions(orgId: number, force = false) {
    if (!force && isCacheValid('commissions', orgId) && commissions.value) return
    loading.value.commissions = true
    errors.value.commissions = undefined
    try {
      const { data } = await dashboardApi.getOrganizationDashboardCommissions(orgId, apiParams())
      commissions.value = unwrapCommissionsPayload(data.data)
      markCached('commissions', orgId)
    } catch (error) {
      errors.value.commissions = toApiError(error).message
      throw error
    } finally {
      loading.value.commissions = false
    }
  }

  async function fetchPayouts(orgId: number, force = false) {
    if (!force && isCacheValid('payouts', orgId) && payouts.value) return
    loading.value.payouts = true
    errors.value.payouts = undefined
    try {
      const { data } = await dashboardApi.getOrganizationDashboardPayouts(orgId, apiParams())
      payouts.value = unwrapPayoutsPayload(data.data)
      markCached('payouts', orgId)
    } catch (error) {
      errors.value.payouts = toApiError(error).message
      throw error
    } finally {
      loading.value.payouts = false
    }
  }

  async function fetchLicenses(orgId: number, force = false) {
    if (!force && isCacheValid('licenses', orgId) && licenses.value) return
    loading.value.licenses = true
    errors.value.licenses = undefined
    try {
      const { data } = await dashboardApi.getOrganizationDashboardLicenses(orgId, apiParams())
      licenses.value = unwrapLicensesPayload(data.data)
      markCached('licenses', orgId)
    } catch (error) {
      errors.value.licenses = toApiError(error).message
      throw error
    } finally {
      loading.value.licenses = false
    }
  }

  async function fetchActivity(orgId: number, force = false) {
    if (!force && isCacheValid('activity', orgId) && activity.value) return
    loading.value.activity = true
    errors.value.activity = undefined
    try {
      const { data } = await dashboardApi.getOrganizationDashboardActivity(orgId, apiParams())
      activity.value = unwrapActivityPayload(data.data)
      markCached('activity', orgId)
    } catch (error) {
      errors.value.activity = toApiError(error).message
      throw error
    } finally {
      loading.value.activity = false
    }
  }

  async function fetchTeam(orgId: number, force = false) {
    if (!force && isCacheValid('team', orgId) && team.value) return
    loading.value.team = true
    errors.value.team = undefined
    try {
      const { data } = await dashboardApi.getOrganizationDashboardTeam(orgId, apiParams())
      team.value = unwrapTeamPayload(data.data)
      markCached('team', orgId)
    } catch (error) {
      errors.value.team = toApiError(error).message
      throw error
    } finally {
      loading.value.team = false
    }
  }

  async function fetchResources(orgId: number, force = false) {
    if (!force && isCacheValid('resources', orgId) && resources.value) return
    loading.value.resources = true
    errors.value.resources = undefined
    try {
      const { data } = await dashboardApi.getOrganizationDashboardResources(orgId, apiParams())
      resources.value = unwrapResourcesPayload(data.data)
      markCached('resources', orgId)
    } catch (error) {
      errors.value.resources = toApiError(error).message
      throw error
    } finally {
      loading.value.resources = false
    }
  }

  async function fetchSection(orgId: number, section: DashboardSectionKey, force = false) {
    switch (section) {
      case 'overview':
        return fetchOverview(orgId, force)
      case 'pipeline':
        return fetchPipeline(orgId, force)
      case 'revenue':
        return fetchRevenue(orgId, force)
      case 'commissions':
        return fetchCommissions(orgId, force)
      case 'payouts':
        return fetchPayouts(orgId, force)
      case 'licenses':
        return fetchLicenses(orgId, force)
      case 'activity':
        return fetchActivity(orgId, force)
      case 'team':
        return fetchTeam(orgId, force)
      case 'resources':
        return fetchResources(orgId, force)
    }
  }

  async function fetchPartnerDashboard(force = false) {
    partnerLoading.value = true
    partnerError.value = null
    try {
      const { data } = await dashboardApi.getPartnerDashboard(apiParams())
      const payload = data.data
      includesChildren.value = Boolean(payload.includes_children)
      overview.value = unwrapOverviewPayload(payload)
      if (payload.pipeline) pipeline.value = unwrapPipelinePayload(payload)
      if (payload.revenue) revenue.value = unwrapRevenuePayload(payload)
      if (payload.commissions) commissions.value = unwrapCommissionsPayload(payload)
      if (payload.licenses) licenses.value = unwrapLicensesPayload(payload)
      if (payload.activity) activity.value = unwrapActivityPayload(payload)
      if (payload.team) team.value = unwrapTeamPayload(payload)
      if (payload.resources) resources.value = unwrapResourcesPayload(payload)
      message.value = data.message
    } catch (error) {
      partnerError.value = toApiError(error).message
      throw error
    } finally {
      partnerLoading.value = false
    }
  }

  async function fetchResellerDashboard(force = false) {
    resellerLoading.value = true
    resellerError.value = null
    try {
      const { data } = await dashboardApi.getResellerDashboard(apiParams())
      const payload = data.data
      includesChildren.value = Boolean(payload.includes_children)
      overview.value = unwrapOverviewPayload(payload)
      if (payload.pipeline) pipeline.value = unwrapPipelinePayload(payload)
      if (payload.revenue) revenue.value = unwrapRevenuePayload(payload)
      if (payload.commissions) commissions.value = unwrapCommissionsPayload(payload)
      if (payload.licenses) licenses.value = unwrapLicensesPayload(payload)
      if (payload.activity) activity.value = unwrapActivityPayload(payload)
      if (payload.team) team.value = unwrapTeamPayload(payload)
      if (payload.resources) resources.value = unwrapResourcesPayload(payload)
      message.value = data.message
    } catch (error) {
      resellerError.value = toApiError(error).message
      throw error
    } finally {
      resellerLoading.value = false
    }
  }

  return {
    message,
    dateRange,
    includesChildren,
    activeOrganizationId,
    overview,
    pipeline,
    revenue,
    commissions,
    payouts,
    licenses,
    activity,
    team,
    resources,
    partnerDashboard,
    resellerDashboard,
    loading,
    errors,
    partnerLoading,
    resellerLoading,
    partnerError,
    resellerError,
    setDateRange,
    invalidateCache,
    resetDashboard,
    fetchOverview,
    fetchPipeline,
    fetchRevenue,
    fetchCommissions,
    fetchPayouts,
    fetchLicenses,
    fetchActivity,
    fetchTeam,
    fetchResources,
    fetchSection,
    fetchPartnerDashboard,
    fetchResellerDashboard,
  }
})
