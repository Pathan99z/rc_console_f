<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/shared/utils/useToast'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'
import { usePrmStore } from '@/modules/prm/store/prm.store'
import { usePayoutStore } from '@/modules/payouts/store/payout.store'
import {
  accrualAmountLabel,
  accrualCanSelectForPayout,
  accrualPayoutLabel,
  accrualSummaryLabel,
} from '@/modules/prm/utils/commissionDisplay'
import type { CommissionAccrualItem } from '@/modules/prm/types/prm.types'

const router = useRouter()
const prmStore = usePrmStore()
const payoutStore = usePayoutStore()
const toast = useToast()

const step = ref(1)
const selectedIds = ref<number[]>([])
const orgId = ref('')
const periodFrom = ref('')
const periodTo = ref('')
const taxAmount = ref(0)
const generating = ref(false)
const orgOptions = ref<OrganizationItem[]>([])

function orgLabel(o: OrganizationItem) {
  return (o.display_name || o.legal_name || '').trim() || `Organization #${o.id}`
}

const selectableAccruals = computed(() =>
  prmStore.accruals.filter((a: CommissionAccrualItem) => accrualCanSelectForPayout(a)),
)

const blockedApprovedAccruals = computed(() =>
  prmStore.accruals.filter(
    (a: CommissionAccrualItem) => String(a.status) === 'approved' && !accrualCanSelectForPayout(a),
  ),
)

const selectedSummaries = computed(() =>
  prmStore.accruals.filter((a) => selectedIds.value.includes(a.id)).map((a) => accrualSummaryLabel(a)),
)

const selectedOrgLabel = computed(() => {
  if (!orgId.value) return 'Auto-group by org'
  const o = orgOptions.value.find((x) => String(x.id) === orgId.value)
  return o ? orgLabel(o) : `Org #${orgId.value}`
})

onMounted(async () => {
  try {
    await Promise.all([prmStore.fetchCommissionAccruals(1, 50), fetchOrgOptions()])
  } catch {
    toast.error('Failed to load approved accruals.')
  }
})

async function fetchOrgOptions() {
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
  }
}

function toggleAccrual(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

async function generate() {
  generating.value = true
  try {
    const payouts = await payoutStore.generatePayouts({
      beneficiary_organization_id: orgId.value ? Number(orgId.value) : undefined,
      accrual_ids: selectedIds.value.length ? selectedIds.value : undefined,
      period_from: periodFrom.value || undefined,
      period_to: periodTo.value || undefined,
      tax_amount: taxAmount.value || undefined,
    })
    toast.success(payoutStore.message || `Created ${payouts.length} payout(s).`)
    if (payouts[0]) router.push(`/app/prm/payouts/${payouts[0].id}`)
    else router.push('/app/prm/payouts')
  } catch {
    toast.error(payoutStore.message || 'Generate failed.')
  } finally {
    generating.value = false
  }
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <button type="button" class="mb-2 text-xs text-indigo-600" @click="router.push('/app/prm/payouts')">← Back</button>
      <h2 class="text-xl font-bold text-slate-900">Generate payout</h2>
      <p class="text-sm text-slate-500">Select approved commission accruals not already linked to a payout.</p>
    </header>

    <div class="flex gap-2 text-xs font-semibold text-slate-500">
      <span :class="step >= 1 ? 'text-indigo-600' : ''">1. Accruals</span>
      <span>→</span>
      <span :class="step >= 2 ? 'text-indigo-600' : ''">2. Options</span>
      <span>→</span>
      <span :class="step >= 3 ? 'text-indigo-600' : ''">3. Review</span>
    </div>

    <div v-if="step === 1" class="rounded-xl border bg-white p-4">
      <p class="mb-3 text-sm text-slate-600">Available for payout (select one or more):</p>
      <ul class="max-h-64 space-y-2 overflow-y-auto text-sm">
        <li v-for="a in selectableAccruals" :key="a.id" class="flex items-start gap-2 rounded border px-3 py-2">
          <input type="checkbox" class="mt-1" :checked="selectedIds.includes(a.id)" @change="toggleAccrual(a.id)" />
          <div>
            <p class="font-medium text-slate-900">{{ accrualSummaryLabel(a) }}</p>
            <p class="text-xs text-slate-500">{{ accrualAmountLabel(a) }}</p>
          </div>
        </li>
        <li v-if="!selectableAccruals.length" class="text-slate-500">No approved accruals available for a new payout.</li>
      </ul>
      <div v-if="blockedApprovedAccruals.length" class="mt-4 border-t pt-3">
        <p class="mb-2 text-xs font-semibold uppercase text-slate-500">Already in a payout</p>
        <ul class="space-y-1 text-xs text-slate-500">
          <li v-for="a in blockedApprovedAccruals" :key="`blocked-${a.id}`">
            {{ accrualSummaryLabel(a) }} — {{ accrualPayoutLabel(a) }}
          </li>
        </ul>
      </div>
      <button type="button" class="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white" :disabled="!selectableAccruals.length" @click="step = 2">
        Next
      </button>
    </div>

    <div v-else-if="step === 2" class="space-y-4 rounded-xl border bg-white p-4">
      <label class="block text-sm">
        Beneficiary organization (optional)
        <select v-model="orgId" class="rc-input mt-1 w-full">
          <option value="">Auto-group by org</option>
          <option v-for="o in orgOptions" :key="o.id" :value="String(o.id)">{{ orgLabel(o) }} ({{ o.type }})</option>
        </select>
      </label>
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="block text-sm">Period from <input v-model="periodFrom" type="date" class="rc-input mt-1 w-full" /></label>
        <label class="block text-sm">Period to <input v-model="periodTo" type="date" class="rc-input mt-1 w-full" /></label>
      </div>
      <label class="block text-sm">
        Tax amount
        <input v-model.number="taxAmount" type="number" min="0" step="0.01" class="rc-input mt-1 w-full" />
      </label>
      <div class="flex gap-2">
        <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="step = 1">Back</button>
        <button type="button" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white" @click="step = 3">Next</button>
      </div>
    </div>

    <div v-else class="rounded-xl border bg-white p-4">
      <p class="text-sm font-medium text-slate-900">Selected accruals ({{ selectedIds.length }})</p>
      <ul v-if="selectedSummaries.length" class="mt-2 list-inside list-disc text-sm text-slate-600">
        <li v-for="(line, i) in selectedSummaries" :key="i">{{ line }}</li>
      </ul>
      <p v-else class="mt-2 text-sm text-slate-500">None selected — server will use all eligible accruals.</p>
      <p class="mt-2 text-sm text-slate-600">Organization: {{ selectedOrgLabel }}</p>
      <p class="text-sm text-slate-600">Tax: {{ taxAmount || 0 }}</p>
      <div class="mt-4 flex gap-2">
        <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="step = 2">Back</button>
        <button type="button" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white" :disabled="generating" @click="generate">
          {{ generating ? 'Creating…' : 'Create payout(s)' }}
        </button>
      </div>
    </div>
  </section>
</template>
