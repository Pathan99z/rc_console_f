<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DataTable from '@/shared/components/DataTable.vue'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useTenantsStore } from '@/modules/tenants/store/tenants.store'
import { useToast } from '@/shared/utils/useToast'

const tenantsStore = useTenantsStore()
const toast = useToast()
const askConfirm = ref<{ id: number; nextStatus: 'active' | 'suspended' } | null>(null)

const columns = [
  { key: 'name', label: 'Tenant' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created At' },
  { key: 'actions', label: 'Actions' },
]

onMounted(() => tenantsStore.fetchTenants())

function requestStatusChange(id: number, nextStatus: 'active' | 'suspended') {
  askConfirm.value = { id, nextStatus }
}

async function confirmStatusChange() {
  if (!askConfirm.value) return
  try {
    await tenantsStore.updateStatus(askConfirm.value.id, askConfirm.value.nextStatus)
    toast.success('Tenant status updated.')
  } catch {
    toast.error(tenantsStore.message || 'Tenant update failed.')
  } finally {
    askConfirm.value = null
  }
}

function tenantStatusClass(status: string) {
  if (status === 'active') return 'text-emerald-600'
  if (status === 'suspended') return 'text-rose-600'
  return 'text-amber-600'
}

function nextTenantAction(status: string): 'active' | 'suspended' {
  return status === 'active' ? 'suspended' : 'active'
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Tenants</h2>
      <p class="text-sm text-slate-500">Global tenant controls.</p>
    </header>

    <DataTable :columns="columns" :rows="tenantsStore.items" :loading="tenantsStore.loading" empty-message="No tenants found.">
      <template #rows>
        <tr v-for="tenant in tenantsStore.items" :key="tenant.id" class="border-t">
          <td class="px-4 py-3">{{ tenant.name }}</td>
          <td class="px-4 py-3">
            <span :class="tenantStatusClass(tenant.status)">{{ tenant.status }}</span>
          </td>
          <td class="px-4 py-3">{{ new Date(tenant.created_at).toLocaleDateString() }}</td>
          <td class="px-4 py-3">
            <button
              class="rounded border px-2 py-1 text-xs"
              @click="requestStatusChange(tenant.id, nextTenantAction(tenant.status))"
            >
              Set {{ nextTenantAction(tenant.status) }}
            </button>
          </td>
        </tr>
      </template>
    </DataTable>

    <PaginationControls
      :current-page="tenantsStore.pagination.current_page"
      :last-page="tenantsStore.pagination.last_page"
      @change="(page) => tenantsStore.fetchTenants(page, tenantsStore.pagination.per_page)"
    />

    <div v-if="askConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
        <h4 class="text-sm font-semibold">Confirm status update</h4>
        <p class="mt-2 text-sm text-slate-600">Are you sure you want to change this tenant status?</p>
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded border px-3 py-1.5 text-sm" @click="askConfirm = null">Cancel</button>
          <button class="btn-primary rounded px-3 py-1.5 text-sm" @click="confirmStatusChange">Confirm</button>
        </div>
      </div>
    </div>
  </section>
</template>
