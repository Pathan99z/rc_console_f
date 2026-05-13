<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toApiError } from '@/core/http/apiClient'
import { usePrmStore } from '@/modules/prm/store/prm.store'

const route = useRoute()
const router = useRouter()
const prmStore = usePrmStore()

const errorMessage = ref('')
const status = ref<'loading' | 'ready' | 'error'>('loading')
const errorKind = ref<'invalid' | 'expired' | 'revoked' | 'accepted' | 'generic'>('generic')

const token = computed(() => String(route.query.token || ''))

onMounted(async () => {
  if (!token.value) {
    status.value = 'error'
    errorMessage.value = 'Missing invitation token.'
    return
  }
  try {
    await prmStore.fetchInvitationPreview(token.value)
    status.value = 'ready'
  } catch (error) {
    const apiError = toApiError(error)
    const m = apiError.message.toLowerCase()
    if (m.includes('expired')) errorKind.value = 'expired'
    else if (m.includes('revoked')) errorKind.value = 'revoked'
    else if (m.includes('accepted')) errorKind.value = 'accepted'
    else if (apiError.status === 404 || m.includes('invalid')) errorKind.value = 'invalid'
    else errorKind.value = 'generic'
    status.value = 'error'
    errorMessage.value = apiError.message
  }
})

function goAccept() {
  router.push({ path: '/partner/accept', query: { token: token.value } })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 p-6">
    <div class="w-full max-w-md rounded-2xl border border-[var(--rc-border-soft)] bg-white p-8 shadow-sm">
      <h1 class="text-xl font-bold text-slate-900">You are invited</h1>
      <p v-if="status === 'loading'" class="mt-4 text-sm text-slate-500">Loading invitation…</p>
      <template v-else-if="status === 'ready' && prmStore.invitePreview">
        <p class="mt-2 text-sm text-slate-600">
          <span class="font-semibold">{{ prmStore.invitePreview.organization_display_name }}</span>
        </p>
        <p class="mt-3 text-sm text-slate-600">
          Role: <span class="font-mono text-xs">{{ prmStore.invitePreview.role_code }}</span>
        </p>
        <p class="mt-2 text-sm text-slate-600">Email: {{ prmStore.invitePreview.email_masked }}</p>
        <p class="mt-2 text-xs text-slate-500">Expires {{ prmStore.invitePreview.expires_at }}</p>
        <button type="button" class="btn-primary mt-6 w-full rounded-lg py-2.5 text-sm font-semibold" @click="goAccept">
          Continue to accept
        </button>
      </template>
      <div v-else class="mt-4 text-sm">
        <p class="text-red-600">{{ errorMessage }}</p>
        <p v-if="errorKind === 'expired'" class="mt-2 text-slate-500">This invitation has expired. Request a new one.</p>
        <p v-else-if="errorKind === 'revoked'" class="mt-2 text-slate-500">This invitation was revoked by an administrator.</p>
        <p v-else-if="errorKind === 'accepted'" class="mt-2 text-slate-500">This invitation has already been accepted.</p>
        <p v-else-if="errorKind === 'invalid'" class="mt-2 text-slate-500">The token appears invalid. Check the full email link.</p>
      </div>
      <p class="mt-6 text-center text-xs text-slate-400">
        If this link is invalid or expired, ask your administrator to resend the invitation.
      </p>
    </div>
  </div>
</template>
