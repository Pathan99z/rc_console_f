<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from '@/shared/utils/useToast'
import { payoutApi } from '@/modules/payouts/services/payout.api'
import { usePayoutStore } from '@/modules/payouts/store/payout.store'
import { fmtPayoutAmount } from '@/modules/payouts/utils/payoutFormat'

const store = usePayoutStore()
const toast = useToast()
const form = ref({ organization_id: '', payout_id: '', type: 'debit' as 'debit' | 'credit', amount: 0, currency_code: 'ZAR', reason: '' })

onMounted(() => void store.fetchAdjustments())

async function create() {
  try {
    await payoutApi.createAdjustment({
      organization_id: Number(form.value.organization_id),
      payout_id: form.value.payout_id ? Number(form.value.payout_id) : undefined,
      type: form.value.type,
      amount: form.value.amount,
      currency_code: form.value.currency_code,
      reason: form.value.reason,
    })
    toast.success('Adjustment created.')
    await store.fetchAdjustments()
  } catch {
    toast.error('Failed to create adjustment.')
  }
}
</script>

<template>
  <section class="space-y-5">
    <header><h2 class="text-xl font-bold">Payout adjustments</h2></header>
    <form class="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2" @submit.prevent="create">
      <input v-model="form.organization_id" class="rc-input" placeholder="Org ID *" required type="number" />
      <input v-model="form.payout_id" class="rc-input" placeholder="Payout ID (optional)" type="number" />
      <select v-model="form.type" class="rc-input"><option value="debit">Debit</option><option value="credit">Credit</option></select>
      <input v-model.number="form.amount" class="rc-input" placeholder="Amount" type="number" step="0.01" required />
      <input v-model="form.reason" class="rc-input sm:col-span-2" placeholder="Reason *" required />
      <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white sm:col-span-2">Create</button>
    </form>
    <table class="min-w-full rounded-xl border bg-white text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500">
        <tr><th class="px-4 py-2 text-left">ID</th><th class="px-4 py-2">Type</th><th class="px-4 py-2 text-right">Amount</th><th class="px-4 py-2 text-left">Reason</th></tr>
      </thead>
      <tbody>
        <tr v-for="a in store.adjustments" :key="a.id" class="border-t">
          <td class="px-4 py-2">#{{ a.id }}</td>
          <td class="px-4 py-2 capitalize">{{ a.type }}</td>
          <td class="px-4 py-2 text-right">{{ fmtPayoutAmount(a.amount, a.currency_code) }}</td>
          <td class="px-4 py-2">{{ a.reason }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
