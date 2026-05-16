<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/shared/utils/useToast'
import MarkPaidModal from '@/modules/payouts/components/MarkPaidModal.vue'
import PayoutStatusBadge from '@/modules/payouts/components/PayoutStatusBadge.vue'
import PayoutWorkflowModal from '@/modules/payouts/components/PayoutWorkflowModal.vue'
import { usePayoutAccess } from '@/modules/payouts/composables/usePayoutAccess'
import { payoutApi } from '@/modules/payouts/services/payout.api'
import { usePayoutStore } from '@/modules/payouts/store/payout.store'
import { downloadBlobResponse, fmtPayoutAmount } from '@/modules/payouts/utils/payoutFormat'
import type { MarkPaidPayload } from '@/modules/payouts/types/payout.types'

const route = useRoute()
const router = useRouter()
const store = usePayoutStore()
const toast = useToast()
const { canManagePayouts } = usePayoutAccess()

const payoutId = computed(() => Number(route.params.id))
const showMarkPaid = ref(false)
const workflowModal = ref<{ open: boolean; action: string; title: string }>({ open: false, action: '', title: '' })

onMounted(async () => {
  try {
    await store.fetchPayout(payoutId.value)
  } catch {
    toast.error(store.message || 'Failed to load payout.')
  }
})

const p = computed(() => store.currentPayout)

async function workflow(action: string, payload?: Record<string, string>) {
  try {
    await store.runWorkflow(payoutId.value, action, payload)
    toast.success(store.message || 'Updated.')
  } catch {
    toast.error(store.message || 'Action failed.')
  }
}

async function onMarkPaid(payload: MarkPaidPayload) {
  try {
    await store.markPaid(payoutId.value, payload)
    toast.success('Payout marked paid.')
  } catch {
    toast.error(store.message || 'Mark paid failed.')
  }
}

async function downloadProof() {
  try {
    const res = await payoutApi.downloadProof(payoutId.value)
    downloadBlobResponse(res, `payout-${payoutId.value}-proof`)
  } catch {
    toast.error('Could not download proof.')
  }
}

async function viewStatement() {
  try {
    await store.fetchStatement(payoutId.value)
    toast.success('Statement loaded — see line items below.')
  } catch {
    toast.error(store.message || 'Statement failed.')
  }
}

function openWorkflow(action: string, title: string) {
  workflowModal.value = { open: true, action, title }
}

async function onWorkflowSubmit(payload: Record<string, string>) {
  workflowModal.value.open = false
  await workflow(workflowModal.value.action, payload)
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <button type="button" class="mb-2 text-xs text-indigo-600" @click="router.push('/app/prm/payouts')">← Back to payouts</button>
        <h2 v-if="p" class="text-xl font-bold text-slate-900">{{ p.payout_number }}</h2>
        <PayoutStatusBadge v-if="p" :status="p.status" />
      </div>
      <div v-if="canManagePayouts && p" class="flex flex-wrap gap-2">
        <button v-if="p.status === 'draft'" type="button" class="rounded border px-2 py-1 text-xs" @click="workflow('submit')">Submit</button>
        <button v-if="p.status === 'submitted'" type="button" class="rounded border px-2 py-1 text-xs" @click="workflow('approve')">Approve</button>
        <button v-if="p.status === 'submitted'" type="button" class="rounded border px-2 py-1 text-xs" @click="openWorkflow('reject', 'Reject payout')">Reject</button>
        <button v-if="p.status === 'approved'" type="button" class="rounded border px-2 py-1 text-xs" @click="workflow('process')">Process</button>
        <button v-if="p.status === 'processing'" type="button" class="rounded bg-indigo-600 px-2 py-1 text-xs text-white" @click="showMarkPaid = true">Mark paid</button>
        <button v-if="p.status === 'processing'" type="button" class="rounded border px-2 py-1 text-xs text-rose-700" @click="openWorkflow('fail', 'Mark failed')">Fail</button>
        <button v-if="p.status === 'paid'" type="button" class="rounded border px-2 py-1 text-xs" @click="openWorkflow('reverse', 'Reverse payout')">Reverse</button>
        <button type="button" class="rounded border px-2 py-1 text-xs" @click="viewStatement">Statement</button>
        <button v-if="p.has_payment_proof" type="button" class="rounded border px-2 py-1 text-xs" @click="downloadProof">Download proof</button>
      </div>
    </header>

    <div v-if="store.detailLoading" class="py-12 text-center text-slate-500">Loading…</div>
    <template v-else-if="p">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl border bg-white p-4">
          <p class="text-xs text-slate-500">Gross</p>
          <p class="text-lg font-semibold">{{ fmtPayoutAmount(p.gross_amount, p.currency_code) }}</p>
        </div>
        <div class="rounded-xl border bg-white p-4">
          <p class="text-xs text-slate-500">Net</p>
          <p class="text-lg font-semibold">{{ fmtPayoutAmount(p.net_amount, p.currency_code) }}</p>
        </div>
        <div class="rounded-xl border bg-white p-4">
          <p class="text-xs text-slate-500">Tax</p>
          <p class="text-lg font-semibold">{{ fmtPayoutAmount(p.tax_amount, p.currency_code) }}</p>
        </div>
        <div class="rounded-xl border bg-white p-4">
          <p class="text-xs text-slate-500">Beneficiary org</p>
          <p class="text-lg font-semibold">#{{ p.beneficiary_organization_id }}</p>
        </div>
      </div>

      <div class="rounded-xl border bg-white p-4">
        <h3 class="mb-3 font-semibold text-slate-900">Commission line items</h3>
        <table v-if="p.line_items?.length" class="min-w-full text-sm">
          <thead class="text-xs uppercase text-slate-500">
            <tr>
              <th class="py-2 text-left">Accrual</th>
              <th class="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="li in p.line_items" :key="li.id" class="border-t">
              <td class="py-2">#{{ li.commission_accrual_id }}</td>
              <td class="py-2 text-right tabular-nums">{{ fmtPayoutAmount(li.amount, p.currency_code) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-sm text-slate-500">No line items.</p>
      </div>

      <div v-if="store.statement" class="rounded-xl border bg-white p-4">
        <h3 class="mb-2 font-semibold">Statement snapshot</h3>
        <p class="text-sm text-slate-600">Beneficiary: {{ store.statement.beneficiary?.display_name }}</p>
      </div>
    </template>

    <MarkPaidModal v-model:open="showMarkPaid" @submit="onMarkPaid" />
    <PayoutWorkflowModal
      :open="workflowModal.open"
      :title="workflowModal.title"
      :require-failure-reason="workflowModal.action === 'fail'"
      :require-reason="workflowModal.action === 'reverse'"
      :show-reference="workflowModal.action === 'reverse'"
      @close="workflowModal.open = false"
      @submit="onWorkflowSubmit"
    />
  </section>
</template>
