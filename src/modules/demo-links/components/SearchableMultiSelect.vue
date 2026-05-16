<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

export type MultiSelectOption = {
  id: number
  label: string
  meta?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: number[]
    options: MultiSelectOption[]
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    placeholder: 'Select items…',
    searchPlaceholder: 'Search…',
    emptyText: 'No options available',
    loading: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const open = ref(false)
const query = ref('')
const rootRef = ref<HTMLElement | null>(null)

const selectedOptions = computed(() =>
  props.options.filter((opt) => props.modelValue.includes(opt.id)),
)

const filteredOptions = computed(() => {
  const q = query.value.trim().toLowerCase()
  return props.options.filter((opt) => {
    if (props.modelValue.includes(opt.id)) return false
    if (!q) return true
    const hay = `${opt.label} ${opt.meta || ''}`.toLowerCase()
    return hay.includes(q)
  })
})

function toggleDropdown() {
  if (props.disabled || props.loading) return
  open.value = !open.value
  if (open.value) query.value = ''
}

function addOption(id: number) {
  if (props.modelValue.includes(id)) return
  emit('update:modelValue', [...props.modelValue, id])
  query.value = ''
}

function removeOption(id: number) {
  emit(
    'update:modelValue',
    props.modelValue.filter((x) => x !== id),
  )
}

function onClickOutside(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="rootRef" class="relative">
    <div
      class="min-h-[2.5rem] cursor-text rounded-lg border border-[var(--rc-border-soft)] bg-white px-2 py-1.5 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
      :class="disabled || loading ? 'cursor-not-allowed opacity-60' : ''"
      @click="toggleDropdown"
    >
      <div v-if="loading" class="flex gap-2 p-1">
        <span class="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
        <span class="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div v-else-if="!selectedOptions.length" class="px-1 py-1 text-sm text-slate-400">
        {{ placeholder }}
      </div>
      <div v-else class="flex flex-wrap gap-1.5">
        <span
          v-for="opt in selectedOptions"
          :key="opt.id"
          class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
          @click.stop
        >
          {{ opt.label }}<span v-if="opt.meta" class="text-indigo-500">({{ opt.meta }})</span>
          <button
            type="button"
            class="ml-0.5 rounded-full p-0.5 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-800"
            :disabled="disabled"
            aria-label="Remove"
            @click.stop="removeOption(opt.id)"
          >
            ×
          </button>
        </span>
      </div>
    </div>

    <div
      v-if="open && !loading && !disabled"
      class="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-[var(--rc-border-soft)] bg-white shadow-lg"
    >
      <div class="border-b border-slate-100 p-2">
        <input
          v-model="query"
          type="text"
          class="rc-input w-full text-sm"
          :placeholder="searchPlaceholder"
          @click.stop
        />
      </div>
      <ul class="max-h-48 overflow-y-auto py-1">
        <li v-if="!filteredOptions.length" class="px-3 py-2 text-sm text-slate-500">
          {{ query ? 'No matches' : emptyText }}
        </li>
        <li v-for="opt in filteredOptions" :key="opt.id">
          <button
            type="button"
            class="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50"
            @click.stop="addOption(opt.id)"
          >
            <span>{{ opt.label }}</span>
            <span v-if="opt.meta" class="text-xs text-slate-400">{{ opt.meta }}</span>
          </button>
        </li>
      </ul>
    </div>
    </div>
</template>
