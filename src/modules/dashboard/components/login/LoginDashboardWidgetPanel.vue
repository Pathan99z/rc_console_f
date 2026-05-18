<script setup lang="ts">
import { RouterLink } from 'vue-router'
import DashboardSectionCard from '@/modules/dashboard/components/DashboardSectionCard.vue'
import DashboardEmptyState from '@/modules/dashboard/components/DashboardEmptyState.vue'
import DashboardKpiCard from '@/modules/dashboard/components/DashboardKpiCard.vue'
import type {
  DashboardActivityRow,
  DashboardAlertRow,
  DashboardAuditRow,
  LoginDashboardWidgets,
} from '@/modules/dashboard/types/loginDashboard.types'
import { fmtCurrency, fmtNumber } from '@/modules/dashboard/utils/dashboardFormat'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { resolveDashboardAppRoute } from '@/modules/dashboard/utils/loginDashboardRoutes'

const props = defineProps<{
  widgets: LoginDashboardWidgets
  showAudit?: boolean
  showNotifications?: boolean
  links?: Record<string, string>
}>()

const authStore = useAuthStore()

const routeContext = () => ({
  organizationId: authStore.user?.organization?.id ?? authStore.user?.organization_id ?? null,
})

function linkRoute(path: string | undefined, key: string) {
  return resolveDashboardAppRoute(path, key, routeContext())
}

function activityTitle(row: DashboardActivityRow) {
  return row.title || row.message || row.description || row.entity_label || 'Activity'
}

function auditTitle(row: DashboardAuditRow) {
  return row.title || row.event_key || row.action || 'Audit event'
}

function alertTitle(row: DashboardAlertRow) {
  return row.title || row.message || 'Alert'
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <DashboardSectionCard
      v-if="widgets.onboarding && Object.keys(widgets.onboarding).length"
      title="Onboarding"
      :subtitle="links?.onboarding ? undefined : undefined"
    >
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <DashboardKpiCard
          v-for="(val, key) in widgets.onboarding"
          :key="key"
          :label="String(key).replace(/_/g, ' ')"
          :value="typeof val === 'number' ? fmtNumber(val) : String(val)"
        />
      </div>
      <RouterLink
        v-if="links?.onboarding && linkRoute(links.onboarding, 'onboarding')"
        :to="linkRoute(links.onboarding, 'onboarding')"
        class="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800"
      >
        View onboarding →
      </RouterLink>
    </DashboardSectionCard>

    <DashboardSectionCard v-if="widgets.payments" title="Payments">
      <div class="grid grid-cols-3 gap-3">
        <DashboardKpiCard label="Successful" :value="fmtNumber(widgets.payments.success)" tone="emerald" />
        <DashboardKpiCard label="Failed" :value="fmtNumber(widgets.payments.failed)" tone="rose" />
        <DashboardKpiCard label="Pending" :value="fmtNumber(widgets.payments.pending)" tone="amber" />
      </div>
    </DashboardSectionCard>

    <DashboardSectionCard v-if="widgets.pending_invoices" title="Pending invoices">
      <DashboardEmptyState v-if="!widgets.pending_invoices.items?.length" message="No pending invoices." />
      <ul v-else class="divide-y text-sm">
        <li v-for="item in widgets.pending_invoices.items" :key="item.id" class="flex justify-between py-2">
          <span>{{ activityTitle(item) }}</span>
          <span class="text-slate-500">{{ item.occurred_at || item.created_at }}</span>
        </li>
      </ul>
    </DashboardSectionCard>

    <DashboardSectionCard v-if="widgets.overdue_tasks" title="Overdue tasks">
      <p v-if="widgets.overdue_tasks.count != null" class="mb-2 text-sm text-slate-600">
        {{ fmtNumber(widgets.overdue_tasks.count) }} overdue
      </p>
      <DashboardEmptyState v-if="!widgets.overdue_tasks.items?.length" message="No overdue tasks." />
      <ul v-else class="divide-y text-sm">
        <li v-for="item in widgets.overdue_tasks.items" :key="item.id" class="py-2">
          {{ activityTitle(item) }}
        </li>
      </ul>
    </DashboardSectionCard>

    <DashboardSectionCard v-if="widgets.tasks" title="Tasks">
      <div class="grid grid-cols-3 gap-3">
        <DashboardKpiCard label="Open" :value="fmtNumber(widgets.tasks.open)" />
        <DashboardKpiCard label="Overdue" :value="fmtNumber(widgets.tasks.overdue)" tone="rose" />
        <DashboardKpiCard label="Completed" :value="fmtNumber(widgets.tasks.completed)" tone="emerald" />
      </div>
    </DashboardSectionCard>

    <DashboardSectionCard v-if="widgets.invitations" title="Invitations">
      <div class="grid grid-cols-3 gap-3">
        <DashboardKpiCard label="Pending" :value="fmtNumber(widgets.invitations.pending)" tone="amber" />
        <DashboardKpiCard label="Accepted" :value="fmtNumber(widgets.invitations.accepted)" tone="emerald" />
        <DashboardKpiCard label="Total" :value="fmtNumber(widgets.invitations.total)" />
      </div>
    </DashboardSectionCard>

    <DashboardSectionCard v-if="widgets.licenses" title="Licenses">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DashboardKpiCard label="Allocated" :value="fmtNumber(widgets.licenses.allocated)" />
        <DashboardKpiCard label="Consumed" :value="fmtNumber(widgets.licenses.consumed)" />
        <DashboardKpiCard label="Available" :value="fmtNumber(widgets.licenses.available)" tone="emerald" />
        <DashboardKpiCard label="Units" :value="fmtNumber(widgets.licenses.units)" tone="indigo" />
      </div>
    </DashboardSectionCard>

    <DashboardSectionCard
      v-if="showNotifications && widgets.notifications"
      title="Recent notifications"
    >
      <p v-if="widgets.notifications.unread != null" class="mb-2 text-sm text-slate-600">
        {{ fmtNumber(widgets.notifications.unread) }} unread
      </p>
      <DashboardEmptyState v-if="!widgets.notifications.items?.length" message="No recent notifications." />
      <ul v-else class="divide-y text-sm">
        <li v-for="item in widgets.notifications.items" :key="item.id" class="py-2">
          {{ activityTitle(item) }}
        </li>
      </ul>
    </DashboardSectionCard>

    <DashboardSectionCard
      v-if="widgets.recent_activity?.length || widgets.recent_crm_activity?.length"
      title="Recent CRM activity"
      subtitle="Latest updates across your pipeline."
    >
      <ul class="space-y-2">
        <li
          v-for="item in widgets.recent_crm_activity?.length ? widgets.recent_crm_activity : widgets.recent_activity"
          :key="item.id"
          class="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-sm"
        >
          <span class="min-w-0 truncate font-medium text-slate-800">{{ activityTitle(item) }}</span>
          <time class="shrink-0 text-xs text-slate-500">{{ item.occurred_at || item.created_at }}</time>
        </li>
      </ul>
    </DashboardSectionCard>

    <DashboardSectionCard
      v-if="showAudit && (widgets.recent_audit_events?.length || widgets.audit_events?.length)"
      title="Recent audit events"
    >
      <ul class="divide-y text-sm">
        <li
          v-for="item in widgets.recent_audit_events?.length ? widgets.recent_audit_events : widgets.audit_events"
          :key="item.id"
          class="py-2"
        >
          <p class="font-medium text-slate-800">{{ auditTitle(item) }}</p>
          <p class="text-xs text-slate-500">
            {{ item.actor_name || 'System' }} · {{ item.occurred_at }}
          </p>
        </li>
      </ul>
      <RouterLink
        v-if="links?.audit_logs && linkRoute(links.audit_logs, 'audit_logs')"
        :to="linkRoute(links.audit_logs, 'audit_logs')"
        class="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800"
      >
        View audit logs →
      </RouterLink>
    </DashboardSectionCard>

    <DashboardSectionCard v-if="widgets.license_alerts?.length" title="License alerts">
      <ul class="divide-y text-sm">
        <li v-for="alert in widgets.license_alerts" :key="alert.id" class="py-2">
          <p class="font-medium">{{ alertTitle(alert) }}</p>
          <p v-if="alert.message" class="text-xs text-slate-500">{{ alert.message }}</p>
        </li>
      </ul>
    </DashboardSectionCard>

    <DashboardSectionCard v-if="widgets.revenue_this_month != null" title="Revenue this month">
      <DashboardKpiCard label="Total" :value="fmtCurrency(widgets.revenue_this_month)" tone="indigo" />
    </DashboardSectionCard>

    <DashboardSectionCard v-if="widgets.assigned_contacts != null" title="Assigned contacts">
      <DashboardKpiCard label="Contacts" :value="fmtNumber(widgets.assigned_contacts)" tone="indigo" />
    </DashboardSectionCard>
  </div>
</template>
