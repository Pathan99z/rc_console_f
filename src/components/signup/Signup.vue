<template>
  <div class="min-h-screen flex flex-col">

    <!-- ══════════════════════════════════════
         CENTERED FORM AREA
    ══════════════════════════════════════ -->
    <div class="flex-1 flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-[440px]">

        <!-- Logo + Console title -->
        <div class="flex flex-col items-center gap-2 mb-6">
          <img :src="logo" alt="RC" class="h-16 w-16 object-contain" />
          <span class="text-4xl font-bold text-gradient">Console</span>
        </div>

        <!-- Heading -->
        <div class="text-center mb-6">
          <h1 class="text-2xl font-semibold text-gray-900">Create your account</h1>
        </div>

        <!-- ── Form ── -->
        <form @submit.prevent="handleSignup" class="space-y-4" novalidate>

          <!-- First + Last Name -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">First Name</label>
              <input
                v-model="form.firstName"
                type="text"
                placeholder="First name"
                autocomplete="given-name"
                class="auth-input"
                :class="{ 'input-error': errors.firstName }"
              />
              <p v-if="errors.firstName" class="text-xs text-red-500">{{ errors.firstName }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                v-model="form.lastName"
                type="text"
                placeholder="Last name"
                autocomplete="family-name"
                class="auth-input"
                :class="{ 'input-error': errors.lastName }"
              />
              <p v-if="errors.lastName" class="text-xs text-red-500">{{ errors.lastName }}</p>
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
                :class="{ 'input-error': errors.email }"
              />
            </div>
            <p v-if="errors.email" class="text-xs text-red-500">{{ errors.email }}</p>
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
                v-model="form.company"
                type="text"
                placeholder="Acme Corporation"
                autocomplete="organization"
                class="auth-input auth-input-icon"
              />
            </div>
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
                :class="{ 'input-error': errors.password }"
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
            <p v-if="errors.password" class="text-xs text-red-500">{{ errors.password }}</p>

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
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Confirm your password"
                autocomplete="new-password"
                class="auth-input auth-input-icon"
                :class="{ 'input-error': errors.confirmPassword }"
              />
            </div>
            <p v-if="errors.confirmPassword" class="text-xs text-red-500">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Terms checkbox -->
          <label class="flex items-start gap-3 cursor-pointer group">
            <div
              class="mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
              :class="form.terms ? 'border-transparent' : 'border-gray-300 group-hover:border-purple-400'"
              :style="form.terms ? 'background: var(--gradient-primary)' : ''"
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
          <p v-if="errors.terms" class="text-xs text-red-500 -mt-2">{{ errors.terms }}</p>

          <!-- Submit -->
          <button
            type="submit"
            class="btn-primary w-full py-3 rounded-lg text-sm font-semibold tracking-wide mt-1"
            :class="{ 'opacity-70 cursor-not-allowed': loading }"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
            <span v-else>Create Account →</span>
          </button>

        </form>

        <!-- Sign in link -->
        <p class="text-center text-sm text-gray-500 mt-5">
          Already have an account?
          <RouterLink
            to="/login"
            class="font-semibold ml-1 transition-colors"
            style="color: var(--color-brand-blue)"
          >
            Sign in
          </RouterLink>
        </p>

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

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/logo.png'

const router = useRouter()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  password: '',
  confirmPassword: '',
  terms: false,
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: '',
})

const showPassword = ref(false)
const loading = ref(false)

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

function validate() {
  let valid = true
  Object.keys(errors).forEach(k => (errors[k] = ''))

  if (!form.firstName.trim()) { errors.firstName = 'First name is required'; valid = false }
  if (!form.lastName.trim()) { errors.lastName = 'Last name is required'; valid = false }
  if (!form.email) {
    errors.email = 'Email is required'; valid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Please enter a valid email'; valid = false
  }
  if (!form.password) {
    errors.password = 'Password is required'; valid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'; valid = false
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'; valid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'; valid = false
  }
  if (!form.terms) { errors.terms = 'You must accept the terms to continue'; valid = false }
  return valid
}

async function handleSignup() {
  if (!validate()) return
  loading.value = true
  await new Promise(r => setTimeout(r, 1400))
  loading.value = false
  // TODO: replace with real registration call
  localStorage.setItem('isAuth', 'true')
  localStorage.setItem('userName', `${form.firstName} ${form.lastName}`)
  router.push('/dashboard')
}
</script>

<style scoped>
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
