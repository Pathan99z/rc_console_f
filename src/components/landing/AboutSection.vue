<template>
  <section id="about" class="py-24 overflow-hidden" style="background: white">
    <div class="container-custom">
      <div class="grid lg:grid-cols-2 gap-16 items-center">

        <!-- ── Left Text ── -->
        <div
          ref="revealRef"
          class="space-y-6 transition-all duration-700"
          :class="revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
        >
          <div
            class="inline-block text-sm font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
            style="color: var(--color-primary-purple); background-color: rgba(122,47,240,0.08)"
          >
            About Us
          </div>

          <h2 class="text-4xl font-bold text-gray-900 leading-tight">
            Transforming Sales Into a<br />
            <span class="text-gradient">Scalable Ecosystem</span>
          </h2>

          <p class="text-gray-500 text-lg leading-relaxed">
            We provide an enterprise-grade platform that transforms direct sales into a scalable
            multi-tier distribution ecosystem. Manage internal teams, partners, and resellers with
            full control, visibility, and security.
          </p>

          <!-- Highlight stats grid -->
          <div class="grid grid-cols-2 gap-4 pt-4">
            <div
              v-for="item in highlights"
              :key="item.label"
              class="rounded-2xl p-5 border border-gray-100 hover:shadow-md hover-gradient-shadow transition-all duration-300 card-gradient-border"
            >
              <div class="text-2xl font-bold text-gradient">{{ item.value }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ item.label }}</div>
            </div>
          </div>
        </div>

        <!-- ── Right Visual ── -->
        <div class="relative">
          <!-- Gradient border wrapper -->
          <div
            class="rounded-3xl p-px shadow-xl"
            style="background: var(--gradient-full)"
          >
            <div class="bg-gray-50 rounded-[calc(1.5rem-1px)] p-6 space-y-4">
              <div
                v-for="tier in tiers"
                :key="tier.title"
                class="flex items-start gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default"
              >
                <div
                  class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                  :style="`background-color: ${tier.color}16`"
                >
                  {{ tier.icon }}
                </div>
                <div>
                  <div class="font-semibold text-gray-800">{{ tier.title }}</div>
                  <div class="text-sm text-gray-500 mt-0.5 leading-relaxed">{{ tier.desc }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Decorative dot -->
          <div
            class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10 blur-2xl pointer-events-none"
            style="background: var(--gradient-primary)"
          ></div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const revealRef = ref(null)
const revealed = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        revealed.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.15 }
  )
  if (revealRef.value) observer.observe(revealRef.value)
})

const highlights = [
  { value: '500+', label: 'Enterprise Clients' },
  { value: '3 Tiers', label: 'Distribution Levels' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '24/7', label: 'Support Coverage' },
]

const tiers = [
  {
    icon: '🏢',
    title: 'Internal Sales',
    desc: 'Manage your direct sales team with full pipeline visibility and performance tracking.',
    color: '#7A2FF0',
  },
  {
    icon: '🤝',
    title: 'Partner Network',
    desc: 'Onboard and manage channel partners seamlessly with dedicated portals and tools.',
    color: '#E23DAD',
  },
  {
    icon: '🔗',
    title: 'Reseller Ecosystem',
    desc: 'Scale distribution through authorised resellers with licence controls and reporting.',
    color: '#0652c5',
  },
]
</script>
