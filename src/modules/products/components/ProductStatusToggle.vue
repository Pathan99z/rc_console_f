<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

function onToggle() {
  emit('update:modelValue', props.modelValue === 1 ? 0 : 1)
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold transition"
    :class="modelValue === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
    :disabled="disabled"
    @click="onToggle"
  >
    {{ modelValue === 1 ? 'active' : 'inactive' }}
  </button>
</template>
