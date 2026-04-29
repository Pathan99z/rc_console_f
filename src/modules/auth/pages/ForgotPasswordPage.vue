<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import logo from '@/assets/logo.png'

const auth = useAuthStore()
const sent = ref(false)
const submittedEmail = ref('')
const form = reactive({ email: '' })

async function onSubmit() {
  if (auth.loading) return
  try {
    await auth.forgotPassword({ ...form })
    sent.value = true
    submittedEmail.value = form.email
  } catch {
    sent.value = false
  }
}

function resend() {
  sent.value = false
  form.email = submittedEmail.value
}
</script>

<template>
  <div class="min-h-screen flex flex-col relative">
    <RouterLink to="/" class="home-link" aria-label="Go to home page">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M9 21v-6h6v6" />
      </svg>
    </RouterLink>
    <div class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-[400px]">
        <!-- Logo + Console title -->
        <div class="flex flex-col items-center gap-2 mb-6">
          <img :src="logo" alt="RC" class="h-16 w-16 object-contain" />
          <span class="text-4xl font-bold text-gradient">Console</span>
        </div>

        <Transition name="fade" mode="out-in">
          <!-- Success state -->
          <div v-if="sent" class="text-center space-y-5">
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
                We've sent a password reset link to<br />
                <span class="font-semibold text-gray-800">{{ submittedEmail }}</span>
              </p>
            </div>

            <p class="text-xs text-gray-400 leading-relaxed">
              Didn't receive it? Check your spam folder or
              <button class="font-semibold transition-colors link-rc" @click="resend" type="button">
                resend the email
              </button>
            </p>

            <RouterLink
              to="/login"
              class="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors mt-2"
              style="color: var(--rc-accent)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
            </RouterLink>
          </div>

          <!-- Form state -->
          <div v-else>
            <div class="text-center mb-6 space-y-1">
              <h1 class="text-2xl font-semibold text-gray-900">Forgot password?</h1>
              <p class="text-sm text-gray-500">Enter your email and we'll send you a reset link.</p>
            </div>

            <form @submit.prevent="onSubmit" class="space-y-4" novalidate>
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
                    :class="{ 'input-error': auth.errors.email?.[0] }"
                  />
                </div>
                <p v-if="auth.errors.email?.[0]" class="text-xs text-red-500">{{ auth.errors.email[0] }}</p>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                class="btn-primary w-full py-3 rounded-lg text-sm font-semibold tracking-wide mt-1"
                :class="{ 'opacity-70 cursor-not-allowed': auth.loading }"
                :disabled="auth.loading"
              >
                <span v-if="auth.loading" class="flex items-center justify-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending…
                </span>
                <span v-else>Send Reset Link</span>
              </button>
            </form>

            <!-- Back to login -->
            <p class="text-center text-sm text-gray-500 mt-5">
              Remembered it?
              <RouterLink to="/login" class="font-semibold ml-1 transition-colors link-rc">Back to Sign In</RouterLink>
            </p>
          </div>
        </Transition>
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
  box-shadow: 0 0 0 3px rgba(122, 47, 240, 0.10);
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
