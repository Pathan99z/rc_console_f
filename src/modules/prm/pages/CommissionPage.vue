<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { usePrmStore } from '@/modules/prm/store/prm.store'
import type { CommissionAccrualItem } from '@/modules/prm/types/prm.types'

const prmStore = usePrmStore()
const toast = useToast()
const { isGlobalAdmin, isCompanyAdmin } = useAuth()
const statusFilter = ref('')

const canUpdateStatus = computed(() => isGlobalAdmin.value || isCompanyAdmin.value)

const visibleAccruals = computed(() => {
  const f = statusFilter.value
  if (!f) return prmStore.accruals
  return prmStore.accruals.filter((a) => String(a.status) === f)
})

onMounted(async () => {
  try {
    await prmStore.fetchCommissionAccruals(1, 15)
  } catch {
    toast.error(prmStore.message || 'Failed to load accruals.')
  }
})

async function setStatus(row: CommissionAccrualItem, status: string) {
  try {
    await prmStore.updateCommissionAccrualStatus(row.id, status)
    toast.success(prmStore.message || 'Status updated.')
  } catch {
    toast.error(prmStore.message || 'Update failed.')
  }
}

function statusClass(status: string) {
  if (status === 'pending') return 'bg-amber-50 text-amber-800'
  if (status === 'approved') return 'bg-sky-50 text-sky-800'
  if (status === 'paid') return 'bg-emerald-50 text-emerald-800'
  if (status === 'void') return 'bg-slate-100 text-slate-600'
  return 'bg-slate-50 text-slate-700'
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Commission accruals</h2>
      <p class="text-sm text-slate-500">Payment-linked commissions. Finance actions require company or global admin.</p>
    </header>

    <div class="flex flex-wrap gap-3 rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <label class="flex items-center gap-2 text-sm text-slate-700">
        <span>Status</span>
        <select v-model="statusFilter" class="rc-input w-40">
          <option value="">All (current page)</option>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="paid">paid</option>
          <option value="void">void</option>
        </select>
      </label>
    </div>

    <div class="overflow-x-auto rounded-xl border border-[var(--rc-border-soft)] bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-3 text-left">ID</th>
            <th class="px-4 py-3 text-left">Amount</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Quote</th>
            <th v-if="canUpdateStatus" class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="prmStore.accrualsLoading">
            <td :colspan="canUpdateStatus ? 5 : 4" class="px-4 py-8 text-center text-slate-500">Loading…</td>
          </tr>
          <tr v-else-if="!visibleAccruals.length">
            <td :colspan="canUpdateStatus ? 5 : 4" class="px-4 py-8 text-center text-slate-500">No accruals on this page.</td>
          </tr>
          <tr v-for="row in visibleAccruals" v-else :key="row.id" class="border-t border-[var(--rc-border-soft)]">
            <td class="px-4 py-3 font-mono text-xs">{{ row.id }}</td>
            <td class="px-4 py-3">{{ row.amount ?? '—' }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusClass(String(row.status))">{{ row.status }}</span>
            </td>
            <td class="px-4 py-3">{{ row.quote_id ?? '—' }}</td>
            <td v-if="canUpdateStatus" class="px-4 py-3 text-right">
              <button
                v-if="row.status === 'pending'"
                type="button"
                class="mr-1 rounded border px-2 py-1 text-xs"
                @click="setStatus(row, 'approved')"
              >
                Approve
              </button>
              <button
                v-if="row.status === 'approved'"
                type="button"
                class="mr-1 rounded border px-2 py-1 text-xs"
                @click="setStatus(row, 'paid')"
              >
                Mark paid
              </button>
              <button v-if="row.status !== 'void'" type="button" class="rounded border px-2 py-1 text-xs text-red-700" @click="setStatus(row, 'void')">
                Void
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationControls
      :current-page="prmStore.accrualsPagination.current_page"
      :last-page="prmStore.accrualsPagination.last_page"
      @change="(p) => prmStore.fetchCommissionAccruals(p, prmStore.accrualsPagination.per_page)"
    />
  </section>
</template>
