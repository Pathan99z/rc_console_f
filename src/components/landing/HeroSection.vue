<template>
  <section id="home" class="hero-section relative min-h-screen bg-white pt-32 pb-20 overflow-hidden flex items-center">

    <!-- ══════════════════════════════════════
         BACKGROUND LAYERS (ref styling)
    ══════════════════════════════════════ -->

    <!-- Layer 1: Animated gradient mesh at 60% opacity -->
    <div class="mesh-bg absolute inset-0 w-full h-full pointer-events-none" style="opacity: 0.6"></div>

    <!-- Layer 2: Soft dotted grid at 20% opacity -->
    <div class="animated-grid absolute inset-0 w-full h-full pointer-events-none" style="opacity: 0.2"></div>

    <!-- Layer 3: Full-coverage wave SVGs spanning the whole section -->
    <div class="absolute inset-0 w-full h-full pointer-events-none">
      <!-- Wave 1 — pink, upper third -->
      <svg
        class="wave-svg wave-1"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="rgba(212, 65, 142, 0.08)"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      <!-- Wave 2 — blue, lower half -->
      <svg
        class="wave-svg wave-2"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="rgba(6, 82, 197, 0.06)"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,149.3C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      <!-- Wave 3 — teal, mid section -->
      <svg
        class="wave-svg wave-3"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="rgba(37, 150, 190, 0.05)"
          d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>

    <!-- ══════════════════════════════════════
         MAIN CONTENT
    ══════════════════════════════════════ -->
    <div class="container-custom relative z-10 w-full">
      <div class="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">

        <!-- ── Left Content (staggered entrance) ── -->
        <div class="space-y-5">

          <!-- Headline with SparklesText -->
          <div class="hero-animate-1 space-y-3">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-left">
              <SparklesText>
                <span class="text-gradient">Console</span>
              </SparklesText>
            </h1>

            <!-- Rotating features strip -->
            <div class="h-14 text-left overflow-hidden">
              <LayoutTextFlip
                text=""
                :words="features"
                class-name="text-xl md:text-2xl text-slate-700 font-normal text-left justify-start"
              />
            </div>
          </div>

          <!-- Description -->
          <p class="hero-animate-2 text-slate-600 text-lg leading-relaxed max-w-lg">
            Console is a secure, web-based Multi-Tier Sales &amp; Distribution Platform designed
            to manage internal sales, partners, and resellers within a single unified ecosystem.
          </p>

          <!-- CTA Buttons -->
          <div class="hero-animate-3 flex flex-wrap gap-4 pt-2">
            <a
              href="#contact"
              @click.prevent="scrollTo('contact')"
              class="btn-primary pulse-glow rounded-full text-sm font-medium"
            >
              Get Started →
            </a>
            <a
              href="#features"
              @click.prevent="scrollTo('features')"
              class="rounded-full px-6 py-3 text-sm font-semibold text-gray-700 hover:text-[#0652c5] border-2 border-gray-300 hover:border-[#0652c5] transition-all bg-white/70 backdrop-blur-sm"
            >
              View Features
            </a>
          </div>

          <!-- Tagline -->
          <div class="hero-animate-4 pt-2">
            <p class="text-sm text-slate-400">
              Built with compliance, transparency, and structured workflows at its core.
            </p>
          </div>
        </div>

        <!-- ── Right: Mock Dashboard (WHITE) ── -->
        <div class="hero-animate-right hidden lg:flex justify-center">
          <div class="relative w-full max-w-[490px]">

            <!-- Dashboard card — WHITE version with gradient border -->
            <div class="card-gradient-border shadow-2xl overflow-hidden">
              <div class="bg-white rounded-[14px] p-6 space-y-4">

                <!-- Window chrome -->
                <div class="flex items-center justify-between pb-1 border-b border-gray-100">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" style="background: var(--color-brand-teal)"></div>
                    <span class="text-gray-800 text-sm font-semibold tracking-wide">Sales Overview</span>
                  </div>
                  <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-400"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div class="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>

                <!-- Stat cards -->
                <div class="grid grid-cols-3 gap-3">
                  <div
                    v-for="stat in stats"
                    :key="stat.label"
                    class="bg-gray-50 rounded-2xl p-3 border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{{ stat.label }}</div>
                    <div class="text-base font-bold text-gray-900 mt-1">{{ stat.value }}</div>
                    <div class="text-[10px] font-semibold mt-0.5" style="color: var(--color-brand-teal)">{{ stat.change }}</div>
                  </div>
                </div>

                <!-- Bar chart -->
                <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs text-gray-500 font-medium">Monthly Revenue</span>
                    <span class="text-xs font-bold text-gradient">+18.4% MoM</span>
                  </div>
                  <div class="flex items-end gap-1.5 h-[72px]">
                    <div
                      v-for="(h, i) in barHeights"
                      :key="i"
                      class="flex-1 rounded-t-md transition-all duration-300"
                      :style="`height: ${h}%; background: var(--gradient-full); opacity: ${0.5 + i * 0.07}`"
                    ></div>
                  </div>
                  <div class="flex justify-between mt-2">
                    <span v-for="m in months" :key="m" class="text-[10px] text-gray-400">{{ m }}</span>
                  </div>
                </div>

                <!-- Tier distribution -->
                <div class="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                  <div class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">Tier Distribution</div>
                  <div class="flex gap-1 h-2 rounded-full overflow-hidden">
                    <div class="h-full rounded-l-full" style="width: 40%; background: var(--color-primary-purple)"></div>
                    <div class="h-full" style="width: 35%; background: var(--color-primary-pink)"></div>
                    <div class="h-full rounded-r-full" style="width: 25%; background: var(--color-brand-teal)"></div>
                  </div>
                  <div class="flex justify-between mt-2">
                    <span
                      v-for="tier in tiers"
                      :key="tier.label"
                      class="text-[10px] font-semibold"
                      :style="`color: ${tier.color}`"
                    >{{ tier.label }}</span>
                  </div>
                </div>

                <!-- Pill tags -->
                <div class="flex gap-2 flex-wrap">
                  <span
                    v-for="pill in pills"
                    :key="pill.text"
                    class="text-[11px] px-3 py-1 rounded-full font-semibold"
                    :style="`background-color: ${pill.color}14; color: ${pill.color}; border: 1px solid ${pill.color}22`"
                  >{{ pill.text }}</span>
                </div>
              </div>
            </div>

            <!-- Floating card — top left -->
            <div class="absolute -top-5 -left-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5 border border-gray-100">
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style="background: var(--gradient-primary)"
              >
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div class="text-[10px] text-gray-400 font-medium">Revenue Growth</div>
                <div class="text-sm font-bold" style="color: var(--color-primary-purple)">+24.8%</div>
              </div>
            </div>

            <!-- Floating card — bottom right -->
            <div class="absolute -bottom-5 -right-6 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5 border border-gray-100">
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style="background: rgba(37,150,190,0.12)"
              >
                <svg class="w-4 h-4" style="color: var(--color-brand-teal)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div class="text-[10px] text-gray-400 font-medium">Active Partners</div>
                <div class="text-sm font-bold text-gray-900">1,284</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

  </section>
</template>

<script setup>
import SparklesText from '@/components/ui/SparklesText.vue'
import LayoutTextFlip from '@/components/ui/LayoutTextFlip.vue'

const features = [
  'Multi-Tier Sales Management',
  'Partner Network Control',
  'Real-Time Analytics',
  'Secure RBAC Workflows',
  'Reseller Distribution',
]

const avatarColors = [
  'var(--color-primary-purple)',
  'var(--color-primary-pink)',
  'var(--color-brand-teal)',
  'var(--color-brand-blue)',
]

const stats = [
  { label: 'Revenue', value: '$2.4M', change: '↑ +12%' },
  { label: 'Partners', value: '284', change: '↑ +8%' },
  { label: 'Resellers', value: '1.2K', change: '↑ +18%' },
]

const barHeights = [38, 60, 45, 78, 58, 90, 70]
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

const tiers = [
  { label: '🏢 Internal 40%', color: '#7A2FF0' },
  { label: '🤝 Partners 35%', color: '#E23DAD' },
  { label: '🔗 Resellers 25%', color: '#2596be' },
]

const pills = [
  { text: '✓ RBAC Active', color: '#7A2FF0' },
  { text: '⚡ Realtime', color: '#2596be' },
  { text: '🔒 Secure', color: '#E23DAD' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
/* ── Staggered entrance animations ── */
.hero-animate-1,
.hero-animate-2,
.hero-animate-3,
.hero-animate-4,
.hero-animate-5,
.hero-animate-right {
  opacity: 0;
  transform: translateY(20px);
  animation: heroFadeUp 0.6s ease forwards;
}

.hero-animate-1  { animation-delay: 0.1s; }
.hero-animate-2  { animation-delay: 0.2s; }
.hero-animate-3  { animation-delay: 0.3s; }
.hero-animate-4  { animation-delay: 0.45s; }
.hero-animate-5  { animation-delay: 0.55s; }

.hero-animate-right {
  transform: scale(0.94) translateY(10px);
  animation: heroScaleUp 0.65s ease forwards;
  animation-delay: 0.3s;
}

@keyframes heroFadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes heroScaleUp {
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
