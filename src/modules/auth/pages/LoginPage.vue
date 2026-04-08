<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthCard from '@/modules/auth/components/AuthCard.vue'
import AuthInput from '@/modules/auth/components/AuthInput.vue'
import AuthAlert from '@/modules/auth/components/AuthAlert.vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import logo from '@/assets/logo.png'

const auth = useAuthStore()
const router = useRouter()
const unverifiedState = ref(false)
const form = reactive({
  email: '',
  password: '',
  device_name: 'web',
  remember: false,
})

async function onSubmit() {
  if (auth.loading) return
  unverifiedState.value = false
  try {
    await auth.login({ ...form })
    router.push('/app/dashboard')
  } catch {
    const emailErrors = auth.errors.email || []
    unverifiedState.value = emailErrors.some((message) => message.toLowerCase().includes('verify your email'))
  }
}

async function resendVerification() {
  if (auth.loading) return
  try {
    await auth.resendVerification()
  } catch {
    // message handled in store
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1 flex items-center justify-center px-4 py-12">
      <AuthCard>
        <div class="rc-auth-content rc-auth-grid">
          <div class="flex flex-col items-center gap-2 mb-3">
            <img :src="logo" alt="RC" class="h-16 w-16 object-contain" />
            <span class="text-4xl font-bold text-gradient">Console</span>
          </div>

          <h1 class="rc-auth-title text-center">Sign in</h1>

          <AuthAlert v-if="auth.apiMessage" :variant="unverifiedState ? 'info' : 'error'" :message="auth.apiMessage" />

          <form class="rc-auth-grid" @submit.prevent="onSubmit">
            <AuthInput v-model="form.email" type="email" autocomplete="email" label="Email" :error="auth.errors.email?.[0]" />
            <AuthInput v-model="form.password" type="password" autocomplete="current-password" label="Password" :error="auth.errors.password?.[0]" />

            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 cursor-pointer text-gray-600">
                <input v-model="form.remember" type="checkbox" class="accent-[var(--rc-accent)]" />
                Remember me
              </label>
              <RouterLink to="/forgot-password" class="rc-auth-link">Forgot password?</RouterLink>
            </div>

            <button class="btn-primary w-full py-3 rounded-lg text-sm font-semibold tracking-wide" :disabled="auth.loading" type="submit">
              <span v-if="auth.loading" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
              <span v-else>Sign In →</span>
            </button>
          </form>

          <button v-if="unverifiedState" class="btn-primary w-full py-3 rounded-lg text-sm font-semibold tracking-wide" :disabled="auth.loading" @click="resendVerification">
            <span v-if="auth.loading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending...
            </span>
            <span v-else>Resend verification email</span>
          </button>

          <p class="text-center text-sm text-gray-500 mt-2">
            Don't have an account?
            <RouterLink to="/signup" class="font-semibold ml-1 transition-colors link-rc">Create an account</RouterLink>
          </p>
        </div>
      </AuthCard>
    </div>

    <div class="py-5 border-t border-gray-100">
      <p class="text-center text-xs text-gray-400">
        © 2026 Reliance Corporation. All rights reserved. &nbsp;·&nbsp;
        <a href="#" class="hover:text-gray-600 transition-colors">Privacy Policy</a>
      </p>
    </div>
  </div>
</template>
