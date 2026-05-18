<script setup lang="ts">
import { computed } from 'vue'
import DashboardSectionCard from '@/modules/dashboard/components/DashboardSectionCard.vue'
import DashboardEmptyState from '@/modules/dashboard/components/DashboardEmptyState.vue'
import SimpleBarChart from '@/modules/dashboard/components/SimpleBarChart.vue'
import type { LoginDashboardCharts } from '@/modules/dashboard/types/loginDashboard.types'
import { fmtCurrency, fmtNumber, fmtPercent } from '@/modules/dashboard/utils/dashboardFormat'

const props = defineProps<{
  charts: LoginDashboardCharts
}>()

const revenueSeries = computed(() => {
  const series = props.charts.monthly_revenue || props.charts.revenue_trend || []
  return {
    labels: series.map((p) => p.label || p.period || ''),
    values: series.map((p) => p.revenue ?? p.amount ?? p.value ?? 0),
  }
})

const tierSeries = computed(() => {
  const tiers = props.charts.tier_distribution || []
  return {
    labels: tiers.map((t) => t.label),
    values: tiers.map((t) => t.percent ?? t.value ?? 0),
  }
})

const hasRevenue = computed(() => revenueSeries.value.values.some((v) => v > 0))
const hasTier = computed(() => tierSeries.value.values.some((v) => v > 0))
</script>

<template>
  <div v-if="hasRevenue || hasTier" class="grid gap-4 lg:grid-cols-2">
    <DashboardSectionCard v-if="hasRevenue" title="Revenue trend">
      <SimpleBarChart
        :labels="revenueSeries.labels"
        :values="revenueSeries.values"
        :value-formatter="(n) => fmtCurrency(n)"
      />
    </DashboardSectionCard>
    <DashboardSectionCard v-else-if="charts.monthly_revenue?.length === 0" title="Revenue trend">
      <DashboardEmptyState message="No revenue series available." />
    </DashboardSectionCard>

    <DashboardSectionCard v-if="hasTier" title="Channel distribution">
      <SimpleBarChart
        :labels="tierSeries.labels"
        :values="tierSeries.values"
        :value-formatter="(n) => fmtPercent(n)"
      />
    </DashboardSectionCard>
    <DashboardSectionCard v-else-if="charts.pipeline?.length" title="Pipeline">
      <SimpleBarChart
        :labels="(charts.pipeline || []).map((p) => p.label || p.period || '')"
        :values="(charts.pipeline || []).map((p) => p.value ?? p.amount ?? 0)"
        :value-formatter="(n) => fmtNumber(n)"
      />
    </DashboardSectionCard>
  </div>
</template>
