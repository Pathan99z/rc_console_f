import type {
  OrganizationDashboardActivity,
  OrganizationDashboardApiData,
  OrganizationDashboardCommissions,
  OrganizationDashboardLicenses,
  OrganizationDashboardOverview,
  OrganizationDashboardPipeline,
  OrganizationDashboardPayouts,
  OrganizationDashboardResources,
  OrganizationDashboardRevenue,
  OrganizationDashboardTeam,
  DashboardActivityItem,
} from '@/modules/dashboard/types/dashboard.types'

function asOverview(kpis: Record<string, unknown> | undefined, data: OrganizationDashboardApiData): OrganizationDashboardOverview {
  const k = (kpis || {}) as OrganizationDashboardOverview
  return {
    ...k,
    generated_at: data.generated_at ?? k.generated_at,
    context: data.organization
      ? {
          id: data.organization.id,
          display_name: data.organization.display_name,
          legal_name: data.organization.legal_name,
          type: data.organization.type,
          channel_mode: data.organization.channel_mode,
          status: data.organization.status,
          onboarding_status: data.organization.onboarding_status,
        }
      : k.context,
  }
}

export function unwrapOverviewPayload(data: OrganizationDashboardApiData): OrganizationDashboardOverview {
  return asOverview(data.kpis as Record<string, unknown> | undefined, data)
}

export function unwrapPipelinePayload(data: OrganizationDashboardApiData): OrganizationDashboardPipeline {
  return (data.pipeline ?? {}) as OrganizationDashboardPipeline
}

export function unwrapRevenuePayload(data: OrganizationDashboardApiData): OrganizationDashboardRevenue {
  return (data.revenue ?? {}) as OrganizationDashboardRevenue
}

export function unwrapCommissionsPayload(data: OrganizationDashboardApiData): OrganizationDashboardCommissions {
  return (data.commissions ?? {}) as OrganizationDashboardCommissions
}

export function unwrapPayoutsPayload(data: OrganizationDashboardApiData): OrganizationDashboardPayouts {
  return (data.payouts ?? {}) as OrganizationDashboardPayouts
}

export function unwrapLicensesPayload(data: OrganizationDashboardApiData): OrganizationDashboardLicenses {
  return (data.licenses ?? {}) as OrganizationDashboardLicenses
}

export function unwrapActivityPayload(data: OrganizationDashboardApiData): OrganizationDashboardActivity {
  const raw = data.activity
  if (Array.isArray(raw)) return { items: raw as DashboardActivityItem[] }
  if (raw && typeof raw === 'object' && 'items' in raw) return raw as OrganizationDashboardActivity
  return { items: [] }
}

export function unwrapTeamPayload(data: OrganizationDashboardApiData): OrganizationDashboardTeam {
  return (data.team ?? {}) as OrganizationDashboardTeam
}

export function unwrapResourcesPayload(data: OrganizationDashboardApiData): OrganizationDashboardResources {
  return (data.resources ?? {}) as OrganizationDashboardResources
}
