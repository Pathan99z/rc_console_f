<script setup lang="ts">
import OrganizationStatusBadge from '@/modules/organizations/components/OrganizationStatusBadge.vue'
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'

defineProps<{
  rows: OrganizationItem[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'view', item: OrganizationItem): void
  (e: 'edit', item: OrganizationItem): void
}>()
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-[var(--rc-border-soft)] bg-white">
    <table class="min-w-full divide-y divide-[var(--rc-border-soft)] text-sm">
      <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th class="px-4 py-3 text-left">Legal Name</th>
          <th class="px-4 py-3 text-left">Display Name</th>
          <th class="px-4 py-3 text-left">Type</th>
          <th class="px-4 py-3 text-left">Onboarding</th>
          <th class="px-4 py-3 text-left">Active</th>
          <th class="px-4 py-3 text-left">Parent</th>
          <th class="px-4 py-3 text-left">Email</th>
          <th class="px-4 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[var(--rc-border-soft)]">
        <tr v-if="loading">
          <td colspan="8" class="px-4 py-6 text-center text-slate-500">Loading directory…</td>
        </tr>
        <tr v-else-if="!rows.length">
          <td colspan="8" class="px-4 py-6 text-center text-slate-500">No matching records.</td>
        </tr>
        <tr v-for="item in rows" v-else :key="item.id">
          <td class="px-4 py-3">{{ item.legal_name }}</td>
          <td class="px-4 py-3">{{ item.display_name }}</td>
          <td class="px-4 py-3 capitalize">{{ item.type }}</td>
          <td class="px-4 py-3"><OrganizationStatusBadge :value="item.onboarding_status" kind="onboarding" /></td>
          <td class="px-4 py-3"><OrganizationStatusBadge :value="item.status" kind="status" /></td>
          <td class="px-4 py-3">{{ item.parent?.display_name || '-' }}</td>
          <td class="px-4 py-3">{{ item.email || '-' }}</td>
          <td class="px-4 py-3 text-right">
            <div class="inline-flex gap-2">
              <button class="rounded border px-2 py-1 text-xs" @click="emit('view', item)">View</button>
              <button class="rounded border px-2 py-1 text-xs" @click="emit('edit', item)">Edit</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
