<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/shared/components/AppSidebar.vue'
const route = useRoute()

const pageTitle = computed(() => {
  if (route.path.includes('/app/users')) return 'Users'
  if (route.path.includes('/app/tenants')) return 'Tenants'
  if (route.path.includes('/app/teams')) return 'Teams'
  if (route.path.includes('/app/companies')) return 'Companies'
  if (route.path.includes('/app/contacts/')) return 'Contact Detail'
  if (route.path.includes('/app/contacts')) return 'Contacts'
  return 'Dashboard'
})
</script>

<template>
  <div class="min-h-screen bg-[var(--rc-bg)]">
    <div class="flex min-h-screen">
      <AppSidebar />
      <div class="flex-1">
        <header class="flex items-center justify-between border-b border-[var(--rc-border-soft)] bg-white px-6 py-4">
          <div>
            <h1 class="text-base font-semibold text-slate-800">{{ pageTitle }}</h1>
            <p class="text-xs text-slate-500">Welcome to RC Console</p>
          </div>
          <div class="flex items-center gap-2">
            <input class="rounded-lg border border-[var(--rc-border)] bg-slate-50 px-3 py-1.5 text-sm" placeholder="Search..." />
          </div>
        </header>
        <main class="p-6">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>
