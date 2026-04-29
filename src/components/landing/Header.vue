<template>
  <header class="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl transition-all duration-300">
    <nav class="bg-white/70 backdrop-blur-md border border-gray-200/60 rounded-full px-6 shadow-sm">
      <div class="flex items-center justify-between h-14">

        <!-- Logo -->
        <a href="#home" @click.prevent="scrollTo('home')" class="flex items-center gap-2.5">
          <img :src="logo" alt="RC Logo" width="32" height="32" class="flex-shrink-0" />
          <span class="text-xl font-bold tracking-tight text-gradient">Console</span>
        </a>

        <!-- Desktop Nav Links -->
        <div class="hidden lg:flex items-center gap-7">
          <a
            v-for="link in navLinks"
            :key="link.id"
            :href="`#${link.id}`"
            @click.prevent="scrollTo(link.id)"
            class="text-gray-600 font-medium text-sm transition-all hover:text-purple-600 hover:scale-105 active:scale-95"
          >
            {{ link.label }}
          </a>
        </div>

        <!-- Desktop CTA Buttons -->
        <div class="hidden md:flex items-center gap-3">
          <RouterLink
            to="/login"
            class="text-sm font-semibold px-5 py-2 rounded-lg border transition-all hover:shadow-sm"
            style="color: var(--color-primary-purple); border-color: var(--color-primary-purple)"
          >
            Log in
          </RouterLink>
          <RouterLink
            to="/signup"
            class="btn-primary text-sm px-5 py-2 rounded-lg"
          >
            Sign up
          </RouterLink>
        </div>

        <!-- Mobile Menu Toggle -->
        <button
          class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          @click="mobileMenuOpen = !mobileMenuOpen"
          aria-label="Toggle menu"
        >
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <Transition name="slide-down">
        <div v-if="mobileMenuOpen" class="lg:hidden py-4 border-t border-gray-200/60">
          <div class="flex flex-col gap-1">
            <a
              v-for="link in navLinks"
              :key="link.id"
              :href="`#${link.id}`"
              @click.prevent="scrollTo(link.id); mobileMenuOpen = false"
              class="text-gray-700 font-medium text-sm py-2 px-3 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              {{ link.label }}
            </a>
            <div class="flex flex-col gap-2 pt-3 mt-1 border-t border-gray-200">
              <RouterLink
                to="/login"
                class="text-sm font-semibold text-center px-5 py-2 rounded-lg border transition-all"
                style="color: var(--color-primary-purple); border-color: var(--color-primary-purple)"
                @click="mobileMenuOpen = false"
              >Log in</RouterLink>
              <RouterLink
                to="/signup"
                class="btn-primary text-sm text-center rounded-lg"
                @click="mobileMenuOpen = false"
              >sign up</RouterLink>
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import logo from '@/assets/logo.png'

const mobileMenuOpen = ref(false)

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'contact', label: 'Contact' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
