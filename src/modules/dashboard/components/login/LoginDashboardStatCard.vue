<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string | number
  tone?: 'default' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky'
  accentIndex?: number
  clickable?: boolean
}>()

const accentClass = computed(() => {
  const palette = [
    'from-violet-50 to-white border-violet-100/80',
    'from-sky-50 to-white border-sky-100/80',
    'from-amber-50 to-white border-amber-100/80',
    'from-emerald-50 to-white border-emerald-100/80',
    'from-rose-50 to-white border-rose-100/80',
    'from-indigo-50 to-white border-indigo-100/80',
  ]
  const idx = props.accentIndex ?? 0
  return palette[idx % palette.length]
})

const valueClass = computed(() => {
  switch (props.tone) {
    case 'indigo':
      return 'text-indigo-700'
    case 'emerald':
      return 'text-emerald-700'
    case 'amber':
      return 'text-amber-700'
    case 'rose':
      return 'text-rose-700'
    case 'violet':
      return 'text-violet-700'
    case 'sky':
      return 'text-sky-700'
    default:
      return 'text-slate-900'
  }
})
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 shadow-sm transition-all duration-200"
    :class="[
      accentClass,
      clickable ? 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer' : '',
    ]"
  >
    <div class="flex items-start justify-between gap-2">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ label }}</p>
      <span
        v-if="clickable"
        class="rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      >
        View
      </span>
    </div>
    <p class="mt-2 text-2xl font-bold tabular-nums tracking-tight" :class="valueClass">
      {{ value }}
    </p>
    <slot />
  </article>
</template>
