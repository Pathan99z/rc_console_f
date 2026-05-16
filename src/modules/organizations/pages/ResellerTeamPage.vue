<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useOrganizationStore } from '@/modules/organizations/store/organization.store'
import { useOrganizationUsersStore } from '@/modules/organizations/store/organization.users.store'
import type { OrganizationUserRoleCode } from '@/modules/organizations/types/organization.users.types'
import OrganizationStatusBadge from '@/modules/organizations/components/OrganizationStatusBadge.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const { canManageResellerTeam, isResellerAdmin } = useAuth()
const orgStore = useOrganizationStore()
const usersStore = useOrganizationUsersStore()

const organizationId = Number(route.params.id)
const showInvite = ref(false)
const confirmAction = ref<{ type: 'status' | 'reset'; userId: number; nextStatus?: 'active' | 'inactive' | 'suspended' } | null>(null)

const inviteForm = reactive({
  email: '',
  role_code: 'reseller_sales_consultant' as OrganizationUserRoleCode,
  expires_in_days: 7,
})

const roleOptions: Array<{ value: OrganizationUserRoleCode; label: string }> = [
  { value: 'reseller_admin', label: 'Reseller Admin' },
  { value: 'reseller_sales_manager', label: 'Sales Manager' },
  { value: 'reseller_sales_consultant', label: 'Sales Consultant' },
]

const canInvite = computed(() => canManageResellerTeam.value && orgStore.current?.type === 'reseller')

const filteredRoles = computed(() => {
  if (isResellerAdmin.value) return roleOptions.filter((r) => r.value !== 'reseller_admin')
  return roleOptions
})

function roleLabel(code: string) {
  return roleOptions.find((r) => r.value === code)?.label || code.replace(/_/g, ' ')
}

onMounted(async () => {
  try {
    await orgStore.fetchOrganization(organizationId)
    if (orgStore.current?.type !== 'reseller') {
      toast.error('Team management is only available for reseller organizations.')
      void router.push(`/app/organizations/${organizationId}`)
      return
    }
    await usersStore.fetchUsers(organizationId)
  } catch {
    toast.error(usersStore.message || orgStore.message || 'Failed to load team.')
  }
})

async function submitInvite() {
  if (!inviteForm.email.trim()) {
    toast.error('Enter an email address.')
    return
  }
  if (isResellerAdmin.value && inviteForm.role_code === 'reseller_admin') {
    toast.error('Reseller admins cannot invite another reseller admin.')
    return
  }
  try {
    await usersStore.inviteUser(organizationId, {
      email: inviteForm.email.trim(),
      role_code: inviteForm.role_code,
      expires_in_days: inviteForm.expires_in_days || 7,
    })
    toast.success(usersStore.message || 'Invitation sent.')
    showInvite.value = false
    inviteForm.email = ''
  } catch {
    toast.error(usersStore.message || 'Could not send invitation.')
  }
}

function askStatus(userId: number, nextStatus: 'active' | 'inactive' | 'suspended') {
  confirmAction.value = { type: 'status', userId, nextStatus }
}

function askReset(userId: number) {
  confirmAction.value = { type: 'reset', userId }
}

async function confirmPending() {
  const action = confirmAction.value
  if (!action) return
  try {
    if (action.type === 'status' && action.nextStatus) {
      await usersStore.updateUserStatus(organizationId, action.userId, action.nextStatus)
      toast.success(usersStore.message || 'User status updated.')
    } else if (action.type === 'reset') {
      await usersStore.resetUserPassword(organizationId, action.userId)
      toast.success(usersStore.message || 'Password reset email sent.')
    }
  } catch {
    toast.error(usersStore.message || 'Action failed.')
  } finally {
    confirmAction.value = null
  }
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Reseller team</h2>
        <p v-if="orgStore.current" class="text-sm text-slate-500">{{ orgStore.current.display_name }}</p>
      </div>
      <div class="flex gap-2">
        <button type="button" class="rounded border px-3 py-2 text-sm" @click="router.push(`/app/organizations/${organizationId}`)">Back</button>
        <button v-if="canInvite" type="button" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="showInvite = true">
          Invite member
        </button>
      </div>
    </header>

    <div class="overflow-x-auto rounded-xl border border-[var(--rc-border-soft)] bg-white">
      <table class="min-w-full divide-y divide-[var(--rc-border-soft)] text-sm">
        <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-3 text-left">Name</th>
            <th class="px-4 py-3 text-left">Email</th>
            <th class="px-4 py-3 text-left">Role</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--rc-border-soft)]">
          <tr v-if="usersStore.loading">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">Loading team…</td>
          </tr>
          <tr v-else-if="!usersStore.items.length">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">No team members yet. Invite your first user.</td>
          </tr>
          <tr v-for="user in usersStore.items" v-else :key="user.id">
            <td class="px-4 py-3 font-medium text-slate-900">{{ user.name || '—' }}</td>
            <td class="px-4 py-3 text-slate-700">{{ user.email }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800">{{ roleLabel(user.role) }}</span>
            </td>
            <td class="px-4 py-3">
              <OrganizationStatusBadge :value="user.status" kind="status" />
            </td>
            <td class="px-4 py-3 text-right">
              <div v-if="canManageResellerTeam && user.id !== authStore.user?.id" class="inline-flex flex-wrap justify-end gap-1">
                <button
                  v-if="user.status !== 'active'"
                  type="button"
                  class="rounded border px-2 py-1 text-xs"
                  :disabled="usersStore.submitting"
                  @click="askStatus(user.id, 'active')"
                >
                  Activate
                </button>
                <button
                  v-if="user.status === 'active'"
                  type="button"
                  class="rounded border px-2 py-1 text-xs"
                  :disabled="usersStore.submitting"
                  @click="askStatus(user.id, 'inactive')"
                >
                  Suspend
                </button>
                <button type="button" class="rounded border px-2 py-1 text-xs" :disabled="usersStore.submitting" @click="askReset(user.id)">
                  Reset password
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationControls
      :current-page="usersStore.pagination.current_page"
      :last-page="usersStore.pagination.last_page"
      @change="(p) => usersStore.fetchUsers(organizationId, p, usersStore.pagination.per_page)"
    />

    <div v-if="showInvite" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 class="text-sm font-semibold text-slate-900">Invite team member</h3>
        <div class="mt-4 space-y-3">
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600" for="team-email">Email</label>
            <input id="team-email" v-model.trim="inviteForm.email" type="email" class="rc-input w-full" placeholder="consultant@reseller.com" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600" for="team-role">Role</label>
            <select id="team-role" v-model="inviteForm.role_code" class="rc-input w-full">
              <option v-for="r in filteredRoles" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600" for="team-expiry">Invitation expires (days)</label>
            <input id="team-expiry" v-model.number="inviteForm.expires_in_days" type="number" min="1" max="30" class="rc-input w-full" />
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded border px-3 py-2 text-sm" @click="showInvite = false">Cancel</button>
          <button type="button" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" :disabled="usersStore.submitting" @click="submitInvite">
            {{ usersStore.submitting ? 'Sending…' : 'Send invitation' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="confirmAction" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 class="text-sm font-semibold text-slate-900">Confirm action</h3>
        <p class="mt-2 text-sm text-slate-600">
          {{
            confirmAction.type === 'reset'
              ? 'Send a password reset email to this user?'
              : `Set this user to ${confirmAction.nextStatus}?`
          }}
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded border px-3 py-2 text-sm" @click="confirmAction = null">Cancel</button>
          <button type="button" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" :disabled="usersStore.submitting" @click="confirmPending">
            Confirm
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
