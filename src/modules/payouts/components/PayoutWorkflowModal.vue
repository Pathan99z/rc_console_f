<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
  submitLabel?: string
  requireReason?: boolean
  requireFailureReason?: boolean
  showReference?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { remarks?: string; failure_reason?: string; reason?: string; reference?: string }): void
}>()

const remarks = ref('')
const failureReason = ref('')
const reason = ref('')
const reference = ref('')

watch(
  () => props.open,
  (v) => {
    if (!v) {
      remarks.value = ''
      failureReason.value = ''
      reason.value = ''
      reference.value = ''
    }
  },
)

function submit() {
  if (props.requireFailureReason && !failureReason.value.trim()) return
  if (props.requireReason && !reason.value.trim()) return
  emit('submit', {
    remarks: remarks.value || undefined,
    failure_reason: failureReason.value || undefined,
    reason: reason.value || undefined,
    reference: reference.value || undefined,
  })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="emit('close')">
    <form class="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl" @submit.prevent="submit">
      <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
      <label v-if="requireFailureReason" class="block text-sm">
        <span class="text-slate-600">Failure reason *</span>
        <textarea v-model="failureReason" class="rc-input mt-1 w-full" rows="2" required />
      </label>
      <label v-if="requireReason" class="block text-sm">
        <span class="text-slate-600">Reason *</span>
        <textarea v-model="reason" class="rc-input mt-1 w-full" rows="2" required />
      </label>
      <label v-if="showReference" class="block text-sm">
        <span class="text-slate-600">Reference</span>
        <input v-model="reference" class="rc-input mt-1 w-full" />
      </label>
      <label class="block text-sm">
        <span class="text-slate-600">Remarks</span>
        <textarea v-model="remarks" class="rc-input mt-1 w-full" rows="2" />
      </label>
      <div class="flex justify-end gap-2">
        <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="emit('close')">Cancel</button>
        <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          {{ submitLabel || 'Confirm' }}
        </button>
      </div>
    </form>
  </div>
</template>
