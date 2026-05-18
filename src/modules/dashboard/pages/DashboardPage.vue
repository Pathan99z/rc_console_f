<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import DashboardErrorState from '@/modules/dashboard/components/DashboardErrorState.vue'
import DashboardLoadingSkeleton from '@/modules/dashboard/components/DashboardLoadingSkeleton.vue'
import DashboardEmptyState from '@/modules/dashboard/components/DashboardEmptyState.vue'
import LoginDashboardKpiGrid from '@/modules/dashboard/components/login/LoginDashboardKpiGrid.vue'
import LoginDashboardCharts from '@/modules/dashboard/components/login/LoginDashboardCharts.vue'
import LoginDashboardWidgetPanel from '@/modules/dashboard/components/login/LoginDashboardWidgetPanel.vue'
import LoginDashboardQuickLinks from '@/modules/dashboard/components/login/LoginDashboardQuickLinks.vue'
import { useLoginDashboard } from '@/modules/dashboard/composables/useLoginDashboard'
import { profileTitle } from '@/modules/dashboard/utils/loginDashboardProfile'

const authStore = useAuthStore()
const { store, profile, title, subtitle, canViewAudit, canViewNotifications, load } = useLoginDashboard()
const loadError = ref<string | null>(null)
const refreshing = ref(false)

const payload = computed(() => store.payload)
const greeting = computed(() => {
  const name = authStore.user?.name?.split(' ')?.[0]
  return name ? `Welcome back, ${name}` : 'Welcome to RC Console'
})

const pageTitle = computed(() => payload.value?.title || title.value || profileTitle(profile.value))
const pageSubtitle = computed(() => payload.value?.subtitle || subtitle.value)

const hasCharts = computed(() => {
  const charts = payload.value?.charts
  if (!charts) return false
  const revenue = charts.monthly_revenue || charts.revenue_trend || []
  const tiers = charts.tier_distribution || []
  const pipeline = charts.pipeline || []
  return (
    revenue.some((p) => (p.revenue ?? p.amount ?? p.value ?? 0) > 0) ||
    tiers.some((t) => (t.percent ?? t.value ?? 0) > 0) ||
    pipeline.some((p) => (p.value ?? p.amount ?? 0) > 0)
  )
})

const hasWidgets = computed(() => {
  const w = payload.value?.widgets
  if (!w) return false
  return Boolean(
    w.onboarding ||
      w.payments ||
      w.pending_invoices ||
      w.overdue_tasks ||
      w.tasks ||
      w.invitations ||
      w.licenses ||
      w.notifications ||
      w.recent_activity?.length ||
      w.recent_crm_activity?.length ||
      (canViewAudit.value && (w.recent_audit_events?.length || w.audit_events?.length)) ||
      w.license_alerts?.length ||
      w.revenue_this_month != null ||
      w.assigned_contacts != null,
  )
})

async function refresh(force = true) {
  loadError.value = null
  refreshing.value = true
  try {
    await load(force)
  } catch (error) {
    const err = toApiError(error)
    if (err.isUnauthorized) {
      loadError.value = 'Your session has expired. Please sign in again.'
    } else if (err.isForbidden) {
      loadError.value = 'You do not have permission to view this dashboard.'
    } else if (err.isValidation) {
      loadError.value = err.message || 'Invalid dashboard request.'
    } else {
      loadError.value = err.message || 'Unable to load dashboard. Check your connection and try again.'
    }
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  void refresh(false)
})
</script>

<template>
  <main class="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-6" aria-label="Dashboard">
    <header
      class="relative flex flex-wrap items-start justify-between gap-4 overflow-hidden rounded-2xl border border-[var(--rc-border-soft)] bg-gradient-to-br from-white via-white to-indigo-50/50 p-5 shadow-sm"
    >
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold uppercase tracking-wider text-indigo-600/80">{{ greeting }}</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">{{ pageTitle }}</h1>
        <p v-if="pageSubtitle" class="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{{ pageSubtitle }}</p>
        <p v-if="payload?.generated_at" class="mt-2 text-xs text-slate-400">
          Last updated {{ payload.generated_at }}
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        :disabled="store.loading || refreshing"
        @click="refresh(true)"
      >
        {{ refreshing ? 'Refreshing…' : 'Refresh' }}
      </button>
    </header>

    <DashboardErrorState
      v-if="store.accessDenied"
      message="You do not have permission to view the dashboard."
      @retry="refresh(true)"
    />
    <DashboardErrorState v-else-if="loadError" :message="loadError" @retry="refresh(true)" />
    <DashboardLoadingSkeleton v-else-if="store.loading && !payload" />

    <template v-else-if="payload">
      <LoginDashboardQuickLinks v-if="Object.keys(payload.links).length" :links="payload.links" />

      <section v-if="payload.kpis.length" class="space-y-3">
        <h2 class="text-sm font-semibold text-slate-800">Key metrics</h2>
        <LoginDashboardKpiGrid :metrics="payload.kpis" />
      </section>

      <LoginDashboardCharts v-if="hasCharts" :charts="payload.charts" />

      <section v-if="hasWidgets" class="space-y-3">
        <h2 class="text-sm font-semibold text-slate-800">Activity & insights</h2>
        <LoginDashboardWidgetPanel
        :widgets="payload.widgets"
        :links="payload.links"
        :show-audit="canViewAudit"
        :show-notifications="canViewNotifications"
        />
      </section>

      <DashboardEmptyState
        v-if="!payload.kpis.length && !hasCharts && !hasWidgets"
        message="No dashboard metrics are available for your account yet."
      />
    </template>

    <DashboardEmptyState v-else message="Dashboard data is not available." />
  </main>
</template>
