<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const auth = useAuthStore()
const route = useRoute()
const verified = ref(false)
const checking = ref(true)

const verificationPath = computed(() => {
  const id = route.params.id
  const hash = route.params.hash
  const query = new URLSearchParams(route.query as Record<string, string>).toString()
  const base = `/email/verify/${String(id)}/${String(hash)}`
  return query ? `${base}?${query}` : base
})

onMounted(async () => {
  try {
    await auth.verifyEmail(verificationPath.value)
    verified.value = true
  } catch {
    verified.value = false
  } finally {
    checking.value = false
  }
})

async function resendVerification() {
  try {
    await auth.resendVerification()
  } catch {
    // handled in store
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-[400px]">
        <div class="text-center mb-6 space-y-1">
          <h1 class="text-2xl font-semibold text-gray-900">Email verification</h1>
        </div>

        <template v-if="checking">
          <p class="text-sm text-gray-500 text-center mb-4">Verifying your email link...</p>
        </template>

        <template v-else>
          <div
            class="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm border mb-4"
            :class="verified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'"
          >
            <svg v-if="verified" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {{ verified ? 'Email verified successfully. You can now sign in.' : (auth.apiMessage || 'Verification link is invalid or expired.') }}
            </span>
          </div>

          <RouterLink
            to="/login"
            class="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors link-rc"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go to sign in
          </RouterLink>

          <button
            v-if="!verified"
            class="btn-primary w-full py-3 rounded-lg text-sm font-semibold tracking-wide mt-4"
            :disabled="auth.loading"
            @click="resendVerification"
          >
            <span v-if="auth.loading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending...
            </span>
            <span v-else>Resend verification email</span>
          </button>
        </template>
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
