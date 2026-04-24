<script setup lang="ts">
import type { ContactItem } from '@/modules/contacts/services/contacts.api'
import type { DealItem } from '@/modules/deals/services/deals.api'

defineProps<{
  status: number | ''
  contactId: number | ''
  dealId: number | ''
  fromDate: string
  toDate: string
  contacts: ContactItem[]
  deals: DealItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:status', value: number | ''): void
  (e: 'update:contactId', value: number | ''): void
  (e: 'update:dealId', value: number | ''): void
  (e: 'update:fromDate', value: string): void
  (e: 'update:toDate', value: string): void
  (e: 'apply'): void
  (e: 'reset'): void
}>()

function toOptionalNumber(value: string): number | '' {
  if (value === '') return ''
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : ''
}
</script>

<template>
  <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <select class="rc-input" :value="status" @change="emit('update:status', toOptionalNumber(($event.target as HTMLSelectElement).value))">
        <option value="">All status</option>
        <option :value="0">draft</option>
        <option :value="1">sent</option>
        <option :value="2">accepted</option>
        <option :value="3">rejected</option>
      </select>

      <select class="rc-input" :value="contactId" @change="emit('update:contactId', toOptionalNumber(($event.target as HTMLSelectElement).value))">
        <option value="">All contacts</option>
        <option v-for="contact in contacts" :key="contact.id" :value="contact.id">{{ contact.first_name }} {{ contact.last_name }}</option>
      </select>

      <select class="rc-input" :value="dealId" @change="emit('update:dealId', toOptionalNumber(($event.target as HTMLSelectElement).value))">
        <option value="">All deals</option>
        <option v-for="deal in deals" :key="deal.id" :value="deal.id">{{ deal.name }}</option>
      </select>

      <input class="rc-input" type="date" :value="fromDate" @input="emit('update:fromDate', ($event.target as HTMLInputElement).value)" />
      <input class="rc-input" type="date" :value="toDate" @input="emit('update:toDate', ($event.target as HTMLInputElement).value)" />
    </div>
    <div class="mt-3 flex gap-2">
      <button class="rounded border px-3 py-1.5 text-sm" :disabled="loading" @click="emit('apply')">Apply</button>
      <button class="rounded border px-3 py-1.5 text-sm" :disabled="loading" @click="emit('reset')">Reset</button>
    </div>
  </div>
</template>
