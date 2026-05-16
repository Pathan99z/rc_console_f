<script setup lang="ts">
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'

defineProps<{
  item: OrganizationItem
  canManage: boolean
  busy: (action: 'approve' | 'reject' | 'suspend' | 'status', id: number) => boolean
}>()

const emit = defineEmits<{
  (e: 'approve', id: number): void
  (e: 'reject', id: number): void
  (e: 'suspend', id: number): void
  (e: 'toggle-status', payload: { id: number; nextStatus: 'active' | 'inactive' }): void
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-if="item.onboarding_status === 'pending_review' || item.onboarding_status === 'draft'"
      class="rounded border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800"
      :disabled="!canManage || busy('approve', item.id)"
      @click="emit('approve', item.id)"
    >
      Approve reseller
    </button>
    <button class="rounded border px-3 py-1.5 text-xs" :disabled="!canManage || busy('reject', item.id)" @click="emit('reject', item.id)">
      Reject
    </button>
    <button class="rounded border px-3 py-1.5 text-xs" :disabled="!canManage || busy('suspend', item.id)" @click="emit('suspend', item.id)">
      Suspend
    </button>
    <button
      class="rounded border px-3 py-1.5 text-xs"
      :disabled="!canManage || busy('status', item.id)"
      @click="emit('toggle-status', { id: item.id, nextStatus: item.status === 'active' ? 'inactive' : 'active' })"
    >
      Set {{ item.status === 'active' ? 'inactive' : 'active' }}
    </button>
  </div>
</template>
