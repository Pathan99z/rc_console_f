<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import DemoLinkStatusBadge from '@/modules/demo-links/components/DemoLinkStatusBadge.vue'
import type { DemoLinkItem } from '@/modules/demo-links/types/demoLink.types'
import {
  formatCheckedAt,
  hasDemoPassword,
  orgDisplayName,
  productTags,
  screenshotSrc,
} from '@/modules/demo-links/utils/demoLinkFormat'

const props = defineProps<{
  link: DemoLinkItem
  checking?: boolean
}>()

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'check-status'): void
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'reveal-password'): void
}>()

const thumb = computed(() => screenshotSrc(props.link))
const tags = computed(() => productTags(props.link))
const perms = computed(() => props.link.permissions || {})
</script>

<template>
  <article class="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--rc-border-soft)] bg-white shadow-sm">
    <div class="relative aspect-[16/10] bg-slate-100">
      <img
        v-if="thumb"
        :src="thumb"
        :alt="link.title"
        class="h-full w-full object-cover"
      />
      <div v-else class="flex h-full items-center justify-center text-slate-400">
        <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <span
        v-if="link.is_active === false"
        class="absolute left-2 top-2 rounded bg-slate-800/80 px-2 py-0.5 text-xs font-semibold text-white"
      >
        Inactive
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h3 class="truncate text-base font-semibold text-slate-900">{{ link.title }}</h3>
          <p v-if="link.description" class="mt-1 line-clamp-2 text-sm text-slate-500">{{ link.description }}</p>
        </div>
        <DemoLinkStatusBadge :status="link.last_status" />
      </div>

      <dl class="space-y-1 text-xs text-slate-600">
        <div class="flex justify-between gap-2">
          <dt class="text-slate-500">Owner</dt>
          <dd class="truncate text-right font-medium text-slate-700">{{ orgDisplayName(link.owner_organization) }}</dd>
        </div>
        <div class="flex justify-between gap-2">
          <dt class="text-slate-500">Username</dt>
          <dd class="truncate text-right">{{ link.demo_username || '—' }}</dd>
        </div>
        <div class="flex justify-between gap-2">
          <dt class="text-slate-500">Password</dt>
          <dd class="text-right">{{ hasDemoPassword(link) ? 'Password set' : 'Not set' }}</dd>
        </div>
        <div class="flex justify-between gap-2">
          <dt class="text-slate-500">Last checked</dt>
          <dd class="text-right">{{ formatCheckedAt(link.last_checked_at) }}</dd>
        </div>
      </dl>

      <div v-if="tags.length" class="flex flex-wrap gap-1">
        <span
          v-for="tag in tags"
          :key="tag"
          class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
        >
          {{ tag }}
        </span>
      </div>

      <div class="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        <button
          v-if="perms.can_open !== false && link.demo_url"
          type="button"
          class="rounded-lg border px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          @click="emit('open')"
        >
          Open Demo
        </button>
        <button
          v-if="perms.can_check_status"
          type="button"
          class="rounded-lg border px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          :disabled="checking"
          @click="emit('check-status')"
        >
          {{ checking ? 'Checking…' : 'Check Status' }}
        </button>
        <RouterLink
          :to="`/app/demo-links/${link.id}`"
          class="rounded-lg border px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          View
        </RouterLink>
        <button
          v-if="perms.can_edit"
          type="button"
          class="rounded-lg border px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
          @click="emit('edit')"
        >
          Edit
        </button>
        <button
          v-if="perms.can_reveal_credentials"
          type="button"
          class="rounded-lg border px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          @click="emit('reveal-password')"
        >
          Reveal Password
        </button>
        <button
          v-if="perms.can_delete"
          type="button"
          class="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
          @click="emit('delete')"
        >
          Delete
        </button>
      </div>
    </div>
  </article>
</template>
