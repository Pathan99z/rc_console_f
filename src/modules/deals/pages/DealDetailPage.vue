<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDealsStore } from '@/modules/deals/store/deals.store'
import type { DealItem, DealStatusCode, DealStatusLabel } from '@/modules/deals/services/deals.api'
import { useToast } from '@/shared/utils/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const dealsStore = useDealsStore()

const dealId = computed(() => Number(route.params.id || 0))
const deal = computed(() => dealsStore.selected)

function normalizeStatusCode(status: DealItem['status']): DealStatusCode {
  if (status === 1 || status === 'won') return 1
  if (status === 2 || status === 'lost') return 2
  return 0
}

function toStatusLabel(status: DealItem['status']): DealStatusLabel {
  const code = normalizeStatusCode(status)
  if (code === 1) return 'won'
  if (code === 2) return 'lost'
  return 'open'
}

function statusBadgeClass(status: DealItem['status']) {
  const code = normalizeStatusCode(status)
  if (code === 1) return 'bg-emerald-50 text-emerald-700'
  if (code === 2) return 'bg-rose-50 text-rose-700'
  return 'bg-slate-100 text-slate-700'
}

function dealDisplayValue(item: DealItem): string {
  const normalized =
    item.value ??
    (item as DealItem & { estimated_value?: number | string | null }).estimated_value ??
    ((item.company as { revenue?: number | string | null } | null | undefined)?.revenue ?? null)
  if (normalized === null || normalized === undefined || normalized === '') return '-'
  const currency = item.currency_code ? `${String(item.currency_code).toUpperCase()} ` : ''
  return `${currency}${String(normalized)}`
}

function dealDisplayProbability(item: DealItem): string {
  return item.probability === null || item.probability === undefined ? '-' : `${item.probability}%`
}

async function loadDeal() {
  if (!dealId.value) {
    toast.error('Invalid deal id.')
    void router.push('/app/deals')
    return
  }
  try {
    await dealsStore.fetchDealDetail(dealId.value)
  } catch {
    toast.error(dealsStore.message || 'Unable to load deal details.')
    void router.push('/app/deals')
  }
}

async function updateDealStatus(status: DealStatusLabel) {
  if (!deal.value) return
  try {
    await dealsStore.updateDealStatus(deal.value.id, status)
    toast.success('Deal status updated.')
  } catch {
    toast.error(dealsStore.message || 'Unable to update status.')
  }
}

onMounted(loadDeal)
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Deal Details</h2>
        <p class="text-sm text-slate-500">Review the deal with status and history insights.</p>
      </div>
      <div class="flex gap-2">
        <button class="rounded border px-3 py-1.5 text-sm" @click="$router.push('/app/deals')">Back to Deals</button>
      </div>
    </header>

    <div v-if="dealsStore.loading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      Loading deal...
    </div>

    <div v-else-if="!deal" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      Deal not found.
    </div>

    <div v-else class="space-y-4">
      <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5">
        <div class="mb-3 flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">{{ deal.name }}</h3>
            <p class="text-sm text-slate-500">Pipeline: {{ deal.pipeline?.name || '-' }}</p>
          </div>
          <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusBadgeClass(deal.status)">{{ toStatusLabel(deal.status) }}</span>
        </div>

        <div class="grid gap-3 text-sm md:grid-cols-2">
          <p><span class="font-semibold text-slate-700">Contact:</span> {{ deal.contact ? `${deal.contact.first_name} ${deal.contact.last_name}` : '-' }}</p>
          <p><span class="font-semibold text-slate-700">Company:</span> {{ deal.company?.name || '-' }}</p>
          <p><span class="font-semibold text-slate-700">Owner:</span> {{ deal.owner?.name || '-' }}</p>
          <p><span class="font-semibold text-slate-700">Stage:</span> {{ deal.stage?.name || '-' }}</p>
          <p><span class="font-semibold text-slate-700">Value:</span> {{ dealDisplayValue(deal) }}</p>
          <p><span class="font-semibold text-slate-700">Probability:</span> {{ dealDisplayProbability(deal) }}</p>
          <p><span class="font-semibold text-slate-700">Expected Close:</span> {{ deal.expected_close_date || '-' }}</p>
        </div>
      </div>

      <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5">
        <h4 class="text-sm font-semibold text-slate-900">Quick Actions</h4>
        <div class="mt-3 flex flex-wrap gap-2">
          <button class="rounded border px-3 py-1.5 text-sm" :disabled="toStatusLabel(deal.status) === 'open'" @click="updateDealStatus('open')">Mark Open</button>
          <button class="rounded border px-3 py-1.5 text-sm text-emerald-700" :disabled="toStatusLabel(deal.status) === 'won'" @click="updateDealStatus('won')">Mark Won</button>
          <button class="rounded border px-3 py-1.5 text-sm text-rose-700" :disabled="toStatusLabel(deal.status) === 'lost'" @click="updateDealStatus('lost')">Mark Lost</button>
        </div>
      </div>

      <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5">
        <h4 class="text-sm font-semibold text-slate-900">History Timeline</h4>
        <div class="mt-3 space-y-2">
          <div v-for="history in deal.histories || []" :key="history.id" class="rounded-lg border border-slate-200 p-2 text-xs text-slate-600">
            <p class="font-semibold text-slate-800">{{ history.event_type }}</p>
            <p>{{ history.message || '-' }}</p>
            <p class="text-slate-500">{{ new Date(history.created_at).toLocaleString() }}</p>
          </div>
          <p v-if="!deal.histories || deal.histories.length === 0" class="text-xs text-slate-500">No history available.</p>
        </div>
      </div>
    </div>
  </section>
</template>
