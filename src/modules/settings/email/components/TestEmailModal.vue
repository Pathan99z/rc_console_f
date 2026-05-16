<script setup lang="ts">
import { ref, watch } from 'vue'
import { validateTestRecipient } from '@/modules/settings/email/utils/emailSettingsValidation'

const props = defineProps<{
  open: boolean
  testing?: boolean
  fieldErrors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'send', recipient: string): void
}>()

const recipient = ref('')
const localError = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      recipient.value = ''
      localError.value = ''
    }
  },
)

function fieldErr(key: string) {
  return props.fieldErrors?.[key]?.[0]
}

function submit() {
  const err = validateTestRecipient(recipient.value)
  if (err) {
    localError.value = err
    return
  }
  localError.value = ''
  emit('send', recipient.value.trim())
}

function close() {
  if (props.testing) return
  emit('close')
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" @click.self="close">
    <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="test-email-title">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 id="test-email-title" class="text-base font-semibold text-slate-900">Send test email</h3>
          <p class="mt-1 text-xs text-slate-500">A test message will be sent using the effective configuration for this organization.</p>
        </div>
        <button type="button" class="rounded border px-2 py-1 text-xs text-slate-600 hover:bg-slate-50" :disabled="testing" @click="close">
          Close
        </button>
      </div>

      <label class="mt-4 block text-sm">
        <span class="mb-1 block text-xs font-semibold text-slate-600">Recipient email</span>
        <input
          v-model="recipient"
          type="email"
          class="rc-input w-full"
          placeholder="you@company.com"
          :disabled="testing"
          @keyup.enter="submit"
        />
        <p v-if="localError" class="mt-1 text-xs text-rose-600">{{ localError }}</p>
        <p v-else-if="fieldErr('recipient_email')" class="mt-1 text-xs text-rose-600">{{ fieldErr('recipient_email') }}</p>
      </label>

      <div class="mt-5 flex justify-end gap-2">
        <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" :disabled="testing" @click="close">
          Cancel
        </button>
        <button
          type="button"
          class="btn-primary inline-flex min-w-[8rem] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-55"
          :disabled="testing"
          @click="submit"
        >
          <span v-if="testing" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {{ testing ? 'Sending…' : 'Send test' }}
        </button>
      </div>
    </div>
  </div>
</template>
