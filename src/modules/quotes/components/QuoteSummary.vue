<script setup lang="ts">
const props = defineProps<{
  subtotal: number
  taxTotal: number
  discountTotal: number
  finalTotal: number
  currencyCode?: string
  calculating?: boolean
}>()

const format = (value: number) => `${props.currencyCode || ''} ${value.toFixed(2)}`.trim()
</script>

<template>
  <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 text-sm">
    <h4 class="mb-3 font-semibold text-slate-900">Quote Summary</h4>
    <div class="space-y-1 text-slate-700">
      <p class="flex justify-between"><span>Subtotal</span><span>{{ format(subtotal) }}</span></p>
      <p class="flex justify-between"><span>Tax Total</span><span>{{ format(taxTotal) }}</span></p>
      <p class="flex justify-between"><span>Discount</span><span>- {{ format(discountTotal) }}</span></p>
      <p class="flex justify-between border-t pt-2 font-semibold text-slate-900"><span>Total</span><span>{{ format(finalTotal) }}</span></p>
    </div>
    <div v-if="calculating" class="mt-3 flex items-center gap-2 text-xs text-slate-500">
      <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500"></span>
      <span>Calculating prices...</span>
    </div>
  </div>
</template>
