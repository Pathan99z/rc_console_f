<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import PayoutStatusBadge from '@/modules/payouts/components/PayoutStatusBadge.vue'
import { usePayoutStore } from '@/modules/payouts/store/payout.store'
import { fmtPayoutAmount } from '@/modules/payouts/utils/payoutFormat'

const store = usePayoutStore()
const router = useRouter()

onMounted(async () => {
  await store.fetchResellerPayouts()
  await store.fetchPortalStatements('reseller')
})
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold">Reseller payouts</h2>
      <p class="text-sm text-slate-500">Your organization payouts only.</p>
    </header>
    <table class="min-w-full rounded-xl border bg-white text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500">
        <tr>
          <th class="px-4 py-3 text-left">Payout #</th>
          <th class="px-4 py-3 text-left">Status</th>
          <th class="px-4 py-3 text-right">Net</th>
          <th class="px-4 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in store.portalPayouts" :key="p.id" class="border-t">
          <td class="px-4 py-3 font-mono text-xs">{{ p.payout_number }}</td>
          <td class="px-4 py-3"><PayoutStatusBadge :status="p.status" /></td>
          <td class="px-4 py-3 text-right">{{ fmtPayoutAmount(p.net_amount, p.currency_code) }}</td>
          <td class="px-4 py-3 text-right">
            <button type="button" class="text-xs text-indigo-600" @click="router.push(`/app/prm/reseller-payouts/${p.id}`)">View</button>
          </td>
        </tr>
      </tbody>
    </table>
    <PaginationControls
      :current-page="store.portalPagination.current_page"
      :last-page="store.portalPagination.last_page"
      @change="(p) => store.fetchResellerPayouts(p)"
    />
  </section>
</template>
