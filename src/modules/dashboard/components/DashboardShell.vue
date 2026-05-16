<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDashboardStore } from '@/modules/dashboard/store/dashboard.store'
import type { DashboardSectionKey } from '@/modules/dashboard/types/dashboard.types'
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'
import DashboardDateFilter from '@/modules/dashboard/components/DashboardDateFilter.vue'
import DashboardKpiCard from '@/modules/dashboard/components/DashboardKpiCard.vue'
import DashboardSectionCard from '@/modules/dashboard/components/DashboardSectionCard.vue'
import DashboardLoadingSkeleton from '@/modules/dashboard/components/DashboardLoadingSkeleton.vue'
import DashboardErrorState from '@/modules/dashboard/components/DashboardErrorState.vue'
import DashboardEmptyState from '@/modules/dashboard/components/DashboardEmptyState.vue'
import ActivityFeed from '@/modules/dashboard/components/ActivityFeed.vue'
import SimpleBarChart from '@/modules/dashboard/components/SimpleBarChart.vue'
import { fmtCurrency, fmtNumber, fmtPercent } from '@/modules/dashboard/utils/dashboardFormat'
import OrganizationStatusBadge from '@/modules/organizations/components/OrganizationStatusBadge.vue'

const props = defineProps<{
  organizationId?: number | null
  organization?: OrganizationItem | null
  mode: 'organization' | 'partner' | 'reseller'
  showChildAnalytics?: boolean
}>()

const dash = useDashboardStore()
const activeTab = ref<DashboardSectionKey>('overview')
const refreshing = ref(false)

const tabs: Array<{ key: DashboardSectionKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'commissions', label: 'Commissions' },
  { key: 'payouts', label: 'Payouts' },
  { key: 'licenses', label: 'Licenses' },
  { key: 'activity', label: 'Activity' },
  { key: 'team', label: 'Team' },
  { key: 'resources', label: 'Resources' },
]

const orgId = computed(() => props.organizationId ?? null)

const isLoading = computed(() => {
  if (props.mode === 'partner' && activeTab.value === 'overview') return dash.partnerLoading
  if (props.mode === 'reseller' && activeTab.value === 'overview') return dash.resellerLoading
  return dash.loading[activeTab.value]
})

const sectionError = computed(() => {
  if (props.mode === 'partner' && activeTab.value === 'overview') return dash.partnerError
  if (props.mode === 'reseller' && activeTab.value === 'overview') return dash.resellerError
  return dash.errors[activeTab.value] ?? null
})

async function loadTab(force = false) {
  const id = orgId.value
  if (id && (props.mode === 'organization' || activeTab.value !== 'overview')) {
    await dash.fetchSection(id, activeTab.value, force)
    return
  }
  if (props.mode === 'partner') {
    await dash.fetchPartnerDashboard(force)
    return
  }
  if (props.mode === 'reseller') {
    await dash.fetchResellerDashboard(force)
  }
}

async function refreshAll() {
  refreshing.value = true
  dash.invalidateCache()
  try {
    await loadTab(true)
  } finally {
    refreshing.value = false
  }
}

watch(
  () => [activeTab.value, orgId.value, dash.dateRange.preset, dash.dateRange.from, dash.dateRange.to] as const,
  () => {
    void loadTab()
  },
  { immediate: true },
)

watch(
  () => dash.dateRange,
  () => {
    dash.invalidateCache()
  },
  { deep: true },
)

const overview = computed(() => dash.overview)
const pipeline = computed(() => dash.pipeline)
const revenue = computed(() => dash.revenue)
const commissions = computed(() => dash.commissions)
const payouts = computed(() => dash.payouts)
const licenses = computed(() => dash.licenses)
const team = computed(() => dash.team)
const resources = computed(() => dash.resources)

const pipelineChart = computed(() => {
  const stages = pipeline.value?.stages || []
  if (stages.length) {
    return {
      labels: stages.map((s) => s.label || s.stage || 'Stage'),
      values: stages.map((s) => s.count ?? s.value ?? 0),
    }
  }
  return {
    labels: ['Open', 'Won', 'Lost', 'Pending'],
    values: [pipeline.value?.open ?? 0, pipeline.value?.won ?? 0, pipeline.value?.lost ?? 0, pipeline.value?.pending ?? 0],
  }
})

const revenueSeries = computed(() => {
  const series = revenue.value?.series || []
  return {
    labels: series.map((p) => p.label || p.period || ''),
    values: series.map((p) => p.revenue ?? p.amount ?? 0),
  }
})
</script>

<template>
  <section class="space-y-4" aria-label="Organization analytics dashboard">
    <header class="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-lg font-semibold text-slate-900">{{ organization?.display_name || 'Analytics' }}</h3>
          <span v-if="organization?.type" class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">{{ organization.type }}</span>
          <OrganizationStatusBadge v-if="organization?.onboarding_status" :value="organization.onboarding_status" kind="onboarding" />
          <OrganizationStatusBadge v-if="organization?.status" :value="organization.status" kind="status" />
          <span
            v-if="organization?.channel_mode"
            class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800"
          >
            {{ organization.channel_mode === 'partner_managed' ? 'Partner managed' : 'Direct' }}
          </span>
        </div>
        <p v-if="organization?.parent?.display_name" class="mt-1 text-xs text-slate-500">Parent: {{ organization.parent.display_name }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <DashboardDateFilter v-model="dash.dateRange" />
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          :disabled="refreshing || isLoading"
          @click="refreshAll"
        >
          {{ refreshing ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>
    </header>

    <nav class="flex flex-wrap gap-1 rounded-xl border border-[var(--rc-border-soft)] bg-white p-1" role="tablist" aria-label="Dashboard sections">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        class="rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
        :class="activeTab === tab.key ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'"
        :aria-selected="activeTab === tab.key"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <DashboardErrorState v-if="sectionError" :message="sectionError" @retry="refreshAll" />
    <DashboardLoadingSkeleton v-else-if="isLoading && activeTab === 'overview'" />

    <template v-else>
      <!-- Overview -->
      <div v-if="activeTab === 'overview'" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardKpiCard label="Contacts" :value="fmtNumber(overview?.crm?.contacts)" />
          <DashboardKpiCard label="Companies" :value="fmtNumber(overview?.crm?.companies)" />
          <DashboardKpiCard label="Deals" :value="fmtNumber(overview?.crm?.deals)" tone="indigo" />
          <DashboardKpiCard label="Quotes" :value="fmtNumber(overview?.crm?.quotes)" />
        </div>
        <div class="grid gap-4 lg:grid-cols-2">
          <DashboardSectionCard title="Deal performance">
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <DashboardKpiCard label="Open" :value="fmtNumber(overview?.deals?.open ?? pipeline?.open)" />
              <DashboardKpiCard label="Won" :value="fmtNumber(overview?.deals?.won ?? pipeline?.won)" tone="emerald" />
              <DashboardKpiCard label="Lost" :value="fmtNumber(overview?.deals?.lost ?? pipeline?.lost)" tone="rose" />
              <DashboardKpiCard label="Conversion" :value="fmtPercent(overview?.deals?.conversion_percent ?? pipeline?.conversion_percent)" />
              <DashboardKpiCard label="Avg value" :value="fmtCurrency(overview?.deals?.average_value)" />
              <DashboardKpiCard label="Pipeline value" :value="fmtCurrency(overview?.deals?.pipeline_value ?? pipeline?.pipeline_value)" tone="indigo" />
            </div>
          </DashboardSectionCard>
          <DashboardSectionCard title="Revenue & commissions">
            <div class="grid grid-cols-2 gap-3">
              <DashboardKpiCard label="Total revenue" :value="fmtCurrency(overview?.revenue?.total ?? revenue?.total)" tone="indigo" />
              <DashboardKpiCard label="Pending commission" :value="fmtCurrency(overview?.commissions?.pending ?? commissions?.pending)" tone="amber" />
              <DashboardKpiCard label="Licenses available" :value="fmtNumber(overview?.licenses?.available ?? licenses?.available)" tone="emerald" />
              <DashboardKpiCard label="Resource downloads" :value="fmtNumber(overview?.resources?.downloads ?? resources?.downloads)" />
            </div>
          </DashboardSectionCard>
        </div>
        <DashboardSectionCard v-if="overview?.activity_at || overview?.generated_at" title="Last updated" subtitle="Snapshot timestamp from the server.">
          <p class="text-sm text-slate-600">{{ overview?.activity_at || overview?.generated_at }}</p>
        </DashboardSectionCard>
      </div>

      <!-- Pipeline -->
      <div v-else-if="activeTab === 'pipeline'" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardKpiCard label="Open" :value="fmtNumber(pipeline?.open)" />
          <DashboardKpiCard label="Won" :value="fmtNumber(pipeline?.won)" tone="emerald" />
          <DashboardKpiCard label="Lost" :value="fmtNumber(pipeline?.lost)" tone="rose" />
          <DashboardKpiCard label="Pipeline value" :value="fmtCurrency(pipeline?.pipeline_value)" tone="indigo" />
        </div>
        <DashboardSectionCard title="Pipeline stages">
          <SimpleBarChart v-if="pipelineChart.values.some((v) => v > 0)" :labels="pipelineChart.labels" :values="pipelineChart.values" />
          <DashboardEmptyState v-else message="No pipeline data for this period." />
        </DashboardSectionCard>
      </div>

      <!-- Revenue -->
      <div v-else-if="activeTab === 'revenue'" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardKpiCard label="Total" :value="fmtCurrency(revenue?.total)" tone="indigo" />
          <DashboardKpiCard label="Successful" :value="fmtNumber(revenue?.successful_payments)" tone="emerald" />
          <DashboardKpiCard label="Failed" :value="fmtNumber(revenue?.failed_payments)" tone="rose" />
          <DashboardKpiCard label="Quote conversion" :value="fmtPercent(revenue?.quote_conversion_percent)" />
        </div>
        <DashboardSectionCard title="Revenue trend">
          <SimpleBarChart
            v-if="revenueSeries.labels.length"
            :labels="revenueSeries.labels"
            :values="revenueSeries.values"
            :value-formatter="(n) => fmtCurrency(n)"
          />
          <DashboardEmptyState v-else message="No revenue series for this period." />
        </DashboardSectionCard>
        <DashboardSectionCard v-if="showChildAnalytics && revenue?.by_child_reseller?.length" title="Child reseller revenue">
          <SimpleBarChart
            :labels="revenue!.by_child_reseller!.map((r) => r.name || 'Reseller')"
            :values="revenue!.by_child_reseller!.map((r) => r.revenue ?? 0)"
            :value-formatter="(n) => fmtCurrency(n)"
          />
        </DashboardSectionCard>
      </div>

      <!-- Commissions -->
      <div v-else-if="activeTab === 'commissions'" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardKpiCard label="Pending" :value="fmtCurrency(commissions?.pending)" tone="amber" />
          <DashboardKpiCard label="Approved" :value="fmtCurrency(commissions?.approved)" />
          <DashboardKpiCard label="Paid" :value="fmtCurrency(commissions?.paid)" tone="emerald" />
          <DashboardKpiCard label="Accrued" :value="fmtCurrency(commissions?.accrued)" tone="indigo" />
        </div>
        <DashboardSectionCard title="Recent accruals">
          <DashboardEmptyState v-if="!commissions?.items?.length" message="No commission records in this period." />
          <ul v-else class="divide-y text-sm">
            <li v-for="item in commissions.items" :key="item.id" class="flex justify-between py-2">
              <span>{{ item.program_name || 'Commission' }} · {{ item.status }}</span>
              <span class="font-medium tabular-nums">{{ fmtCurrency(item.amount) }}</span>
            </li>
          </ul>
        </DashboardSectionCard>
      </div>

      <!-- Payouts -->
      <div v-else-if="activeTab === 'payouts'" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardKpiCard label="Pending approval" :value="fmtNumber(payouts?.pending_approval_count)" tone="amber" />
          <DashboardKpiCard label="Processing" :value="fmtCurrency(payouts?.processing_amount)" tone="indigo" />
          <DashboardKpiCard label="Paid MTD" :value="fmtCurrency(payouts?.paid_mtd)" tone="emerald" />
          <DashboardKpiCard label="Failed" :value="fmtNumber(payouts?.failed_count)" tone="rose" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <DashboardKpiCard label="Approved liability" :value="fmtCurrency(payouts?.commission_liability_approved)" />
          <DashboardKpiCard label="Next payout estimate" :value="fmtCurrency(payouts?.next_payout_estimate)" tone="indigo" />
        </div>
        <DashboardSectionCard title="Recent payouts">
          <DashboardEmptyState v-if="!payouts?.recent?.length" message="No payout records in this period." />
          <ul v-else class="divide-y text-sm">
            <li v-for="item in payouts.recent" :key="item.id" class="flex justify-between py-2">
              <span>{{ item.payout_number || `#${item.id}` }} · {{ item.status }}</span>
              <span class="font-medium tabular-nums">{{ fmtCurrency(item.net_amount) }}</span>
            </li>
          </ul>
        </DashboardSectionCard>
      </div>

      <!-- Licenses -->
      <div v-else-if="activeTab === 'licenses'" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardKpiCard label="Allocated" :value="fmtNumber(licenses?.allocated)" />
          <DashboardKpiCard label="Consumed" :value="fmtNumber(licenses?.consumed)" />
          <DashboardKpiCard label="Available" :value="fmtNumber(licenses?.available)" tone="emerald" />
          <DashboardKpiCard label="Transfers" :value="fmtNumber(licenses?.transfers)" />
          <DashboardKpiCard label="Activations" :value="fmtNumber(licenses?.activations)" tone="indigo" />
        </div>
      </div>

      <!-- Activity -->
      <DashboardSectionCard v-else-if="activeTab === 'activity'" title="Recent activity">
        <ActivityFeed :items="dash.activity?.items" />
      </DashboardSectionCard>

      <!-- Team -->
      <div v-else-if="activeTab === 'team'" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-3">
          <DashboardKpiCard label="Active" :value="fmtNumber(team?.active)" tone="emerald" />
          <DashboardKpiCard label="Inactive" :value="fmtNumber(team?.inactive)" />
          <DashboardKpiCard label="Suspended" :value="fmtNumber(team?.suspended)" tone="rose" />
        </div>
        <DashboardSectionCard title="Team performance">
          <DashboardEmptyState v-if="!team?.performance?.length" message="No performance metrics yet." />
          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="text-xs uppercase text-slate-500">
                <tr>
                  <th class="px-2 py-2 text-left">Member</th>
                  <th class="px-2 py-2 text-right">Won</th>
                  <th class="px-2 py-2 text-right">Revenue</th>
                  <th class="px-2 py-2 text-right">Win ratio</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in team.performance" :key="row.user_id" class="border-t">
                  <td class="px-2 py-2">{{ row.name || '—' }}</td>
                  <td class="px-2 py-2 text-right tabular-nums">{{ fmtNumber(row.deals_won) }}</td>
                  <td class="px-2 py-2 text-right tabular-nums">{{ fmtCurrency(row.revenue) }}</td>
                  <td class="px-2 py-2 text-right tabular-nums">{{ fmtPercent(row.win_ratio) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </DashboardSectionCard>
      </div>

      <!-- Resources -->
      <DashboardSectionCard v-else-if="activeTab === 'resources'" title="Resource center">
        <div class="mb-4 max-w-xs">
          <DashboardKpiCard label="Total downloads" :value="fmtNumber(resources?.downloads)" />
        </div>
        <DashboardEmptyState v-if="!resources?.top_collateral?.length" message="No download analytics for this period." />
        <ul v-else class="space-y-2 text-sm">
          <li v-for="c in resources.top_collateral" :key="c.id" class="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span>{{ c.title || 'Resource' }}</span>
            <span class="font-medium tabular-nums">{{ fmtNumber(c.downloads) }}</span>
          </li>
        </ul>
      </DashboardSectionCard>
    </template>
  </section>
</template>
