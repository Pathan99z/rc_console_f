<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  tone?: 'default' | 'indigo' | 'emerald' | 'amber' | 'rose'
}>()
</script>

<template>
  <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ label }}</p>
    <p
      class="mt-2 text-2xl font-bold tabular-nums"
      :class="{
        'text-slate-900': !tone || tone === 'default',
        'text-indigo-700': tone === 'indigo',
        'text-emerald-700': tone === 'emerald',
        'text-amber-700': tone === 'amber',
        'text-rose-700': tone === 'rose',
      }"
    >
      {{ value }}
    </p>
  </article>
</template>
