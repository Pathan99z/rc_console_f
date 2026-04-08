<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    type?: string
    placeholder?: string
    error?: string
    autocomplete?: string
    disabled?: boolean
    showStrength?: boolean
  }>(),
  {
    type: 'text',
    placeholder: '',
    error: '',
    autocomplete: 'off',
    disabled: false,
    showStrength: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const reveal = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value ? (reveal.value ? 'text' : 'password') : props.type))

const strength = computed(() => {
  if (!props.showStrength) return null
  const p = props.modelValue || ''
  let score = 0
  if (p.length >= 8) score += 1
  if (/[A-Z]/.test(p)) score += 1
  if (/[0-9]/.test(p)) score += 1
  if (/[^A-Za-z0-9]/.test(p)) score += 1
  if (!p) return { score: 0, label: '', color: '#e5e7eb' }
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' }
  if (score === 2) return { score, label: 'Fair', color: '#f59e0b' }
  if (score === 3) return { score, label: 'Good', color: '#eab308' }
  return { score, label: 'Strong', color: '#22c55e' }
})
</script>

<template>
  <label class="rc-field">
    <span class="rc-field-label">{{ label }}</span>
    <div class="rc-field-wrap">
      <input
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :class="['rc-input', { 'rc-input--error': error, 'rc-input--password': isPassword }]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button v-if="isPassword" type="button" class="rc-field-toggle" @click="reveal = !reveal">
        {{ reveal ? 'Hide' : 'Show' }}
      </button>
    </div>
    <span v-if="error" class="rc-field-error">{{ error }}</span>

    <div v-if="strength && showStrength && modelValue" class="rc-strength">
      <div class="rc-strength-bars">
        <span v-for="i in 4" :key="i" class="rc-strength-bar" :style="{ backgroundColor: i <= strength.score ? strength.color : '#e5e7eb' }" />
      </div>
      <span class="rc-strength-text" :style="{ color: strength.color }">{{ strength.label }}</span>
    </div>
  </label>
</template>
