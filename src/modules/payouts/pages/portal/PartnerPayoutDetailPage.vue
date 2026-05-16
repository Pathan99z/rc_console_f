<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PayoutStatusBadge from '@/modules/payouts/components/PayoutStatusBadge.vue'
import { payoutApi } from '@/modules/payouts/services/payout.api'
import { usePayoutStore } from '@/modules/payouts/store/payout.store'
import { downloadBlobResponse, fmtPayoutAmount } from '@/modules/payouts/utils/payoutFormat'
import { useToast } from '@/shared/utils/useToast'

const route = useRoute()
const router = useRouter()
const store = usePayoutStore()
const toast = useToast()
const id = computed(() => Number(route.params.id))
const p = computed(() => store.currentPayout)

onMounted(async () => {
  try {
    await store.fetchPortalPayout(id.value, 'partner')
  } catch {
    toast.error(store.message || 'Failed to load payout.')
  }
})

async function downloadProof() {
  if (!p.value?.payment_proof_url) return
  try {
    const res = await payoutApi.downloadProof(id.value)
    downloadBlobResponse(res, `payout-${id.value}-proof`)
  } catch {
    toast.error('Could not download proof.')
  }
}
</script>

<template>
  <section class="space-y-4">
    <button type="button" class="text-xs text-indigo-600" @click="router.push('/app/prm/partner-payouts')">← Back</button>
    <div v-if="p" class="rounded-xl border bg-white p-4">
      <h2 class="text-lg font-bold">{{ p.payout_number }}</h2>
      <PayoutStatusBadge :status="p.status" />
      <p class="mt-2 text-lg font-semibold">{{ fmtPayoutAmount(p.net_amount, p.currency_code) }}</p>
      <p v-if="p.paid_at" class="text-sm text-slate-500">Paid: {{ p.paid_at }}</p>
      <button v-if="p.has_payment_proof || p.payment_proof_url" type="button" class="mt-3 rounded border px-3 py-1 text-xs" @click="downloadProof">View payment proof</button>
    </div>
  </section>
</template>
