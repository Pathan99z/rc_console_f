<script setup lang="ts">
import { onMounted } from 'vue'
import { useToast } from '@/shared/utils/useToast'
import { usePrmStore } from '@/modules/prm/store/prm.store'

const prmStore = usePrmStore()
const toast = useToast()

onMounted(async () => {
  try {
    await prmStore.fetchPartnerDashboard()
  } catch {
    toast.error(prmStore.message || 'Failed to load dashboard.')
  }
})

function fmt(n: number | undefined) {
  if (n === undefined || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Dashboard</h2>
      <p class="text-sm text-slate-500">Partner relationship KPIs for your organization.</p>
    </header>

    <div v-if="prmStore.dashboardLoading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-8 text-center text-sm text-slate-500">
      Loading dashboard…
    </div>
    <template v-else-if="prmStore.dashboardSummary">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Leads</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">{{ fmt(prmStore.dashboardSummary.counts.leads) }}</p>
        </article>
        <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Deals</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">{{ fmt(prmStore.dashboardSummary.counts.deals) }}</p>
        </article>
        <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Quotes</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">{{ fmt(prmStore.dashboardSummary.counts.quotes) }}</p>
        </article>
        <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Pipeline value</p>
          <p class="mt-2 text-2xl font-bold text-indigo-700">{{ fmt(prmStore.dashboardSummary.pipeline_value) }}</p>
        </article>
        <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending commission</p>
          <p class="mt-2 text-2xl font-bold text-amber-700">{{ fmt(prmStore.dashboardSummary.commission_pending_total) }}</p>
        </article>
        <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">License units available</p>
          <p class="mt-2 text-2xl font-bold text-emerald-700">{{ fmt(prmStore.dashboardSummary.license_units_available) }}</p>
        </article>
      </div>
      <p class="text-xs text-slate-500">
        Use the main CRM for full deal and quote workflows. This view summarizes PRM-scoped activity.
      </p>
    </template>
  </section>
</template>
