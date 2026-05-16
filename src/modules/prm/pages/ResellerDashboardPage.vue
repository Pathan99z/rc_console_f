<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { usePrmStore } from '@/modules/prm/store/prm.store'
import DashboardShell from '@/modules/dashboard/components/DashboardShell.vue'
import DashboardKpiCard from '@/modules/dashboard/components/DashboardKpiCard.vue'
import { useDashboardAccess } from '@/modules/dashboard/composables/useDashboardAccess'
import { fmtNumber } from '@/modules/dashboard/utils/dashboardFormat'

const authStore = useAuthStore()
const prmStore = usePrmStore()
const { canViewResellerSelfDashboard } = useDashboardAccess()

const organization = computed(() => {
  const org = authStore.user?.organization
  if (!org) return null
  return {
    id: org.id,
    display_name: authStore.user?.name || `Organization #${org.id}`,
    type: 'reseller' as const,
    legal_name: '',
    onboarding_status: 'active' as const,
    status: 'active' as const,
    tenant_id: authStore.user?.tenant_id ?? 0,
  }
})

onMounted(async () => {
  try {
    await prmStore.fetchPartnerDashboard()
  } catch {
    /* legacy summary optional */
  }
})

function fmt(n: number | undefined) {
  return fmtNumber(n)
}
</script>

<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Reseller dashboard</h2>
      <p class="text-sm text-slate-500">CRM and PRM analytics for your reseller organization.</p>
    </header>

    <div v-if="prmStore.dashboardSummary" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <DashboardKpiCard label="Deals" :value="fmt(prmStore.dashboardSummary.counts.deals)" />
      <DashboardKpiCard label="Quotes" :value="fmt(prmStore.dashboardSummary.counts.quotes)" tone="indigo" />
      <DashboardKpiCard label="Pipeline value" :value="fmt(prmStore.dashboardSummary.pipeline_value)" tone="indigo" />
      <DashboardKpiCard label="Pending commission" :value="fmt(prmStore.dashboardSummary.commission_pending_total)" tone="amber" />
      <DashboardKpiCard label="License units available" :value="fmt(prmStore.dashboardSummary.license_units_available)" tone="emerald" />
    </div>

    <DashboardShell
      v-if="canViewResellerSelfDashboard"
      :organization-id="authStore.user?.organization_id ?? null"
      :organization="organization"
      mode="reseller"
      :show-child-analytics="false"
    />
  </section>
</template>
