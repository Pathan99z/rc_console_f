<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from '@/shared/utils/useToast'
import { payoutApi } from '@/modules/payouts/services/payout.api'
import { usePayoutStore } from '@/modules/payouts/store/payout.store'

const store = usePayoutStore()
const toast = useToast()
const payoutId = ref('')
const description = ref('')
const resolveId = ref(0)
const resolution = ref('')

onMounted(() => void store.fetchDisputes())

async function create() {
  try {
    await payoutApi.createDispute({ payout_id: Number(payoutId.value), description: description.value })
    toast.success('Dispute raised.')
    payoutId.value = ''
    description.value = ''
    await store.fetchDisputes()
  } catch {
    toast.error('Failed to raise dispute.')
  }
}

async function resolve(id: number, action: 'resolve' | 'reject') {
  try {
    if (action === 'resolve') await payoutApi.resolveDispute(id, { resolution: resolution.value })
    else await payoutApi.rejectDispute(id, { resolution: resolution.value })
    toast.success('Dispute updated.')
    await store.fetchDisputes()
  } catch {
    toast.error('Action failed.')
  }
}
</script>

<template>
  <section class="space-y-5">
    <header><h2 class="text-xl font-bold">Payout disputes</h2></header>
    <form class="flex flex-wrap gap-2 rounded-xl border bg-white p-4" @submit.prevent="create">
      <input v-model="payoutId" class="rc-input w-28" placeholder="Payout ID" type="number" required />
      <input v-model="description" class="rc-input min-w-[200px] flex-1" placeholder="Description" required />
      <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">Raise dispute</button>
    </form>
    <ul class="space-y-2">
      <li v-for="d in store.disputes" :key="d.id" class="rounded-xl border bg-white p-4 text-sm">
        <p class="font-medium">Payout #{{ d.payout_id }} — {{ d.status }}</p>
        <p class="text-slate-600">{{ d.description }}</p>
        <div class="mt-2 flex gap-2">
          <input v-model="resolution" class="rc-input flex-1" placeholder="Resolution text" />
          <button type="button" class="rounded border px-2 py-1 text-xs" @click="resolve(d.id, 'resolve')">Resolve</button>
          <button type="button" class="rounded border px-2 py-1 text-xs text-rose-700" @click="resolve(d.id, 'reject')">Reject</button>
        </div>
      </li>
    </ul>
  </section>
</template>
