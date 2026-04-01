<template>
  <div
    class="relative rounded-3xl p-px transition-all duration-300 hover:-translate-y-2"
    :class="featured ? 'shadow-2xl shadow-purple-200' : 'shadow-md hover:shadow-xl'"
    :style="featured ? 'background: var(--gradient-full)' : 'background: #e5e7eb'"
  >
    <div
      class="rounded-[calc(1.5rem-1px)] p-8 h-full flex flex-col"
      :class="featured ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'"
    >
      <!-- Most Popular badge -->
      <div v-if="featured" class="absolute -top-4 left-1/2 -translate-x-1/2">
        <span
          class="text-xs font-bold px-5 py-1.5 rounded-full text-white shadow-lg whitespace-nowrap"
          style="background: var(--gradient-full)"
        >
          Most Popular
        </span>
      </div>

      <!-- Plan name + price -->
      <div class="mb-6">
        <div
          class="text-xs font-bold uppercase tracking-widest mb-3"
          :class="featured ? 'text-purple-300' : 'text-gray-400'"
        >
          {{ name }}
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-4xl font-extrabold">{{ price }}</span>
          <span
            v-if="period"
            class="text-sm font-medium"
            :class="featured ? 'text-gray-400' : 'text-gray-400'"
          >
            /{{ period }}
          </span>
        </div>
        <p
          class="text-sm mt-2 leading-relaxed"
          :class="featured ? 'text-gray-400' : 'text-gray-500'"
        >
          {{ tagline }}
        </p>
      </div>

      <!-- Feature list -->
      <ul class="space-y-3 flex-1 mb-8">
        <li
          v-for="feature in features"
          :key="feature"
          class="flex items-start gap-3 text-sm"
        >
          <svg
            class="w-5 h-5 flex-shrink-0 mt-0.5"
            :class="featured ? 'text-purple-400' : 'text-emerald-500'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span :class="featured ? 'text-gray-300' : 'text-gray-600'">{{ feature }}</span>
        </li>
      </ul>

      <!-- CTA button -->
      <a
        href="#contact"
        @click.prevent="scrollTo('contact')"
        class="block text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
        :class="featured ? 'bg-white text-gray-900 hover:bg-gray-50' : 'btn-primary'"
      >
        {{ cta }}
      </a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  price: { type: String, required: true },
  period: { type: String, default: null },
  tagline: { type: String, default: '' },
  features: { type: Array, default: () => [] },
  cta: { type: String, default: 'Get Started' },
  featured: { type: Boolean, default: false },
})

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>
