<script setup lang="ts">
defineProps<{
  variant?: 'error' | 'success' | 'info'
  message: string
}>()
</script>

<template>
  <p :class="['rc-auth-alert', `rc-auth-alert--${variant ?? 'info'}`]">
    {{ message }}
  </p>
</template>
