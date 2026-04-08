<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import DataTable from '@/shared/components/DataTable.vue'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useUsersStore } from '@/modules/users/store/users.store'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useToast } from '@/shared/utils/useToast'
import { useTeamsStore } from '@/modules/teams/store/teams.store'

const usersStore = useUsersStore()
const teamsStore = useTeamsStore()
const { isGlobalAdmin, isCompanyAdmin } = useAuth()
const toast = useToast()
const askConfirm = ref<{ id: number; nextStatus: 'active' | 'inactive' } | null>(null)
const pendingRoles = ref<Record<number, 'user' | 'company_admin'>>({})
const creatingUser = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
  tenant_id: '',
  team_id: '',
  data_scope: 'self' as 'self' | 'team',
  role: 'user' as 'user' | 'company_admin',
  status: 'active' as 'active' | 'inactive',
})

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

onMounted(async () => {
  await usersStore.fetchUsers()
  if (isGlobalAdmin.value || isCompanyAdmin.value) {
    await teamsStore.fetchTeams(1, 100)
  }
})

async function submitCreateUser() {
  if (creatingUser.value) return

  if (isGlobalAdmin.value) {
    const parsedTenantId = Number(form.tenant_id)
    if (!form.tenant_id || Number.isNaN(parsedTenantId) || parsedTenantId <= 0) {
      toast.error('Please enter a valid Tenant ID.')
      return
    }
  }

  try {
    creatingUser.value = true
    const payload: {
      name: string
      email: string
      password: string
      status: 'active' | 'inactive'
      tenant_id?: number
      role?: 'user' | 'company_admin'
      team_id?: number | null
      data_scope?: 'self' | 'team'
    } = {
      name: form.name,
      email: form.email,
      password: form.password,
      status: form.status,
      data_scope: form.data_scope,
      team_id: form.team_id ? Number(form.team_id) : null,
    }

    if (isGlobalAdmin.value) {
      payload.tenant_id = Number(form.tenant_id)
      payload.role = form.role
    }

    await usersStore.createUser(payload)
    toast.success('User created successfully.')
    form.name = ''
    form.email = ''
    form.password = ''
    form.tenant_id = ''
    form.team_id = ''
    form.data_scope = 'self'
    form.role = 'user'
    form.status = 'active'
  } catch {
    toast.error(usersStore.message || 'Failed to create user.')
  } finally {
    creatingUser.value = false
  }
}

function requestStatusChange(id: number, nextStatus: 'active' | 'inactive') {
  askConfirm.value = { id, nextStatus }
}

async function confirmStatusChange() {
  if (!askConfirm.value) return
  try {
    await usersStore.updateStatus(askConfirm.value.id, askConfirm.value.nextStatus)
    toast.success('Status updated.')
  } finally {
    askConfirm.value = null
  }
}

function currentEditableRole(role: 'global_admin' | 'user' | 'company_admin') {
  return role
}

function onRoleSelected(id: number, role: 'user' | 'company_admin') {
  pendingRoles.value[id] = role
}

function hasPendingRoleChange(id: number, currentRole: 'global_admin' | 'user' | 'company_admin') {
  if (currentRole === 'global_admin') return false
  return pendingRoles.value[id] !== undefined && pendingRoles.value[id] !== currentRole
}

async function saveRole(id: number, currentRole: 'global_admin' | 'user' | 'company_admin') {
  const nextRole = pendingRoles.value[id]
  if (!nextRole || currentRole === 'global_admin' || nextRole === currentRole) return
  try {
    await usersStore.updateRole(id, nextRole)
    toast.success('Role updated.')
    delete pendingRoles.value[id]
  } catch {
    toast.error(usersStore.message || 'Role update failed.')
  }
}

function userStatusClass(status: string) {
  if (status === 'active') return 'text-emerald-600'
  if (status === 'suspended') return 'text-rose-600'
  return 'text-amber-600'
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Users</h2>
      <p class="text-sm text-slate-500">Manage users by role and tenant scope.</p>
    </header>

    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <h3 class="mb-3 text-sm font-semibold">Create user</h3>
      <div class="grid gap-3 md:grid-cols-2">
        <input v-model="form.name" class="rc-input" placeholder="Full name" />
        <input v-model="form.email" class="rc-input" placeholder="Email" />
        <input v-model="form.password" type="password" class="rc-input" placeholder="Password" />
        <select v-model="form.status" class="rc-input">
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
        <template v-if="isGlobalAdmin">
          <input v-model="form.tenant_id" class="rc-input" placeholder="Tenant ID" />
          <select v-model="form.role" class="rc-input">
            <option value="user">user</option>
            <option value="company_admin">company_admin</option>
          </select>
        </template>
        <template v-if="teamsStore.items.length">
          <select v-model="form.team_id" class="rc-input">
            <option value="">No team assigned</option>
            <option v-for="team in teamsStore.items" :key="team.id" :value="String(team.id)">
              {{ team.name }}
            </option>
          </select>
        </template>
        <div class="rounded-lg border border-[var(--rc-border-soft)] bg-slate-50 p-3 md:col-span-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Data Scope</p>
          <div class="mt-2 flex gap-4">
            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.data_scope" type="radio" value="self" />
              self (only my contacts)
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.data_scope" type="radio" value="team" />
              team (my team contacts)
            </label>
          </div>
        </div>
      </div>
      <p v-if="usersStore.message" class="mt-2 text-sm text-slate-600">{{ usersStore.message }}</p>
      <p v-if="usersStore.errors.email?.[0]" class="mt-1 text-sm text-red-600">{{ usersStore.errors.email[0] }}</p>
      <button
        class="btn-primary mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
        :disabled="usersStore.loading || creatingUser"
        @click="submitCreateUser"
      >
        <span v-if="creatingUser" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
        <span>{{ creatingUser ? 'Creating...' : 'Create User' }}</span>
      </button>
    </div>

    <DataTable :columns="columns" :rows="usersStore.items" :loading="usersStore.loading" empty-message="No users found.">
      <template #rows>
        <tr v-for="user in usersStore.items" :key="user.id" class="border-t">
          <td class="px-4 py-3">{{ user.name }}</td>
          <td class="px-4 py-3">{{ user.email }}</td>
          <td class="px-4 py-3">
            <template v-if="isGlobalAdmin">
              <div class="flex items-center gap-2">
                <select
                  :value="pendingRoles[user.id] ?? currentEditableRole(user.role)"
                  class="rounded border px-2 py-1 text-xs"
                  :disabled="user.role === 'global_admin'"
                  @change="onRoleSelected(user.id, ($event.target as HTMLSelectElement).value as 'user' | 'company_admin')"
                >
                  <option value="user">user</option>
                  <option value="company_admin">company_admin</option>
                  <option v-if="user.role === 'global_admin'" value="global_admin">global_admin</option>
                </select>
                <button
                  class="rounded border px-2 py-1 text-xs"
                  :disabled="!hasPendingRoleChange(user.id, user.role) || usersStore.loading"
                  @click="saveRole(user.id, user.role)"
                >
                  Save
                </button>
              </div>
            </template>
            <span v-else>{{ user.role }}</span>
          </td>
          <td class="px-4 py-3">
            <span :class="userStatusClass(user.status)">{{ user.status }}</span>
          </td>
          <td class="px-4 py-3">
            <button
              class="rounded border px-2 py-1 text-xs"
              @click="requestStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')"
            >
              Set {{ user.status === 'active' ? 'inactive' : 'active' }}
            </button>
          </td>
        </tr>
      </template>
    </DataTable>

    <PaginationControls
      :current-page="usersStore.pagination.current_page"
      :last-page="usersStore.pagination.last_page"
      @change="(page) => usersStore.fetchUsers(page, usersStore.pagination.per_page)"
    />

    <div v-if="askConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
        <h4 class="text-sm font-semibold">Confirm status update</h4>
        <p class="mt-2 text-sm text-slate-600">Are you sure you want to change this user status?</p>
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded border px-3 py-1.5 text-sm" @click="askConfirm = null">Cancel</button>
          <button class="btn-primary rounded px-3 py-1.5 text-sm" @click="confirmStatusChange">Confirm</button>
        </div>
      </div>
    </div>
  </section>
</template>
