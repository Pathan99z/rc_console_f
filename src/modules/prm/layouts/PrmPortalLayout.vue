<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { usePrmStore } from '@/modules/prm/store/prm.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const prmStore = usePrmStore()

const fallbackNav = [
  { key: 'dashboard', label: 'Dashboard', route: '/partner/dashboard' },
  { key: 'leads', label: 'Leads', route: '/partner/leads' },
  { key: 'opportunities', label: 'Opportunities', route: '/partner/opportunities' },
  { key: 'resources', label: 'Resources', route: '/partner/resources' },
  { key: 'commissions', label: 'Commissions', route: '/partner/commissions' },
  { key: 'licenses', label: 'Licenses', route: '/partner/licenses' },
]

const navItems = computed(() => (prmStore.partnerNavItems.length ? prmStore.partnerNavItems : fallbackNav))

onMounted(async () => {
  try {
    await prmStore.fetchPartnerNavigation()
  } catch {
    /* fallback nav */
  }
})

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[var(--rc-bg)]">
    <div class="flex min-h-screen">
      <aside class="flex w-56 shrink-0 flex-col border-r border-[var(--rc-border-soft)] bg-white">
        <div class="border-b border-[var(--rc-border-soft)] px-4 py-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Partner portal</p>
          <p class="mt-1 truncate text-sm font-semibold text-slate-900">{{ authStore.user?.name }}</p>
        </div>
        <nav class="flex flex-1 flex-col gap-0.5 p-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.key"
            :to="item.route"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            :class="{ 'bg-indigo-50 text-indigo-700': isActive(item.route) }"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
        <div class="border-t border-[var(--rc-border-soft)] p-2">
          <RouterLink to="/app/dashboard" class="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Main CRM
          </RouterLink>
          <button type="button" class="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50" @click="logout">
            Sign out
          </button>
        </div>
      </aside>
      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex h-14 shrink-0 items-center border-b border-[var(--rc-border-soft)] bg-white px-6">
          <h1 class="text-sm font-semibold text-slate-800">PRM</h1>
        </header>
        <main class="flex-1 p-6">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>
