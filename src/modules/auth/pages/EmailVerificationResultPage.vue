<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AuthCard from '@/modules/auth/components/AuthCard.vue'
import AuthAlert from '@/modules/auth/components/AuthAlert.vue'
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
  <AuthCard>
    <div class="rc-auth-grid">
      <h1 class="rc-auth-title">Email verification</h1>
      <p class="rc-auth-subtitle" v-if="checking">Verifying your email link...</p>

      <template v-else>
        <AuthAlert
          :variant="verified ? 'success' : 'error'"
          :message="verified ? 'Email verified successfully. You can now sign in.' : (auth.apiMessage || 'Verification link is invalid or expired.')"
        />

        <RouterLink to="/login" class="rc-auth-link">Go to sign in</RouterLink>
        <button v-if="!verified" class="rc-auth-button" :disabled="auth.loading" @click="resendVerification">
          {{ auth.loading ? 'Sending...' : 'Resend verification email' }}
        </button>
      </template>
    </div>
  </AuthCard>
</template>
