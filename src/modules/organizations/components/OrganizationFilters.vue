<script setup lang="ts">
import type { OrganizationOnboardingStatus, OrganizationStatus, OrganizationType } from '@/modules/organizations/types/organization.types'

const model = defineModel<{
  search: string
  type: OrganizationType | ''
  onboarding_status: OrganizationOnboardingStatus | ''
  status: OrganizationStatus | ''
}>({ required: true })

const emit = defineEmits<{
  (e: 'apply'): void
  (e: 'clear'): void
}>()
</script>

<template>
  <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <input v-model.trim="model.search" class="rc-input" placeholder="Search legal/display/email..." @keyup.enter="emit('apply')" />
      <select v-model="model.type" class="rc-input" @change="emit('apply')">
        <option value="">All types</option>
        <option value="company">company</option>
        <option value="partner">partner</option>
        <option value="reseller">reseller</option>
      </select>
      <select v-model="model.onboarding_status" class="rc-input" @change="emit('apply')">
        <option value="">All onboarding</option>
        <option value="draft">draft</option>
        <option value="pending_review">pending_review</option>
        <option value="approved">approved</option>
        <option value="active">active</option>
        <option value="suspended">suspended</option>
        <option value="rejected">rejected</option>
      </select>
      <select v-model="model.status" class="rc-input" @change="emit('apply')">
        <option value="">All active status</option>
        <option value="active">active</option>
        <option value="inactive">inactive</option>
      </select>
    </div>
    <div class="mt-3 flex justify-end">
      <button class="rounded border px-3 py-1.5 text-xs" @click="emit('clear')">Clear filters</button>
    </div>
  </div>
</template>
