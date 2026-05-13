<script setup lang="ts">
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'

defineProps<{ organization: OrganizationItem }>()
</script>

<template>
  <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
    <h3 class="text-sm font-semibold text-slate-900">Network hierarchy</h3>
    <div class="mt-3 space-y-2 text-sm text-slate-700">
      <p><span class="font-semibold">Current:</span> {{ organization.display_name }} ({{ organization.type }})</p>
      <p><span class="font-semibold">Parent:</span> {{ organization.parent?.display_name || '-' }}</p>
      <div>
        <p class="font-semibold">Children</p>
        <p v-if="!organization.children?.length" class="text-slate-500">No child records in this branch.</p>
        <ul v-else class="mt-1 space-y-1">
          <li v-for="child in organization.children" :key="child.id">
            {{ child.display_name }} ({{ child.type }})
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>
