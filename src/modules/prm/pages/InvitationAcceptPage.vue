<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toApiError } from '@/core/http/apiClient'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { usePrmStore } from '@/modules/prm/store/prm.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const prmStore = usePrmStore()

const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const requiresVerification = ref(false)

const token = computed(() => String(route.query.token || ''))

const form = reactive({
  name: '',
  password: '',
  password_confirmation: '',
  terms_accepted: false,
})

onMounted(() => {
  if (!token.value) {
    errorMessage.value = 'Missing invitation token. Open the link from your email.'
  }
})

async function submit() {
  if (!token.value) return
  if (!form.terms_accepted) {
    errorMessage.value = 'Please accept the terms to continue.'
    return
  }
  if (form.password !== form.password_confirmation) {
    errorMessage.value = 'Passwords do not match.'
    return
  }
  submitting.value = true
  errorMessage.value = ''
  try {
    const data = await prmStore.submitInvitationAccept({
      token: token.value,
      name: form.name.trim(),
      password: form.password,
      password_confirmation: form.password_confirmation,
      terms_accepted: form.terms_accepted,
    })
    if (data.token) {
      authStore.setToken(data.token)
      await authStore.hydrateSession(true)
      await router.replace(authStore.getDefaultRoute())
    } else {
      requiresVerification.value = Boolean(data.requires_email_verification)
      successMessage.value = requiresVerification.value
        ? 'Invitation accepted. Please verify your email before signing in.'
        : 'Invitation accepted successfully. You can sign in now.'
    }
  } catch (error) {
    errorMessage.value = toApiError(error).message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 p-6">
    <div class="w-full max-w-md rounded-2xl border border-[var(--rc-border-soft)] bg-white p-8 shadow-sm">
      <h1 class="text-xl font-bold text-slate-900">Activate your account</h1>
      <p class="mt-1 text-sm text-slate-500">Set your name and password to finish accepting the invitation.</p>

      <div v-if="successMessage" class="mt-6 space-y-4">
        <p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{{ successMessage }}</p>
        <button type="button" class="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold" @click="router.replace('/login')">
          Go to sign in
        </button>
      </div>
      <form v-else class="mt-6 space-y-4" @submit.prevent="submit">
        <div>
          <label for="prm-acc-name" class="mb-1 block text-xs font-semibold text-slate-600">Full name</label>
          <input id="prm-acc-name" v-model.trim="form.name" type="text" name="name" class="rc-input w-full" required autocomplete="name" />
        </div>
        <div>
          <label for="prm-acc-pass" class="mb-1 block text-xs font-semibold text-slate-600">Password</label>
          <input id="prm-acc-pass" v-model="form.password" type="password" class="rc-input w-full" required autocomplete="new-password" />
        </div>
        <div>
          <label for="prm-acc-pass2" class="mb-1 block text-xs font-semibold text-slate-600">Confirm password</label>
          <input id="prm-acc-pass2" v-model="form.password_confirmation" type="password" class="rc-input w-full" required autocomplete="new-password" />
        </div>
        <label class="flex items-start gap-2 text-sm text-slate-700">
          <input v-model="form.terms_accepted" type="checkbox" class="mt-1" />
          <span>I accept the terms and conditions.</span>
        </label>
        <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
        <button type="submit" class="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold" :disabled="submitting || !token">
          {{ submitting ? 'Activating…' : 'Activate account' }}
        </button>
      </form>
    </div>
  </div>
</template>
