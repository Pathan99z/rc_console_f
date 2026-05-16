<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  labels: string[]
  values: number[]
  valueFormatter?: (n: number) => string
}>()

const max = computed(() => Math.max(...props.values.filter((v) => Number.isFinite(v)), 1))

function barHeight(v: number) {
  return `${Math.max(4, Math.round((v / max.value) * 100))}%`
}
</script>

<template>
  <div class="flex h-48 items-end gap-2 border-b border-slate-100 pb-1" role="img" :aria-label="`Bar chart with ${labels.length} items`">
      <div v-for="(label, i) in labels" :key="`${label}-${i}`" class="flex min-w-0 flex-1 flex-col items-center gap-1">
      <div class="flex h-40 w-full items-end justify-center">
        <div
          class="w-full max-w-[2.5rem] rounded-t-md bg-indigo-500/90"
          :style="{ height: barHeight(values[i] ?? 0) }"
          :title="valueFormatter ? valueFormatter(values[i] ?? 0) : String(values[i] ?? 0)"
        />
      </div>
      <span class="max-w-full truncate text-center text-[10px] text-slate-500">{{ label }}</span>
    </div>
  </div>
</template>
