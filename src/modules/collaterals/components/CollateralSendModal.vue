<script setup lang="ts">
import { reactive } from 'vue'
import type { ContactItem } from '@/modules/contacts/services/contacts.api'
import type { CollateralItem } from '@/modules/collaterals/types/collateral.types'

const props = defineProps<{
  open: boolean
  collateral: CollateralItem | null
  contacts: ContactItem[]
  sending: boolean
  errors: Record<string, string[]>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', value: { contact_id: string; email: string; message: string }): void
}>()

const form = reactive({
  contact_id: '',
  email: '',
  message: '',
})

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
    <div class="w-full max-w-xl rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold">Send Collateral</h3>
        <button class="rounded border px-2 py-1 text-xs" @click="emit('close')">Close</button>
      </div>
      <p class="mb-3 text-sm text-slate-600">Sharing: <span class="font-semibold">{{ collateral?.name || '-' }}</span></p>
      <div class="grid gap-3">
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-600">Contact (optional)</label>
          <select v-model="form.contact_id" class="rc-input">
            <option value="">Select contact</option>
            <option v-for="contact in contacts" :key="contact.id" :value="String(contact.id)">
              {{ contact.first_name }} {{ contact.last_name }}
            </option>
          </select>
          <p v-if="errors.contact_id?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.contact_id[0] }}</p>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-600">Email (optional)</label>
          <input v-model.trim="form.email" class="rc-input" placeholder="e.g. customer@example.com" />
          <p v-if="errors.email?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.email[0] }}</p>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-600">Message</label>
          <textarea v-model.trim="form.message" class="rc-input" rows="3" placeholder="Please review this collateral."></textarea>
          <p v-if="errors.message?.[0]" class="mt-1 text-xs text-rose-600">{{ errors.message[0] }}</p>
        </div>
      </div>
      <p class="mt-2 text-xs text-slate-500">Provide either contact or email before sending.</p>
      <div class="mt-4 flex justify-end gap-2">
        <button class="rounded border px-3 py-2 text-sm" :disabled="sending" @click="emit('close')">Cancel</button>
        <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="sending" @click="submit">
          <span v-if="sending" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          {{ sending ? 'Sending...' : 'Send Collateral' }}
        </button>
      </div>
    </div>
  </div>
</template>
