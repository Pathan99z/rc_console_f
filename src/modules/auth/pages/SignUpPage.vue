<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import logo from '@/assets/logo.png'

const auth = useAuthStore()
const submitted = ref(false)

const showPassword = ref(false)

const form = reactive({
  first_name: '',
  last_name: '',
  company_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  terms: false,
})

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return { score: 0, label: '', color: '#e5e7eb' }

  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++

  const levels = [
    { score: 1, label: 'Weak', color: '#ef4444' },
    { score: 2, label: 'Fair', color: '#f97316' },
    { score: 3, label: 'Good', color: '#eab308' },
    { score: 4, label: 'Strong', color: '#22c55e' },
  ]

  return levels[score - 1] || { score: 0, label: 'Too short', color: '#ef4444' }
})

async function onSubmit() {
  if (auth.loading) return
  if (!form.terms) return
  try {
    await auth.register({ ...form })
    submitted.value = true
  } catch {
    submitted.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col relative">
    <RouterLink to="/" class="home-link" aria-label="Go to home page">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M9 21v-6h6v6" />
      </svg>
    </RouterLink>
    <div class="flex-1 flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-[440px]">
        <!-- Logo + Console title -->
        <div class="flex flex-col items-center gap-2 mb-6">
          <img :src="logo" alt="RC" class="h-16 w-16 object-contain" />
          <span class="text-4xl font-bold text-gradient">Console</span>
        </div>

        <template v-if="submitted">
          <div class="text-center space-y-5">
            <div class="flex justify-center">
              <div
                class="w-16 h-16 rounded-full flex items-center justify-center"
                style="background: var(--rc-accent-soft); border: 1px solid rgba(122,47,240,0.12)"
              >
                <svg class="w-8 h-8" style="color: var(--rc-accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div class="space-y-1.5">
              <h1 class="text-2xl font-semibold text-gray-900">Check your inbox</h1>
              <p class="text-sm text-gray-500 leading-relaxed">
                We've created your account successfully. Please verify your email before signing in.
              </p>
            </div>
            <p v-if="auth.apiMessage" class="text-sm text-gray-600">{{ auth.apiMessage }}</p>

            <RouterLink
              to="/login"
              class="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
              style="color: var(--rc-accent)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
            </RouterLink>
          </div>
        </template>

        <template v-else>
          <div class="text-center mb-6">
            <h1 class="text-2xl font-semibold text-gray-900">Create your account</h1>
          </div>

          <div v-if="auth.apiMessage" class="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ auth.apiMessage }}
          </div>

          <form @submit.prevent="onSubmit" class="space-y-4" novalidate>
            <!-- First + Last Name -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  v-model="form.first_name"
                  type="text"
                  placeholder="First name"
                  autocomplete="given-name"
                  class="auth-input"
                  :class="{ 'input-error': auth.errors.first_name?.[0] }"
                />
                <p v-if="auth.errors.first_name?.[0]" class="text-xs text-red-500">{{ auth.errors.first_name[0] }}</p>
              </div>
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  v-model="form.last_name"
                  type="text"
                  placeholder="Last name"
                  autocomplete="family-name"
                  class="auth-input"
                  :class="{ 'input-error': auth.errors.last_name?.[0] }"
                />
                <p v-if="auth.errors.last_name?.[0]" class="text-xs text-red-500">{{ auth.errors.last_name[0] }}</p>
              </div>
            </div>

            <!-- Work Email -->
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">Work Email</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="your@company.com"
                  autocomplete="email"
                  class="auth-input auth-input-icon"
                  :class="{ 'input-error': auth.errors.email?.[0] }"
                />
              </div>
              <p v-if="auth.errors.email?.[0]" class="text-xs text-red-500">{{ auth.errors.email[0] }}</p>
            </div>

            <!-- Company Name -->
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">Company Name</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <input
                  v-model="form.company_name"
                  type="text"
                  placeholder="Acme Corporation"
                  autocomplete="organization"
                  class="auth-input auth-input-icon"
                  :class="{ 'input-error': auth.errors.company_name?.[0] }"
                />
              </div>
              <p v-if="auth.errors.company_name?.[0]" class="text-xs text-red-500">{{ auth.errors.company_name[0] }}</p>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">Password</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Create a strong password"
                  autocomplete="new-password"
                  class="auth-input auth-input-icon auth-input-toggle"
                  :class="{ 'input-error': auth.errors.password?.[0] }"
                />
                <button
                  type="button"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  @click="showPassword = !showPassword"
                  tabindex="-1"
                >
                  <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <p v-if="auth.errors.password?.[0]" class="text-xs text-red-500">{{ auth.errors.password[0] }}</p>

              <!-- Password strength bar -->
              <div v-if="form.password" class="space-y-1 pt-0.5">
                <div class="flex gap-1">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="flex-1 h-1 rounded-full transition-all duration-300"
                    :style="i <= passwordStrength.score ? `background: ${passwordStrength.color}` : 'background: #e5e7eb'"
                  ></div>
                </div>
                <p class="text-xs" :style="`color: ${passwordStrength.color}`">{{ passwordStrength.label }}</p>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <input
                  v-model="form.password_confirmation"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                  class="auth-input auth-input-icon"
                  :class="{ 'input-error': auth.errors.password_confirmation?.[0] }"
                />
              </div>
              <p v-if="auth.errors.password_confirmation?.[0]" class="text-xs text-red-500">{{ auth.errors.password_confirmation[0] }}</p>
            </div>

            <!-- Terms checkbox -->
            <label class="flex items-start gap-3 cursor-pointer group">
              <div
                class="mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                :class="form.terms ? 'border-transparent' : 'border-gray-300 group-hover:border-purple-400'"
                :style="form.terms ? 'background: var(--rc-accent)' : ''"
                @click="form.terms = !form.terms"
              >
                <svg v-if="form.terms" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-sm text-gray-600 leading-relaxed">
                I agree to Console's
                <a href="#" class="font-semibold underline" style="color: var(--color-primary-purple)">Terms of Service</a>
                and
                <a href="#" class="font-semibold underline" style="color: var(--color-primary-purple)">Privacy Policy</a>
              </span>
            </label>
            <p v-if="auth.errors.terms?.[0]" class="text-xs text-red-500 -mt-2">{{ auth.errors.terms[0] }}</p>

            <!-- Submit -->
            <button
              type="submit"
              class="btn-primary w-full py-3 rounded-lg text-sm font-semibold tracking-wide mt-1"
              :class="{ 'opacity-70 cursor-not-allowed': auth.loading || !form.terms }"
              :disabled="auth.loading || !form.terms"
            >
              <span v-if="auth.loading" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </span>
              <span v-else>Create Account →</span>
            </button>
          </form>

          <p class="text-center text-sm text-gray-500 mt-5">
            Already have an account?
            <RouterLink to="/login" class="font-semibold ml-1 transition-colors link-rc">Sign in</RouterLink>
          </p>
        </template>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         BOTTOM BAR
    ══════════════════════════════════════ -->
    <div class="py-5 border-t border-gray-100">
      <p class="text-center text-xs text-gray-400">
        © 2026 Reliance Corporation. All rights reserved. &nbsp;·&nbsp;
        <a href="#" class="hover:text-gray-600 transition-colors">Privacy Policy</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.home-link {
  position: absolute;
  top: 1.75rem;
  left: 1.75rem;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.home-link:hover {
  color: #334155;
}
.auth-input {
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  background: #fafafa;
  transition: all 0.2s;
  outline: none;
}

/* Left-icon fields — clears the icon */
.auth-input-icon {
  padding-left: 2.75rem;
}

/* Password field — also clears the eye toggle button */
.auth-input-toggle {
  padding-right: 3rem;
}

.auth-input:focus {
  background: #ffffff;
  border-color: var(--color-primary-purple);
  box-shadow: 0 0 0 3px rgba(122, 47, 240, 0.12);
}
.auth-input::placeholder {
  color: #9ca3af;
}
.input-error {
  border-color: #f87171;
}
.input-error:focus {
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15);
}
</style>
