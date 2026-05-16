<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import PayoutStatusBadge from '@/modules/payouts/components/PayoutStatusBadge.vue'
import { usePayoutAccess } from '@/modules/payouts/composables/usePayoutAccess'
import { usePayoutStore } from '@/modules/payouts/store/payout.store'
import { payoutApi } from '@/modules/payouts/services/payout.api'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'
import { downloadBlobResponse, fmtPayoutAmount, PAYOUT_STATUSES } from '@/modules/payouts/utils/payoutFormat'
import type { PayoutListParams } from '@/modules/payouts/types/payout.types'

const router = useRouter()
const store = usePayoutStore()
const toast = useToast()
const { canManagePayouts } = usePayoutAccess()

const statusFilter = ref('')
const orgFilter = ref('')
const search = ref('')
const page = ref(1)
const orgOptions = ref<OrganizationItem[]>([])
const orgsLoading = ref(false)

function orgLabel(o: OrganizationItem) {
  return (o.display_name || o.legal_name || '').trim() || `Organization #${o.id}`
}

const orgById = computed(() => {
  const map = new Map<number, OrganizationItem>()
  for (const o of orgOptions.value) map.set(o.id, o)
  return map
})

function beneficiaryLabel(orgId: number) {
  const o = orgById.value.get(orgId)
  return o ? orgLabel(o) : `#${orgId}`
}

async function fetchOrgOptions() {
  orgsLoading.value = true
  try {
    const [partnerRes, resellerRes] = await Promise.all([
      organizationsApi.list({ page: 1, per_page: 100, type: 'partner', status: 'active' }),
      organizationsApi.list({ page: 1, per_page: 100, type: 'reseller', status: 'active' }),
    ])
    const byId = new Map<number, OrganizationItem>()
    for (const o of partnerRes.data.data.items) byId.set(o.id, o)
    for (const o of resellerRes.data.data.items) byId.set(o.id, o)
    orgOptions.value = [...byId.values()].sort((a, b) => orgLabel(a).localeCompare(orgLabel(b)))
  } catch {
    orgOptions.value = []
  } finally {
    orgsLoading.value = false
  }
}

function buildParams(): PayoutListParams {
  const params: PayoutListParams = { page: page.value, per_page: 15 }
  if (statusFilter.value) params.status = statusFilter.value
  if (orgFilter.value) params.beneficiary_organization_id = Number(orgFilter.value)
  return params
}

async function load() {
  try {
    await store.fetchPayouts(buildParams())
  } catch {
    toast.error(store.message || 'Failed to load payouts.')
  }
}

onMounted(() => {
  void fetchOrgOptions()
  void load()
})

async function onPageChange(p: number) {
  page.value = p
  await load()
}

async function exportCsv() {
  try {
    const res = await payoutApi.exportCsv(buildParams())
    downloadBlobResponse(res, 'payouts-export.csv')
    toast.success('Export started.')
  } catch {
    toast.error('Export failed.')
  }
}

const filtered = () => {
  const q = search.value.trim().toLowerCase()
  if (!q) return store.payouts
  return store.payouts.filter((p) => {
    const org = beneficiaryLabel(p.beneficiary_organization_id).toLowerCase()
    return (
      p.payout_number?.toLowerCase().includes(q) ||
      org.includes(q) ||
      p.remittance_reference?.toLowerCase().includes(q) ||
      String(p.status).toLowerCase().includes(q)
    )
  })
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Payouts & settlement</h2>
        <p class="text-sm text-slate-500">Finance payout lifecycle — draft through paid.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="rounded-lg border px-3 py-2 text-xs font-semibold" @click="exportCsv">Export CSV</button>
        <RouterLink
          v-if="canManagePayouts"
          to="/app/prm/payouts/reconciliation"
          class="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Reconciliation
        </RouterLink>
        <RouterLink
          v-if="canManagePayouts"
          to="/app/prm/payouts/generate"
          class="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
        >
          Generate payout
        </RouterLink>
      </div>
    </header>

    <div class="flex flex-wrap gap-3 rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <input v-model="search" class="rc-input w-48" placeholder="Search payout # or org" />
      <select v-model="statusFilter" class="rc-input w-40" @change="page = 1; load()">
        <option value="">All statuses</option>
        <option v-for="s in PAYOUT_STATUSES" :key="s" :value="s">{{ s }}</option>
      </select>
      <label class="flex items-center gap-2 text-sm text-slate-700">
        <span class="shrink-0">Organization</span>
        <select v-model="orgFilter" class="rc-input min-w-[12rem]" :disabled="orgsLoading" @change="page = 1; load()">
          <option value="">All organizations</option>
          <option v-for="o in orgOptions" :key="o.id" :value="String(o.id)">{{ orgLabel(o) }} ({{ o.type }})</option>
        </select>
      </label>
      <button type="button" class="rounded-lg border px-3 py-2 text-xs font-semibold" @click="load">Apply</button>
    </div>

    <div class="overflow-x-auto rounded-xl border border-[var(--rc-border-soft)] bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-3 text-left">Payout #</th>
            <th class="px-4 py-3 text-left">Beneficiary org</th>
            <th class="px-4 py-3 text-right">Gross</th>
            <th class="px-4 py-3 text-right">Net</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Paid / UTR</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.loading">
            <td colspan="7" class="px-4 py-8 text-center text-slate-500">Loading…</td>
          </tr>
          <tr v-else-if="!filtered().length">
            <td colspan="7" class="px-4 py-8 text-center text-slate-500">No payouts found.</td>
          </tr>
          <tr v-for="row in filtered()" v-else :key="row.id" class="border-t border-[var(--rc-border-soft)]">
            <td class="px-4 py-3 font-mono text-xs">{{ row.payout_number }}</td>
            <td class="px-4 py-3">{{ beneficiaryLabel(row.beneficiary_organization_id) }}</td>
            <td class="px-4 py-3 text-right tabular-nums">{{ fmtPayoutAmount(row.gross_amount, row.currency_code) }}</td>
            <td class="px-4 py-3 text-right tabular-nums">{{ fmtPayoutAmount(row.net_amount, row.currency_code) }}</td>
            <td class="px-4 py-3"><PayoutStatusBadge :status="row.status" /></td>
            <td class="px-4 py-3 text-xs text-slate-500">
              <span v-if="row.paid_at">{{ row.paid_at }}</span>
              <span v-else>—</span>
              <span v-if="row.remittance_reference" class="mt-0.5 block text-slate-600">{{ row.remittance_reference }}</span>
            </td>
            <td class="px-4 py-3 text-right">
              <button type="button" class="text-xs font-semibold text-indigo-600" @click="router.push(`/app/prm/payouts/${row.id}`)">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationControls
      :current-page="store.pagination.current_page"
      :last-page="store.pagination.last_page"
      @change="onPageChange"
    />
  </section>
</template>
