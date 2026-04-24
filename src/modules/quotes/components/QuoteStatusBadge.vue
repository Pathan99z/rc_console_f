<script setup lang="ts">
import type { QuoteStatus } from '@/modules/quotes/types/quote.types'

defineProps<{ status: QuoteStatus | string }>()

function badgeClass(status: string) {
  if (status === 'accepted') return 'bg-emerald-50 text-emerald-700'
  if (status === 'rejected') return 'bg-rose-50 text-rose-700'
  if (status === 'sent') return 'bg-blue-50 text-blue-700'
  return 'bg-slate-100 text-slate-700'
}
</script>

<template>
  <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="badgeClass(String(status))">
    {{ status }}
  </span>
</template>
