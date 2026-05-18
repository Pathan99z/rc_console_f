<script setup lang="ts">
import { RouterLink } from 'vue-router'
import LoginDashboardStatCard from '@/modules/dashboard/components/login/LoginDashboardStatCard.vue'
import type { DashboardKpiMetric } from '@/modules/dashboard/types/loginDashboard.types'
import { resolveDashboardAppRoute } from '@/modules/dashboard/utils/loginDashboardRoutes'
import { fmtCurrency, fmtNumber, fmtPercent } from '@/modules/dashboard/utils/dashboardFormat'

defineProps<{
  metrics: DashboardKpiMetric[]
}>()

function formatMetric(metric: DashboardKpiMetric): string {
  if (typeof metric.value === 'string') return metric.value
  if (metric.format === 'currency') return fmtCurrency(metric.value)
  if (metric.format === 'percent') return fmtPercent(metric.value)
  return fmtNumber(metric.value)
}

function metricRoute(metric: DashboardKpiMetric): string {
  return resolveDashboardAppRoute(metric.link, metric.key)
}
</script>

<template>
  <section aria-label="Key metrics">
    <div v-if="!metrics.length" class="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
      No KPI metrics returned for this period.
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <template v-for="(metric, index) in metrics" :key="metric.key">
        <RouterLink
          v-if="metricRoute(metric)"
          :to="metricRoute(metric)"
          class="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-xl"
        >
          <LoginDashboardStatCard
            :label="metric.label"
            :value="formatMetric(metric)"
            :tone="metric.tone"
            :accent-index="index"
            clickable
          >
            <p v-if="metric.change_percent != null" class="mt-2 text-xs font-medium text-slate-500">
              <span :class="metric.change_percent >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ metric.change_percent >= 0 ? '+' : '' }}{{ fmtPercent(metric.change_percent) }}
              </span>
              vs prior period
            </p>
          </LoginDashboardStatCard>
        </RouterLink>
        <LoginDashboardStatCard
          v-else
          :label="metric.label"
          :value="formatMetric(metric)"
          :tone="metric.tone"
          :accent-index="index"
        >
          <p v-if="metric.change_percent != null" class="mt-2 text-xs text-slate-500">
            {{ metric.change_percent >= 0 ? '+' : '' }}{{ fmtPercent(metric.change_percent) }} vs prior
          </p>
        </LoginDashboardStatCard>
      </template>
    </div>
  </section>
</template>
