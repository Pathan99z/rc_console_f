<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import logo from '@/assets/logo.png'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const showPassword = ref(false)
const form = reactive({
  token: String(route.query.token || ''),
  email: String(route.query.email || ''),
  password: '',
  password_confirmation: '',
})

async function onSubmit() {
  if (auth.loading) return
  try {
    await auth.resetPassword({ ...form })
    router.push('/login')
  } catch {
    // handled in store
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-[400px]">
        <div class="rc-auth-grid">
          <div class="flex flex-col items-center gap-2 mb-3">
            <img :src="logo" alt="RC" class="h-16 w-16 object-contain" />
            <span class="text-4xl font-bold text-gradient">Console</span>
          </div>

          <h1 class="rc-auth-title text-center">Reset password</h1>
          <p class="rc-auth-subtitle text-center">Set a new password for your account.</p>

          <div v-if="auth.apiMessage" class="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {{ auth.apiMessage }}
          </div>

          <form class="rc-auth-grid" @submit.prevent="onSubmit">
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
                  autocomplete="email"
                  class="auth-input"
                  :class="{ 'input-error': auth.errors.email?.[0] }"
                />
              </div>
              <p v-if="auth.errors.email?.[0]" class="text-xs text-red-500">{{ auth.errors.email[0] }}</p>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">New password</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  class="auth-input auth-input-password"
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
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">Confirm new password</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <input
                  v-model="form.password_confirmation"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  class="auth-input auth-input-password"
                  :class="{ 'input-error': auth.errors.password_confirmation?.[0] }"
                />
              </div>
              <p v-if="auth.errors.password_confirmation?.[0]" class="text-xs text-red-500">{{ auth.errors.password_confirmation[0] }}</p>
            </div>
            <button class="btn-primary w-full py-3 rounded-lg text-sm font-semibold tracking-wide" :disabled="auth.loading" type="submit">
              <span v-if="auth.loading" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Updating...
              </span>
              <span v-else>Update password</span>
            </button>
          </form>

          <p class="text-center text-sm text-gray-500 mt-2">
            Back to
            <RouterLink to="/login" class="font-semibold ml-1 transition-colors link-rc">Sign in</RouterLink>
          </p>
        </div>
      </div>
    </div>

    <div class="py-5 border-t border-gray-100">
      <p class="text-center text-xs text-gray-400">
        © 2026 Reliance Corporation. All rights reserved. &nbsp;·&nbsp;
        <a href="#" class="hover:text-gray-600 transition-colors">Privacy Policy</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-input {
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.75rem;
  border: 1.5px solid var(--rc-border);
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: var(--rc-text);
  background: var(--rc-surface-2);
  transition: all 0.2s;
  outline: none;
}
.auth-input:focus {
  background: var(--rc-surface);
  border-color: var(--rc-accent);
  box-shadow: 0 0 0 3px rgba(122, 47, 240, 0.1);
}
.auth-input::placeholder {
  color: #9ca3af;
}
.auth-input-password {
  padding-right: 3rem;
}
.input-error {
  border-color: #f87171;
}
.input-error:focus {
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15);
}
</style>
