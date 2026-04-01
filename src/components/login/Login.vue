<template>
  <div class="min-h-screen flex flex-col">

    <!-- ══════════════════════════════════════
         CENTERED FORM AREA
    ══════════════════════════════════════ -->
    <div class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-[400px]">

        <!-- Logo + Console title -->
        <div class="flex flex-col items-center gap-2 mb-6">
          <img :src="logo" alt="RC" class="h-16 w-16 object-contain" />
          <span class="text-4xl font-bold text-gradient">Console</span>
        </div>

        <!-- Heading -->
        <div class="text-center mb-6">
          <h1 class="text-2xl font-semibold text-gray-900">Sign in</h1>
        </div>

        <!-- ── Form ── -->
        <form @submit.prevent="handleLogin" class="space-y-4" novalidate>

          <!-- Email -->
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
              <input
                v-model="form.email"
                type="email"
                placeholder="Enter your email"
                autocomplete="email"
                class="auth-input"
                :class="{ 'border-red-400': errors.email }"
              />
            </div>
            <p v-if="errors.email" class="text-xs text-red-500">{{ errors.email }}</p>
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
                placeholder="Enter your password"
                autocomplete="current-password"
                class="auth-input auth-input-password"
                :class="{ 'border-red-400': errors.password }"
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
          </div>

          <!-- Remember me + Forgot password -->
          <div class="flex items-center justify-between pt-0.5">
            <label class="flex items-center gap-2.5 cursor-pointer group">
              <div
                class="w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
                :class="form.remember ? 'border-transparent' : 'border-gray-300 group-hover:border-purple-400'"
                :style="form.remember ? 'background: var(--gradient-primary)' : ''"
                @click="form.remember = !form.remember"
              >
                <svg v-if="form.remember" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-sm text-gray-600">Remember me</span>
            </label>
            <RouterLink
              to="/forgot-password"
              class="text-sm font-semibold transition-colors"
              style="color: var(--color-primary-pink)"
            >
              Forgot password?
            </RouterLink>
          </div>

          <!-- Error banner -->
          <Transition name="fade">
            <div
              v-if="loginError"
              class="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ loginError }}
            </div>
          </Transition>

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
              Signing in...
            </span>
            <span v-else>Sign In →</span>
          </button>

        </form>

        <!-- Create account link -->
        <p class="text-center text-sm text-gray-500 mt-5">
          Don't have an account?
          <RouterLink
            to="/signup"
            class="font-semibold ml-1 transition-colors"
            style="color: var(--color-brand-blue)"
          >
            Create an account
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/logo.png'

const router = useRouter()

const form = reactive({ email: '', password: '', remember: false })
const errors = reactive({ email: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const loginError = ref('')

function validate() {
  let valid = true
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email is required'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Please enter a valid email'
    valid = false
  }
  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    valid = false
  }
  return valid
}

async function handleLogin() {
  loginError.value = ''
  if (!validate()) return
  loading.value = true
  await new Promise(r => setTimeout(r, 1200))
  loading.value = false
  // TODO: replace with real auth call
  localStorage.setItem('isAuth', 'true')
  localStorage.setItem('userName', form.email.split('@')[0])
  router.push('/dashboard')
}
</script>

<style scoped>
.auth-input {
  width: 100%;
  /* left padding = icon width (1rem) + gap (0.875rem) + breathing room */
  padding: 0.65rem 1rem 0.65rem 2.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  background: #fafafa;
  transition: all 0.2s;
  outline: none;
}
/* extra right padding for eye-toggle button */
.auth-input-password {
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
