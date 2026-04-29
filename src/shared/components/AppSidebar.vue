<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import logo from '@/assets/logo.png'

const props = defineProps<{
  collapsed?: boolean
}>()

const route = useRoute()
const router = useRouter()
const { isGlobalAdmin, isCompanyAdmin } = useAuth()
const authStore = useAuthStore()

const menuItems = computed(() => {
  const common = [
    { to: '/app/dashboard', label: 'Dashboard', icon: 'grid' },
    { to: '/app/contacts', label: 'Contacts', icon: 'users' },
    { to: '/app/companies', label: 'Companies', icon: 'building' },
    { to: '/app/deals', label: 'Deals', icon: 'briefcase' },
    { to: '/app/products', label: 'Products', icon: 'box' },
    { to: '/app/collaterals', label: 'Collaterals', icon: 'fileText' },
    { to: '/app/quotes', label: 'Quotes', icon: 'receipt' },
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
  <aside class="sidebar" :class="{ 'sidebar-collapsed': props.collapsed }">
    <div class="sidebar-logo">
      <img :src="logo" alt="RC Console" class="logo-img" />
      <p v-if="!props.collapsed" class="logo-text text-gradient">Console</p>
    </div>
    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: route.path === item.to || route.path.startsWith(`${item.to}/`) }"
      >
        <span class="nav-icon">
          <svg v-if="item.icon === 'grid'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>
          <svg v-else-if="item.icon === 'users'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          <svg v-else-if="item.icon === 'userCog'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM3 21a6 6 0 1112 0M19.4 15a1 1 0 011.2 1.2l.8.3a1 1 0 010 1l-.8.3a1 1 0 01-1.2 1.2l-.3.8a1 1 0 01-1 0l-.3-.8a1 1 0 01-1.2-1.2l-.8-.3a1 1 0 010-1l.8-.3a1 1 0 011.2-1.2l.3-.8a1 1 0 011 0l.3.8z"/></svg>
          <svg v-else-if="item.icon === 'team'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.36-1.86M17 20H7m10 0v-2c0-.65-.13-1.28-.36-1.86M7 20H2v-2a3 3 0 015.36-1.86M7 20v-2c0-.65.13-1.28.36-1.86M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <svg v-else-if="item.icon === 'building'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M5 21V7l8-4 6 3v15M9 9h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1"/></svg>
          <svg v-else-if="item.icon === 'briefcase'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m-8 0h10a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2z"/></svg>
          <svg v-else-if="item.icon === 'box'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8 4-8-4m16 0l-8-4-8 4m16 0v10l-8 4m-8-14v10l8 4m0-10v10"/></svg>
          <svg v-else-if="item.icon === 'fileText'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2v6h6"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 13H8M16 17H8M10 9H8"/></svg>
          <svg v-else-if="item.icon === 'receipt'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14h6M9 10h6M9 18h6M7 3h10a1 1 0 011 1v16l-2-1-2 1-2-1-2 1-2-1-2 1V4a1 1 0 011-1z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m6 0h6M15 21h6m-6-2v2M3 12h18M3 19h12"/></svg>
        </span>
        <span v-if="!props.collapsed" class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
    <div class="sidebar-user">
      <div class="user-avatar">{{ userInitials }}</div>
      <div v-if="!props.collapsed" class="user-info">
        <p class="user-name">{{ authStore.user?.name || 'User' }}</p>
        <p class="user-role">{{ authStore.user?.role || 'member' }}</p>
      </div>

      <button class="logout-btn" @click="logout" title="Sign out">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* Sidebar UI (copied from Dashboard.vue) */
.sidebar {
  width: 248px;
  min-height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e7eaf0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.25s ease;
}

.sidebar-collapsed { width: 74px; }

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #eef1f5;
}

.logo-img { width: 34px; height: 34px; object-fit: contain; flex-shrink: 0; }
.logo-text { font-size: 1.15rem; font-weight: 700; white-space: nowrap; letter-spacing: -0.01em; }

.sidebar-nav {
  flex: 1;
  padding: 0.85rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.62rem 0.8rem;
  border-radius: 0.7rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--rc-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.18s ease;
  text-align: left;
  width: 100%;
  white-space: nowrap;
  text-decoration: none;
}

.nav-item:hover { background: #f5f7fb; color: #334155; }
.nav-item.active { background: #eef2ff; color: #4f46e5; font-weight: 600; }

.nav-icon { flex-shrink: 0; display: flex; }
.nav-icon svg { width: 20px; height: 20px; }
.nav-label { flex: 1; }

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.95rem 1rem;
  border-top: 1px solid #eef1f5;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #6366f1;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 0.8rem; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 0.7rem; color: #9ca3af; }

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  display: flex;
  align-items: center;
}
.logout-btn:hover { color: #ef4444; background: #fee2e2; }
</style>
