<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { AuditLookupOption } from '@/modules/audit-logs/composables/useAuditLogFilterLookups'

const props = withDefaults(
  defineProps<{
    modelValue: string
    displayLabel?: string
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    searchFn: (query: string) => Promise<AuditLookupOption[]>
  }>(),
  {
    placeholder: 'Search and select…',
    searchPlaceholder: 'Type to search…',
    emptyText: 'No matches found',
    disabled: false,
    displayLabel: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:displayLabel', value: string): void
}>()

const open = ref(false)
const query = ref('')
const options = ref<AuditLookupOption[]>([])
const searching = ref(false)
const rootRef = ref<HTMLElement | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | undefined

const selectedText = computed(() => {
  if (props.displayLabel) return props.displayLabel
  if (!props.modelValue) return ''
  const match = options.value.find((o) => String(o.id) === props.modelValue)
  return match?.label || `ID ${props.modelValue}`
})

async function runSearch() {
  if (props.disabled) return
  searching.value = true
  try {
    options.value = await props.searchFn(query.value)
  } finally {
    searching.value = false
  }
}

function scheduleSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void runSearch()
  }, 300)
}

function toggleOpen() {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    query.value = ''
    void runSearch()
  }
}

function selectOption(opt: AuditLookupOption) {
  emit('update:modelValue', String(opt.id))
  emit('update:displayLabel', opt.label)
  open.value = false
  query.value = ''
}

function clearSelection(event: Event) {
  event.stopPropagation()
  emit('update:modelValue', '')
  emit('update:displayLabel', '')
  query.value = ''
}

function onClickOutside(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) open.value = false
}

watch(query, () => {
  if (!open.value) return
  scheduleSearch()
})

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div ref="rootRef" class="relative">
    <div
      class="flex min-h-[2.5rem] cursor-pointer items-center justify-between gap-2 rounded-lg border border-[var(--rc-border-soft)] bg-white px-3 py-2 text-sm transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
      :class="disabled ? 'cursor-not-allowed opacity-60' : ''"
      @click="toggleOpen"
    >
      <span v-if="modelValue" class="truncate text-slate-800">{{ selectedText }}</span>
      <span v-else class="text-slate-400">{{ placeholder }}</span>
      <div class="flex shrink-0 items-center gap-1">
        <button
          v-if="modelValue && !disabled"
          type="button"
          class="rounded px-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Clear selection"
          @click="clearSelection"
        >
          ×
        </button>
        <span class="text-xs text-slate-400">{{ open ? '▲' : '▼' }}</span>
      </div>
    </div>

    <div
      v-if="open"
      class="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
      @click.stop
    >
      <div class="border-b border-slate-100 p-2">
        <input
          v-model="query"
          type="text"
          class="rc-input w-full text-sm"
          :placeholder="searchPlaceholder"
          autofocus
          @keydown.enter.prevent="options[0] && selectOption(options[0])"
        />
      </div>
      <div class="max-h-52 overflow-y-auto">
        <p v-if="searching" class="px-3 py-2 text-xs text-slate-500">Searching…</p>
        <p v-else-if="!options.length" class="px-3 py-2 text-xs text-slate-500">{{ emptyText }}</p>
        <button
          v-for="opt in options"
          v-else
          :key="String(opt.id)"
          type="button"
          class="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-indigo-50"
          @click="selectOption(opt)"
        >
          <span class="font-medium text-slate-800">{{ opt.label }}</span>
          <span v-if="opt.meta" class="text-xs text-slate-500">{{ opt.meta }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
