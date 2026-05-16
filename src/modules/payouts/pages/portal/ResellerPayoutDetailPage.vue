<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PayoutStatusBadge from '@/modules/payouts/components/PayoutStatusBadge.vue'
import { usePayoutStore } from '@/modules/payouts/store/payout.store'
import { fmtPayoutAmount } from '@/modules/payouts/utils/payoutFormat'

const route = useRoute()
const router = useRouter()
const store = usePayoutStore()
const id = computed(() => Number(route.params.id))
const p = computed(() => store.currentPayout)

onMounted(() => store.fetchPortalPayout(id.value, 'reseller'))
</script>

<template>
  <section class="space-y-4">
    <button type="button" class="text-xs text-indigo-600" @click="router.push('/app/prm/reseller-payouts')">← Back</button>
    <div v-if="p" class="rounded-xl border bg-white p-4">
      <h2 class="text-lg font-bold">{{ p.payout_number }}</h2>
      <PayoutStatusBadge :status="p.status" />
      <p class="mt-2 text-lg font-semibold">{{ fmtPayoutAmount(p.net_amount, p.currency_code) }}</p>
    </div>
  </section>
</template>
