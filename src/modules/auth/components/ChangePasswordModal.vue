<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import AuthInput from '@/modules/auth/components/AuthInput.vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useToast } from '@/shared/utils/useToast'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const localErrors = ref<Record<string, string>>({})
const saving = ref(false)

function resetForm() {
  form.current_password = ''
  form.password = ''
  form.password_confirmation = ''
  localErrors.value = {}
  authStore.clearErrors()
}

function validateLocal(): boolean {
  const next: Record<string, string> = {}
  if (!form.current_password.trim()) next.current_password = 'Current password is required.'
  if (!form.password.trim()) next.password = 'New password is required.'
  if (!form.password_confirmation.trim()) next.password_confirmation = 'Please confirm your new password.'
  if (form.password && form.password_confirmation && form.password !== form.password_confirmation) {
    next.password_confirmation = 'Passwords do not match.'
  }
  localErrors.value = next
  return Object.keys(next).length === 0
}

function fieldError(key: string): string {
  return localErrors.value[key] || authStore.errors[key]?.[0] || ''
}

async function onSubmit() {
  if (saving.value) return
  if (!validateLocal()) return

  saving.value = true
  authStore.clearErrors()
  try {
    await authStore.changePassword({ ...form })
    toast.success('Password updated successfully.')
    resetForm()
    emit('close')
  } catch {
    if (authStore.apiMessage) toast.error(authStore.apiMessage)
    else toast.error('Unable to update password.')
  } finally {
    saving.value = false
  }
}

function onClose() {
  resetForm()
  emit('close')
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) resetForm()
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      @click.self="onClose"
      @keydown.esc="onClose"
    >
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" @click.stop>
        <header class="mb-4">
          <h3 id="change-password-title" class="text-lg font-semibold text-slate-900">Change password</h3>
          <p class="mt-1 text-sm text-slate-600">Enter your current password and choose a new secure password.</p>
        </header>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <AuthInput
            v-model="form.current_password"
            label="Current password"
            type="password"
            autocomplete="current-password"
            :error="fieldError('current_password')"
            :disabled="saving"
          />
          <AuthInput
            v-model="form.password"
            label="New password"
            type="password"
            autocomplete="new-password"
            show-strength
            :error="fieldError('password')"
            :disabled="saving"
          />
          <AuthInput
            v-model="form.password_confirmation"
            label="Confirm new password"
            type="password"
            autocomplete="new-password"
            :error="fieldError('password_confirmation')"
            :disabled="saving"
          />

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="rounded-lg border px-4 py-2 text-sm text-slate-700" :disabled="saving" @click="onClose">
              Cancel
            </button>
            <button type="submit" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50" :disabled="saving">
              {{ saving ? 'Updating…' : 'Update password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
