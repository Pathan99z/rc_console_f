<script setup lang="ts">
import type { QuoteAttachment } from '@/modules/quotes/types/quote.types'

defineProps<{
  attachments: QuoteAttachment[]
  uploading: boolean
}>()

const emit = defineEmits<{
  (e: 'upload', payload: { name: string; file: File }): void
  (e: 'preview', attachmentId: number): void
}>()

function onUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  emit('upload', { name: file.name, file })
  input.value = ''
}
</script>

<template>
  <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
    <div class="mb-3 flex items-center justify-between">
      <h4 class="font-semibold text-slate-900">Attachments</h4>
      <label class="cursor-pointer rounded border px-3 py-1.5 text-sm">
        <input type="file" class="hidden" :disabled="uploading" @change="onUpload" />
        {{ uploading ? 'Uploading...' : 'Upload' }}
      </label>
    </div>
    <div v-if="attachments.length === 0" class="text-sm text-slate-500">No attachments.</div>
    <div v-else class="space-y-2">
      <div v-for="attachment in attachments" :key="attachment.id" class="flex items-center justify-between rounded border p-2 text-sm">
        <div>
          <p class="font-medium">{{ attachment.name }}</p>
          <p class="text-xs text-slate-500">{{ attachment.file_type }} · {{ attachment.file_size }} bytes</p>
        </div>
        <button class="rounded border px-2 py-1 text-xs" @click="emit('preview', attachment.id)">Preview</button>
      </div>
    </div>
  </div>
</template>
