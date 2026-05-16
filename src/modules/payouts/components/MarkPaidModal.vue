<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { PAYOUT_PAYMENT_METHODS } from '@/modules/payouts/utils/payoutFormat'
import type { MarkPaidPayload, PayoutPaymentMethod } from '@/modules/payouts/types/payout.types'

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
const ACCEPTED_EXT = '.pdf,.png,.jpg,.jpeg'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  (e: 'submit', payload: MarkPaidPayload): void
}>()

const paymentMethod = ref<PayoutPaymentMethod>('neft')
const remittanceReference = ref('')
const paymentDate = ref('')
const remarks = ref('')
const file = ref<File | null>(null)
const dragging = ref(false)
const fileError = ref('')

const fileInputRef = ref<HTMLInputElement | null>(null)

const fileMeta = computed(() => {
  if (!file.value) return null
  const sizeMb = file.value.size / (1024 * 1024)
  const sizeLabel = sizeMb < 1 ? `${Math.round(file.value.size / 1024)} KB` : `${sizeMb.toFixed(2)} MB`
  const isPdf = file.value.type === 'application/pdf' || file.value.name.toLowerCase().endsWith('.pdf')
  return { name: file.value.name, sizeLabel, isPdf }
})

function resetForm() {
  paymentMethod.value = 'neft'
  remittanceReference.value = ''
  paymentDate.value = ''
  remarks.value = ''
  file.value = null
  dragging.value = false
  fileError.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

watch(open, (isOpen) => {
  if (!isOpen) resetForm()
})

function validateFile(candidate: File): string | null {
  const ext = candidate.name.split('.').pop()?.toLowerCase()
  const allowedExt = ['pdf', 'png', 'jpg', 'jpeg']
  const typeOk = ACCEPTED_TYPES.includes(candidate.type) || (ext && allowedExt.includes(ext))
  if (!typeOk) return 'Only PDF, PNG, or JPG files are allowed.'
  if (candidate.size > MAX_FILE_BYTES) return 'File must be 10 MB or smaller.'
  return null
}

function setFile(candidate: File | null) {
  if (!candidate) {
    file.value = null
    fileError.value = ''
    return
  }
  const err = validateFile(candidate)
  if (err) {
    fileError.value = err
    file.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
    return
  }
  fileError.value = ''
  file.value = candidate
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  setFile(input.files?.[0] ?? null)
  input.value = ''
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  dragging.value = false
  setFile(event.dataTransfer?.files?.[0] ?? null)
}

function removeFile() {
  setFile(null)
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function submit() {
  if (!remittanceReference.value.trim()) return
  if (fileError.value) return
  emit('submit', {
    payment_method: paymentMethod.value,
    remittance_reference: remittanceReference.value.trim(),
    payment_date: paymentDate.value || undefined,
    remarks: remarks.value || undefined,
    supporting_document: file.value || undefined,
  })
  open.value = false
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="open = false">
    <form class="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl" @submit.prevent="submit">
      <h3 class="text-lg font-semibold text-slate-900">Mark payout as paid</h3>
      <label class="block text-sm">
        <span class="text-slate-600">Payment method *</span>
        <select v-model="paymentMethod" class="rc-input mt-1 w-full" required>
          <option v-for="m in PAYOUT_PAYMENT_METHODS" :key="m" :value="m">{{ m }}</option>
        </select>
      </label>
      <label class="block text-sm">
        <span class="text-slate-600">Remittance reference (UTR) *</span>
        <input v-model="remittanceReference" class="rc-input mt-1 w-full" required placeholder="e.g. UTR123456789" />
      </label>
      <label class="block text-sm">
        <span class="text-slate-600">Payment date</span>
        <input v-model="paymentDate" type="date" class="rc-input mt-1 w-full" />
      </label>
      <label class="block text-sm">
        <span class="text-slate-600">Remarks</span>
        <textarea v-model="remarks" class="rc-input mt-1 w-full" rows="2" placeholder="Optional payment notes" />
      </label>

      <div class="block text-sm">
        <span class="text-slate-600">Supporting document</span>
        <p class="mt-0.5 text-xs text-slate-500">PDF, PNG, or JPG — max 10 MB (optional)</p>

        <label
          v-if="!file"
          class="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors"
          :class="dragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/30'"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop="onDrop"
        >
          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            :accept="ACCEPTED_EXT"
            @change="onFileChange"
          />
          <span class="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
            </svg>
          </span>
          <p class="text-sm font-medium text-slate-800">Drag & drop or click to upload</p>
          <p class="mt-1 text-xs text-slate-500">Payment proof, receipt, or bank confirmation</p>
        </label>

        <div
          v-else
          class="mt-2 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/40 px-3 py-3"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase"
            :class="fileMeta?.isPdf ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
          >
            {{ fileMeta?.isPdf ? 'PDF' : 'IMG' }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-900" :title="fileMeta?.name">{{ fileMeta?.name }}</p>
            <p class="text-xs text-slate-500">{{ fileMeta?.sizeLabel }}</p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            @click="removeFile"
          >
            Remove
          </button>
        </div>

        <p v-if="fileError" class="mt-1.5 text-xs text-rose-600">{{ fileError }}</p>
      </div>

      <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="open = false">
          Cancel
        </button>
        <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Confirm paid
        </button>
      </div>
    </form>
  </div>
</template>
