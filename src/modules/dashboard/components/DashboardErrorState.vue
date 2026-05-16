<script setup lang="ts">
defineProps<{ message: string }>()
defineEmits<{ (e: 'retry'): void }>()
</script>

<template>
  <div class="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center" role="alert">
    <p class="text-sm font-medium text-red-800">{{ message }}</p>
    <button type="button" class="mt-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700" @click="$emit('retry')">
      Retry
    </button>
  </div>
</template>
