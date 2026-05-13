<script setup lang="ts">
const props = defineProps<{
  value: string
  kind?: 'status' | 'onboarding'
}>()

function badgeClass(value: string) {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'active' || normalized === 'approved') return 'bg-emerald-50 text-emerald-700'
  if (normalized === 'inactive' || normalized === 'suspended') return 'bg-amber-50 text-amber-700'
  if (normalized === 'rejected') return 'bg-rose-50 text-rose-700'
  return 'bg-slate-100 text-slate-700'
}
</script>

<template>
  <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize" :class="badgeClass(props.value)">
    {{ props.value || (props.kind === 'onboarding' ? 'draft' : 'unknown') }}
  </span>
</template>
