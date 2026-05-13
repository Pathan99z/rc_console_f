<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useOrganizationStore } from '@/modules/organizations/store/organization.store'
import { usePrmStore } from '@/modules/prm/store/prm.store'
import type { OrganizationType } from '@/modules/organizations/types/organization.types'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const orgStore = useOrganizationStore()
const prmStore = usePrmStore()

const organizationId = Number(route.params.id)
const search = ref('')
const showCreate = ref(false)
const creating = ref(false)
const confirmRevokeId = ref<number | null>(null)

const inviteForm = reactive({
  email: '',
  role_code: 'partner_admin' as 'partner_admin' | 'reseller_admin',
  expires_in_days: 14,
})

const roleOptions = computed(() => {
  const t = orgStore.current?.type as OrganizationType | undefined
  if (t === 'reseller') return [{ value: 'reseller_admin' as const, label: 'Reseller admin' }]
  if (t === 'partner') return [{ value: 'partner_admin' as const, label: 'Partner admin' }]
  return [
    { value: 'partner_admin' as const, label: 'Partner admin' },
    { value: 'reseller_admin' as const, label: 'Reseller admin' },
  ]
})

onMounted(async () => {
  try {
    await orgStore.fetchOrganization(organizationId)
    if (orgStore.current?.type === 'partner' || orgStore.current?.type === 'reseller') {
      inviteForm.role_code = orgStore.current.type === 'reseller' ? 'reseller_admin' : 'partner_admin'
    }
    await prmStore.fetchInvitations(organizationId)
  } catch {
    toast.error(prmStore.message || orgStore.message || 'Failed to load invitations.')
  }
})

const filteredInvitations = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return prmStore.invitations
  return prmStore.invitations.filter((i) => i.email.toLowerCase().includes(q))
})

function statusClass(status: string) {
  if (status === 'pending') return 'bg-amber-50 text-amber-800'
  if (status === 'accepted') return 'bg-emerald-50 text-emerald-800'
  if (status === 'revoked') return 'bg-slate-100 text-slate-600'
  if (status === 'expired') return 'bg-red-50 text-red-700'
  return 'bg-slate-50 text-slate-700'
}

async function createInvite() {
  if (creating.value || !inviteForm.email.trim()) return
  creating.value = true
  try {
    await prmStore.createInvitation(organizationId, {
      email: inviteForm.email.trim(),
      role_code: inviteForm.role_code,
      expires_in_days: inviteForm.expires_in_days || undefined,
    })
    toast.success(prmStore.message || 'Invitation sent.')
    showCreate.value = false
    inviteForm.email = ''
  } catch {
    toast.error(prmStore.message || 'Could not create invitation.')
  } finally {
    creating.value = false
  }
}

async function resend(id: number) {
  try {
    await prmStore.resendInvitation(organizationId, id)
    toast.success(prmStore.message || 'Invitation resent.')
  } catch {
    toast.error(prmStore.message || 'Resend failed.')
  }
}

async function revoke(id: number) {
  try {
    await prmStore.revokeInvitation(organizationId, id)
    toast.success(prmStore.message || 'Invitation revoked.')
  } catch {
    toast.error(prmStore.message || 'Revoke failed.')
  } finally {
    confirmRevokeId.value = null
  }
}

const canManage = computed(() => ['global_admin', 'company_admin', 'partner_admin'].includes(authStore.user?.role || ''))
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Organization invitations</h2>
        <p class="text-sm text-slate-500">
          {{ orgStore.current?.display_name || `Organization #${organizationId}` }} — onboard partner and reseller admins securely.
        </p>
      </div>
      <div class="flex gap-2">
        <button type="button" class="rounded border px-3 py-2 text-sm" @click="router.push(`/app/organizations/${organizationId}`)">
          Back to record
        </button>
        <button v-if="canManage" type="button" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="showCreate = true">
          Invite user
        </button>
      </div>
    </header>

    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <input v-model.trim="search" class="rc-input max-w-md" placeholder="Filter by email…" />
    </div>

    <div class="overflow-x-auto rounded-xl border border-[var(--rc-border-soft)] bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-3 text-left">Email</th>
            <th class="px-4 py-3 text-left">Role</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Expires</th>
            <th v-if="canManage" class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="prmStore.invitationsLoading">
            <td :colspan="canManage ? 5 : 4" class="px-4 py-8 text-center text-slate-500">Loading…</td>
          </tr>
          <tr v-else-if="!filteredInvitations.length">
            <td :colspan="canManage ? 5 : 4" class="px-4 py-8 text-center text-slate-500">No invitations match.</td>
          </tr>
          <tr v-for="row in filteredInvitations" v-else :key="row.id" class="border-t border-[var(--rc-border-soft)]">
            <td class="px-4 py-3 font-medium text-slate-900">{{ row.email }}</td>
            <td class="px-4 py-3 font-mono text-xs">{{ row.role_code }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs font-semibold capitalize" :class="statusClass(String(row.status))">{{ row.status }}</span>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ row.expires_at || '—' }}</td>
            <td v-if="canManage" class="px-4 py-3 text-right">
              <button
                v-if="row.status === 'pending'"
                type="button"
                class="mr-2 rounded border px-2 py-1 text-xs"
                @click="resend(row.id)"
              >
                Resend
              </button>
              <button
                v-if="row.status === 'pending'"
                type="button"
                class="rounded border border-red-200 px-2 py-1 text-xs text-red-700"
                @click="confirmRevokeId = row.id"
              >
                Revoke
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationControls
      v-if="canManage"
      :current-page="prmStore.invitationsPagination.current_page"
      :last-page="prmStore.invitationsPagination.last_page"
      @change="(p) => prmStore.fetchInvitations(organizationId, p, prmStore.invitationsPagination.per_page)"
    />

    <div v-if="showCreate && canManage" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 class="text-sm font-semibold text-slate-900">Create invitation</h3>
        <p class="mt-1 text-xs text-slate-500">An email will be sent with a secure link. The token is never shown in the app.</p>
        <div class="mt-4 grid gap-3">
          <input v-model.trim="inviteForm.email" type="email" class="rc-input" placeholder="Email" required />
          <select v-model="inviteForm.role_code" class="rc-input">
            <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <input v-model.number="inviteForm.expires_in_days" type="number" min="1" max="90" class="rc-input" placeholder="Expires in days" />
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded border px-3 py-2 text-sm" @click="showCreate = false">Cancel</button>
          <button type="button" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" :disabled="creating" @click="createInvite">
            {{ creating ? 'Sending…' : 'Send invite' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="confirmRevokeId != null" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 class="text-sm font-semibold">Revoke invitation?</h3>
        <p class="mt-2 text-xs text-slate-600">The recipient will no longer be able to accept this invite.</p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded border px-3 py-2 text-sm" @click="confirmRevokeId = null">Cancel</button>
          <button type="button" class="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white" @click="revoke(confirmRevokeId!)">
            Revoke
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
