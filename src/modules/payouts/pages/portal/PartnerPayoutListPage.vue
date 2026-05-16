<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import PayoutStatusBadge from '@/modules/payouts/components/PayoutStatusBadge.vue'
import { usePayoutStore } from '@/modules/payouts/store/payout.store'
import { fmtPayoutAmount } from '@/modules/payouts/utils/payoutFormat'
import { useToast } from '@/shared/utils/useToast'

const store = usePayoutStore()
const router = useRouter()
const toast = useToast()

onMounted(async () => {
  try {
    await store.fetchPartnerPayouts()
    await store.fetchPortalStatements('partner')
  } catch {
    toast.error(store.message || 'Failed to load payouts.')
  }
})

async function onPage(p: number) {
  await store.fetchPartnerPayouts(p)
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Partner payouts</h2>
      <p class="text-sm text-slate-500">Your organization and child reseller payouts (read-only).</p>
    </header>
    <div v-if="store.portalStatements.length" class="rounded-xl border bg-white p-4">
      <h3 class="mb-2 text-sm font-semibold">Recent statements</h3>
      <ul class="text-sm text-slate-600">
        <li v-for="s in store.portalStatements" :key="s.payout_id">{{ s.payout_number }} — {{ fmtPayoutAmount(s.net_amount) }}</li>
      </ul>
    </div>
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
          <td class="px-4 py-3 text-right tabular-nums">{{ fmtPayoutAmount(p.net_amount, p.currency_code) }}</td>
          <td class="px-4 py-3 text-right">
            <button type="button" class="text-xs font-semibold text-indigo-600" @click="router.push(`/app/prm/partner-payouts/${p.id}`)">View</button>
          </td>
        </tr>
      </tbody>
    </table>
    <PaginationControls :current-page="store.portalPagination.current_page" :last-page="store.portalPagination.last_page" @change="onPage" />
  </section>
</template>
