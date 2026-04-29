<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView } from 'vue-router'
import AppSidebar from '@/shared/components/AppSidebar.vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const sidebarCollapsed = ref(false)
const authStore = useAuthStore()

const userInitials = computed(() => {
  const name = authStore.user?.name || 'User'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})
</script>

<template>
  <div class="min-h-screen bg-[var(--rc-bg)]">
    <div class="flex min-h-screen">
      <AppSidebar :collapsed="sidebarCollapsed" />
      <div class="flex-1">
        <header class="topbar">
          <div class="topbar-left">
            <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed" :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 5h16v14H4z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 5v14" />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                  :d="sidebarCollapsed ? 'M14 12h3m0 0-1.5-1.5M17 12l-1.5 1.5' : 'M13 12h3m-3 0 1.5-1.5M13 12l1.5 1.5'"
                />
              </svg>
            </button>
            <div>
              <h1 class="page-title">Welcome to RC Console</h1>
            </div>
          </div>

          <div class="topbar-right">
            <button class="icon-btn" aria-label="Notifications">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 00-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
              </svg>
            </button>
            <div class="search-wrap">
              <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search..." class="search-input" />
            </div>
            <button class="profile-btn" :aria-label="authStore.user?.name || 'Profile'">
              {{ userInitials }}
            </button>
          </div>
        </header>
        <main class="p-6">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Topbar UI (copied from Dashboard.vue) */
.topbar {
  height: 68px;
  background: #ffffff;
  border-bottom: 1px solid #e7eaf0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  gap: 1rem;
  flex-shrink: 0;
}

.topbar-left { display: flex; align-items: center; gap: 1rem; }
.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 6px;
  margin-left: -0.25rem;
  border-radius: 8px;
  transition: background 0.2s;
  display: flex;
}
.collapse-btn:hover { background: #f3f4f6; }
.page-title { font-size: 1rem; font-weight: 500; color: #475569; line-height: 1.2; letter-spacing: -0.003em; }
.topbar-right { display: flex; align-items: center; gap: 0.75rem; }
.icon-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #e3e8ef;
  border-radius: 0.7rem;
  background: #ffffff;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover { background: #f8fafc; color: #334155; }
.search-wrap { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 0.75rem; width: 1rem; height: 1rem; color: #9ca3af; }
.search-input {
  padding: 0.5rem 0.9rem 0.5rem 2.25rem;
  border: 1px solid #e3e8ef;
  border-radius: 0.7rem;
  font-size: 0.8rem;
  background: #fbfcfe;
  outline: none;
  width: 220px;
  color: #374151;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #c7d2fe; background: #ffffff; }
.search-input::placeholder { color: #9ca3af; }
.profile-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #334155;
  border-radius: 999px;
  background: #334155;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.profile-btn:hover { background: #1e293b; border-color: #1e293b; }
</style>
