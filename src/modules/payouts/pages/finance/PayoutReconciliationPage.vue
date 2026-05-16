<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardKpiCard from '@/modules/dashboard/components/DashboardKpiCard.vue'
import { fmtCurrency } from '@/modules/dashboard/utils/dashboardFormat'
import { usePayoutStore } from '@/modules/payouts/store/payout.store'
import { useToast } from '@/shared/utils/useToast'

const router = useRouter()
const store = usePayoutStore()
const toast = useToast()
const from = ref('')
const to = ref('')

onMounted(() => {
  const today = new Date()
  to.value = today.toISOString().slice(0, 10)
  const start = new Date(today)
  start.setDate(start.getDate() - 30)
  from.value = start.toISOString().slice(0, 10)
  void load()
})

async function load() {
  try {
    await store.fetchReconciliation({ from: from.value, to: to.value })
  } catch {
    toast.error(store.message || 'Failed to load reconciliation.')
  }
}

const r = () => store.reconciliation
</script>

<template>
  <section class="space-y-5">
    <header>
      <button type="button" class="mb-2 text-xs text-indigo-600" @click="router.push('/app/prm/payouts')">← Back</button>
      <h2 class="text-xl font-bold text-slate-900">Payout reconciliation</h2>
    </header>
    <div class="flex flex-wrap gap-3 rounded-xl border bg-white p-4">
      <label class="text-sm">From <input v-model="from" type="date" class="rc-input ml-2" /></label>
      <label class="text-sm">To <input v-model="to" type="date" class="rc-input ml-2" /></label>
      <button type="button" class="rounded-lg border px-3 py-2 text-xs font-semibold" @click="load">Apply</button>
    </div>
    <div v-if="store.loading" class="py-12 text-center text-slate-500">Loading…</div>
    <div v-else-if="r()" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <DashboardKpiCard label="Customer cash in" :value="fmtCurrency(r()!.customer_cash_in)" tone="indigo" />
      <DashboardKpiCard label="Commission accrued" :value="fmtCurrency(r()!.commission_accrued)" />
      <DashboardKpiCard label="Approved liability" :value="fmtCurrency(r()!.commission_liability_approved)" tone="amber" />
      <DashboardKpiCard label="Payouts paid out" :value="fmtCurrency(r()!.payouts_paid_out)" tone="emerald" />
      <DashboardKpiCard label="Variance (cash − accrued)" :value="fmtCurrency(r()!.variance_cash_minus_accrued)" />
      <DashboardKpiCard label="Variance (accrued − paid)" :value="fmtCurrency(r()!.variance_accrued_minus_paid)" tone="rose" />
    </div>
  </section>
</template>
