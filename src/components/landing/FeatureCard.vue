<template>
  <div
    class="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover-gradient-shadow hover:-translate-y-1.5 transition-all duration-300 cursor-default"
  >
    <!-- Icon -->
    <div
      class="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-2xl group-hover:scale-110 transition-transform duration-300"
      :style="`background-color: ${color}14`"
    >
      {{ icon }}
    </div>

    <!-- Title -->
    <h3 class="text-base font-semibold text-gray-900 mb-2">{{ title }}</h3>

    <!-- Description -->
    <p class="text-gray-500 text-sm leading-relaxed mb-4">{{ description }}</p>

    <!-- Feature points -->
    <ul class="space-y-2">
      <li
        v-for="point in points"
        :key="point"
        class="flex items-center gap-2 text-sm text-gray-600"
      >
        <span
          class="w-1.5 h-1.5 rounded-full flex-shrink-0"
          :style="`background-color: ${color}`"
        ></span>
        {{ point }}
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Array, default: () => [] },
  color: { type: String, default: '#7A2FF0' },
})
</script>
