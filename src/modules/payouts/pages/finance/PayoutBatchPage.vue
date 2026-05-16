<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from '@/shared/utils/useToast'
import { payoutApi } from '@/modules/payouts/services/payout.api'
import { usePayoutStore } from '@/modules/payouts/store/payout.store'
import { fmtPayoutAmount } from '@/modules/payouts/utils/payoutFormat'

const store = usePayoutStore()
const toast = useToast()
const selected = ref<number[]>([])
const batchId = ref('')
const loading = ref(false)

onMounted(async () => {
  try {
    await store.fetchPayouts({ status: 'approved', per_page: 50 })
  } catch {
    toast.error('Failed to load approved payouts.')
  }
})

function toggle(id: number) {
  const i = selected.value.indexOf(id)
  if (i >= 0) selected.value.splice(i, 1)
  else selected.value.push(id)
}

async function createBatch() {
  if (!selected.value.length) return
  loading.value = true
  try {
    const { data } = await payoutApi.createBatch(selected.value)
    batchId.value = String(data.data.batch.id)
    toast.success(data.message)
  } catch {
    toast.error('Batch creation failed.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Payout batches</h2>
      <p class="text-sm text-slate-500">Select approved payouts to create a processing batch.</p>
    </header>
    <ul class="space-y-2 rounded-xl border bg-white p-4 text-sm">
      <li v-for="p in store.payouts" :key="p.id" class="flex items-center gap-2">
        <input type="checkbox" :checked="selected.includes(p.id)" @change="toggle(p.id)" />
        <span>{{ p.payout_number }} — {{ fmtPayoutAmount(p.net_amount, p.currency_code) }}</span>
      </li>
    </ul>
    <button type="button" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white" :disabled="loading" @click="createBatch">
      Create batch
    </button>
    <p v-if="batchId" class="text-sm text-emerald-700">Batch created: #{{ batchId }}</p>
  </section>
</template>
