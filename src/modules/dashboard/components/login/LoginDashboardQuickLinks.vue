<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { normalizeDashboardLinks } from '@/modules/dashboard/utils/loginDashboardRoutes'

const props = defineProps<{
  links: Record<string, string>
}>()

const authStore = useAuthStore()

const routeContext = computed(() => ({
  organizationId: authStore.user?.organization?.id ?? authStore.user?.organization_id ?? null,
}))

const appLinks = computed(() => normalizeDashboardLinks(props.links, routeContext.value))

function linkLabel(key: string): string {
  return key.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
</script>

<template>
  <section
    v-if="Object.keys(appLinks).length"
    class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-sm"
    aria-label="Quick navigation"
  >
    <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Quick actions</h2>
    <nav class="flex flex-wrap gap-2">
      <RouterLink
        v-for="(path, key) in appLinks"
        :key="key"
        :to="path"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {{ linkLabel(key) }}
        <svg class="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </RouterLink>
    </nav>
  </section>
</template>
