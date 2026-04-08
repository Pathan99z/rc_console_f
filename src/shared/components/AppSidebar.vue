<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import logo from '@/assets/logo.png'

const route = useRoute()
const router = useRouter()
const { isGlobalAdmin, isCompanyAdmin } = useAuth()
const authStore = useAuthStore()

const menuItems = computed(() => {
  const common = [
    { to: '/app/dashboard', label: 'Dashboard', icon: 'grid' },
    { to: '/app/contacts', label: 'Contacts', icon: 'users' },
    { to: '/app/companies', label: 'Companies', icon: 'building' },
  ]
  const companyAdminExtras = [
    { to: '/app/users', label: 'Users', icon: 'userCog' },
    { to: '/app/teams', label: 'Teams', icon: 'team' },
  ]
  const globalAdminExtras = [{ to: '/app/tenants', label: 'Tenants', icon: 'globe' }]

  if (isGlobalAdmin.value) return [...common, ...companyAdminExtras, ...globalAdminExtras]
  if (isCompanyAdmin.value) return [...common, ...companyAdminExtras]
  return common
})

const userInitials = computed(() => {
  const name = authStore.user?.name || 'User'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="flex min-h-screen w-64 flex-col border-r border-[var(--rc-border-soft)] bg-white">
    <div class="flex items-center gap-2 border-b border-[var(--rc-border-soft)] px-4 py-4">
      <img :src="logo" alt="RC Console" class="h-8 w-8 object-contain" />
      <p class="text-xl font-bold text-gradient">Console</p>
    </div>
    <nav class="flex-1 space-y-1 p-3">
      <RouterLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        :class="{ 'bg-indigo-50 text-indigo-700': route.path === item.to || route.path.startsWith(`${item.to}/`) }"
      >
        <span class="h-4 w-4">
          <svg v-if="item.icon === 'grid'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>
          <svg v-else-if="item.icon === 'users'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          <svg v-else-if="item.icon === 'userCog'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM3 21a6 6 0 1112 0M19.4 15a1 1 0 011.2 1.2l.8.3a1 1 0 010 1l-.8.3a1 1 0 01-1.2 1.2l-.3.8a1 1 0 01-1 0l-.3-.8a1 1 0 01-1.2-1.2l-.8-.3a1 1 0 010-1l.8-.3a1 1 0 011.2-1.2l.3-.8a1 1 0 011 0l.3.8z"/></svg>
          <svg v-else-if="item.icon === 'team'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.36-1.86M17 20H7m10 0v-2c0-.65-.13-1.28-.36-1.86M7 20H2v-2a3 3 0 015.36-1.86M7 20v-2c0-.65.13-1.28.36-1.86M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <svg v-else-if="item.icon === 'building'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M5 21V7l8-4 6 3v15M9 9h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m6 0h6M15 21h6m-6-2v2M3 12h18M3 19h12"/></svg>
        </span>
        {{ item.label }}
      </RouterLink>
    </nav>
    <div class="border-t border-[var(--rc-border-soft)] p-3">
      <div class="flex items-center gap-2 rounded-lg px-2 py-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
          {{ userInitials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-slate-900">{{ authStore.user?.name || 'User' }}</p>
          <p class="text-xs text-slate-500">{{ authStore.user?.role || 'member' }}</p>
        </div>
        <button class="rounded border px-2 py-1 text-xs hover:bg-red-50 hover:text-red-600" @click="logout">Logout</button>
      </div>
    </div>
  </aside>
</template>
