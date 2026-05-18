<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/shared/components/AppSidebar.vue'
import NotificationBell from '@/modules/notifications/components/NotificationBell.vue'
import UserProfileMenu from '@/modules/auth/components/UserProfileMenu.vue'
import OnboardingPendingScreen from '@/shared/components/OnboardingPendingScreen.vue'
import { onboardingBlocked, setOnboardingBlocked } from '@/modules/auth/composables/useOnboardingGate'
import { tryShowPendingLoginWelcome } from '@/modules/auth/utils/loginWelcome'

const sidebarCollapsed = ref(false)
const route = useRoute()

const crmPaths = ['/app/contacts', '/app/companies', '/app/deals', '/app/quotes', '/app/payments', '/app/invoices']

const showOnboardingGate = computed(() => {
  if (!onboardingBlocked.value) return false
  return crmPaths.some((p) => route.path === p || route.path.startsWith(`${p}/`))
})

function onOnboardingBlocked() {
  setOnboardingBlocked(true)
}

onMounted(() => {
  tryShowPendingLoginWelcome()
  globalThis.addEventListener('rc:onboarding-blocked', onOnboardingBlocked)
})

onUnmounted(() => {
  globalThis.removeEventListener('rc:onboarding-blocked', onOnboardingBlocked)
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
            <NotificationBell />
            <div class="search-wrap">
              <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search..." class="search-input" />
            </div>
            <UserProfileMenu />
          </div>
        </header>
        <main class="p-6">
          <OnboardingPendingScreen v-if="showOnboardingGate" />
          <RouterView v-else />
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
</style>
