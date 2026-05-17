<script setup lang="ts">
import { ref } from 'vue'
import { copyJsonToClipboard, stringifyJson } from '@/modules/audit-logs/utils/auditLogFormat'

const props = defineProps<{
  title: string
  value: unknown
}>()

const copied = ref(false)

const hasContent = () => {
  const text = stringifyJson(props.value)
  return text.trim().length > 0
}

async function onCopy() {
  const ok = await copyJsonToClipboard(props.value)
  copied.value = ok
  if (ok) {
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<template>
  <section v-if="hasContent()" class="space-y-2">
    <div class="flex items-center justify-between gap-2">
      <h4 class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ title }}</h4>
      <button
        type="button"
        class="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
        @click="onCopy"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </div>
    <pre class="max-h-56 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">{{ stringifyJson(value) }}</pre>
  </section>
</template>
