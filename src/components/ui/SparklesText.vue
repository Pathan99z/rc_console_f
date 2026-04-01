<template>
  <span class="sparkles-text-wrapper" :class="className">
    <span class="relative z-10">
      <slot />
    </span>

    <!-- Blue glow line below text -->
    <span class="glow-line" />
  </span>
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.sparkles-text-wrapper {
  position: relative;
  display: inline-block;
}

.glow-line {
  position: absolute;
  bottom: -6px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(6, 82, 197, 0.5),
    transparent
  );
  border-radius: 9999px;
}
</style>
