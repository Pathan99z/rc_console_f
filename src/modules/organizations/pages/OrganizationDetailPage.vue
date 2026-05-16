<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/shared/utils/useToast'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useOrganizationStore } from '@/modules/organizations/store/organization.store'
import OrganizationHierarchyCard from '@/modules/organizations/components/OrganizationHierarchyCard.vue'
import OrganizationStatusBadge from '@/modules/organizations/components/OrganizationStatusBadge.vue'
import OrganizationActions from '@/modules/organizations/components/OrganizationActions.vue'
import DashboardShell from '@/modules/dashboard/components/DashboardShell.vue'
import { useDashboardAccess } from '@/modules/dashboard/composables/useDashboardAccess'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const { canManageResellerTeam } = useAuth()
const organizationStore = useOrganizationStore()
const rejectReason = ref('')
const showRejectModal = ref(false)
const activeView = ref<'profile' | 'dashboard'>('profile')

const { canViewOrganizationDashboard } = useDashboardAccess(
  computed(() => organizationStore.current?.type ?? null),
)

const organizationId = Number(route.params.id)

onMounted(async () => {
  try {
    await organizationStore.fetchOrganization(organizationId)
    if (route.query.tab === 'dashboard' && canViewOrganizationDashboard.value) {
      activeView.value = 'dashboard'
    }
  } catch {
    toast.error(organizationStore.message || 'Failed to load this record.')
  }
})

function openDashboardTab() {
  activeView.value = 'dashboard'
}

function openProfileTab() {
  activeView.value = 'profile'
}

const canManage = computed(() => ['global_admin', 'company_admin', 'partner_admin'].includes(authStore.user?.role || ''))

async function approve(id: number) {
  try {
    await organizationStore.approveOrganization(id)
    toast.success('Onboarding approved.')
  } catch {
    toast.error(organizationStore.message || 'Approve failed.')
  }
}

function askReject() {
  showRejectModal.value = true
}

async function rejectConfirmed() {
  if (!organizationStore.current?.id || !rejectReason.value.trim()) return
  try {
    await organizationStore.rejectOrganization(organizationStore.current.id, rejectReason.value.trim())
    toast.success('Onboarding rejected.')
    showRejectModal.value = false
    rejectReason.value = ''
  } catch {
    toast.error(organizationStore.message || 'Reject failed.')
  }
}

async function suspend(id: number) {
  try {
    await organizationStore.suspendOrganization(id)
    toast.success('Record suspended.')
  } catch {
    toast.error(organizationStore.message || 'Suspend failed.')
  }
}

async function toggleStatus(payload: { id: number; nextStatus: 'active' | 'inactive' }) {
  try {
    await organizationStore.updateStatus(payload.id, payload.nextStatus)
    toast.success('Active status updated.')
  } catch {
    toast.error(organizationStore.message || 'Status update failed.')
  }
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Partner network record</h2>
        <p class="text-sm text-slate-500">
          Company, partner, or reseller — profile, hierarchy, assigned users, and onboarding actions.
        </p>
      </div>
      <button class="rounded border px-3 py-2 text-sm" @click="router.push('/app/organizations')">Back to directory</button>
    </header>

    <div v-if="organizationStore.detailLoading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 text-sm text-slate-500">Loading details...</div>
    <template v-else-if="organizationStore.current">
      <nav
        v-if="canViewOrganizationDashboard"
        class="flex gap-1 rounded-xl border border-[var(--rc-border-soft)] bg-white p-1"
        role="tablist"
        aria-label="Organization record views"
      >
        <button
          type="button"
          role="tab"
          class="rounded-lg px-4 py-2 text-sm font-semibold"
          :class="activeView === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'"
          :aria-selected="activeView === 'profile'"
          @click="openProfileTab"
        >
          Profile
        </button>
        <button
          type="button"
          role="tab"
          class="rounded-lg px-4 py-2 text-sm font-semibold"
          :class="activeView === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'"
          :aria-selected="activeView === 'dashboard'"
          @click="openDashboardTab"
        >
          Dashboard
        </button>
      </nav>

      <DashboardShell
        v-if="activeView === 'dashboard' && canViewOrganizationDashboard"
        :organization-id="organizationStore.current.id"
        :organization="organizationStore.current"
        mode="organization"
        :show-child-analytics="organizationStore.current.type === 'partner'"
      />

      <div v-if="activeView === 'profile' || !canViewOrganizationDashboard" class="space-y-5">
      <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">{{ organizationStore.current.display_name }}</h3>
            <p class="text-sm text-slate-500">{{ organizationStore.current.legal_name }}</p>
          </div>
          <div class="flex items-center gap-2">
            <OrganizationStatusBadge :value="organizationStore.current.onboarding_status" kind="onboarding" />
            <OrganizationStatusBadge :value="organizationStore.current.status" kind="status" />
            <button
              v-if="canViewOrganizationDashboard"
              type="button"
              class="rounded border border-indigo-200 px-2 py-1 text-xs text-indigo-700"
              @click="openDashboardTab"
            >
              Dashboard
            </button>
            <button
              v-if="canManage && (organizationStore.current.type === 'partner' || organizationStore.current.type === 'reseller')"
              type="button"
              class="rounded border border-indigo-200 px-2 py-1 text-xs text-indigo-700"
              @click="router.push(`/app/organizations/${organizationStore.current.id}/invitations`)"
            >
              Invitations
            </button>
            <button
              v-if="organizationStore.current.type === 'reseller' && canManageResellerTeam"
              type="button"
              class="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700"
              @click="router.push(`/app/organizations/${organizationStore.current.id}/team`)"
            >
              Reseller team
            </button>
            <button class="rounded border px-2 py-1 text-xs" @click="router.push(`/app/organizations/${organizationStore.current?.id}/edit`)">Edit</button>
          </div>
        </div>
        <div class="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <p><span class="font-semibold">Type:</span> {{ organizationStore.current.type }}</p>
          <p v-if="organizationStore.current.type === 'reseller' && organizationStore.current.channel_mode">
            <span class="font-semibold">Channel mode:</span>
            {{ organizationStore.current.channel_mode === 'partner_managed' ? 'Partner managed' : 'Direct' }}
          </p>
          <p><span class="font-semibold">Email:</span> {{ organizationStore.current.email || '-' }}</p>
          <p><span class="font-semibold">Phone:</span> {{ organizationStore.current.phone || '-' }}</p>
          <p><span class="font-semibold">Website:</span> {{ organizationStore.current.website || '-' }}</p>
          <p><span class="font-semibold">Location:</span> {{ organizationStore.current.city || '-' }}, {{ organizationStore.current.country || '-' }}</p>
          <p><span class="font-semibold">Credit limit:</span> {{ organizationStore.current.credit_limit || '-' }}</p>
        </div>
      </article>

      <OrganizationHierarchyCard :organization="organizationStore.current" />

      <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
        <h3 class="text-sm font-semibold text-slate-900">Assigned Users</h3>
        <p v-if="!organizationStore.current.assigned_users?.length" class="mt-2 text-sm text-slate-500">No assigned users.</p>
        <ul v-else class="mt-2 space-y-1 text-sm text-slate-700">
          <li v-for="user in organizationStore.current.assigned_users" :key="user.id">{{ user.name }} - {{ user.role }} ({{ user.email }})</li>
        </ul>
      </article>

      <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
        <h3 class="mb-3 text-sm font-semibold text-slate-900">Approval & Status Actions</h3>
        <OrganizationActions
          :item="organizationStore.current"
          :can-manage="canManage"
          :busy="organizationStore.isActionBusy"
          @approve="approve"
          @reject="askReject"
          @suspend="suspend"
          @toggle-status="toggleStatus"
        />
      </article>
      </div>
    </template>

    <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
        <h3 class="text-sm font-semibold">Reject onboarding</h3>
        <textarea v-model.trim="rejectReason" class="rc-input mt-3" rows="4" placeholder="Enter rejection reason"></textarea>
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded border px-3 py-1.5 text-sm" @click="showRejectModal = false">Cancel</button>
          <button class="btn-primary rounded px-3 py-1.5 text-sm" :disabled="!rejectReason" @click="rejectConfirmed">Reject</button>
        </div>
      </div>
    </div>
  </section>
</template>
