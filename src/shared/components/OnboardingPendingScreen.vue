<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { clearOnboardingBlocked } from '@/modules/auth/composables/useOnboardingGate'

const router = useRouter()
const authStore = useAuthStore()

async function signOut() {
  clearOnboardingBlocked()
  await authStore.logout()
  void router.push('/login')
}
</script>

<template>
  <section class="flex min-h-[60vh] items-center justify-center p-6">
    <article class="w-full max-w-lg rounded-2xl border border-[var(--rc-border-soft)] bg-white p-8 text-center shadow-sm">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-slate-900">Organization onboarding pending</h2>
      <p class="mt-3 text-sm leading-relaxed text-slate-600">
        Your reseller account is awaiting activation. CRM access will be available once approval is complete.
      </p>
      <p class="mt-2 text-xs text-slate-500">Contact your administrator if you believe this is an error.</p>
      <button type="button" class="mt-6 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="signOut">
        Sign out
      </button>
    </article>
  </section>
</template>
