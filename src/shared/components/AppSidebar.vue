<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { hasAnyPermission, hasAnyRole } from '@/modules/auth/composables/useCapabilities'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useNavigationStore } from '@/modules/auth/store/navigation.store'
import logo from '@/assets/logo.png'

const props = defineProps<{
  collapsed?: boolean
}>()

const route = useRoute()
const router = useRouter()
const { isGlobalAdmin, isCompanyAdmin, isResellerUser, canManageResellerTeam } = useAuth()
const authStore = useAuthStore()
const navigationStore = useNavigationStore()

type NavItem = { to: string; label: string; icon: string; permission?: string }
type NavAudience = 'tenant' | 'partner' | 'all'
type PrmFeatureChannel = 'tenant' | 'partner' | 'either'

const common: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/app/contacts', label: 'Contacts', icon: 'users' },
  { to: '/app/companies', label: 'Companies', icon: 'building' },
  { to: '/app/deals', label: 'Deals', icon: 'briefcase' },
  { to: '/app/demo-links', label: 'Demo Links', icon: 'link', permission: 'demo_links.view' },
  { to: '/app/settings/email', label: 'Email Settings', icon: 'mail', permission: 'email_settings.view' },
  { to: '/app/tasks', label: 'Tasks', icon: 'checkSquare', permission: 'tasks.view' },
  { to: '/app/products', label: 'Products', icon: 'box' },
  { to: '/app/collaterals', label: 'Collaterals', icon: 'fileText' },
  { to: '/app/quotes', label: 'Quotes', icon: 'receipt' },
  { to: '/app/payments', label: 'Payments', icon: 'creditCard' },
  { to: '/app/invoices', label: 'Invoices', icon: 'fileInvoice' },
  { to: '/app/organizations', label: 'Partners & resellers', icon: 'network' },
]

const companyAdminExtras: NavItem[] = [
  { to: '/app/users', label: 'Users', icon: 'userCog' },
  { to: '/app/teams', label: 'Teams', icon: 'team' },
  { to: '/app/settings/payment', label: 'Payment Settings', icon: 'settings' },
  { to: '/app/settings/audit-logs', label: 'Audit Logs', icon: 'fileText', permission: 'audit.view' },
]

const globalAdminExtras: NavItem[] = [{ to: '/app/tenants', label: 'Tenants', icon: 'globe' }]

/** PRM-only routes appended after base CRM nav (additive). */
const prmAddonCandidates: Array<
  NavItem & {
    featureFlag?: string
    audience: NavAudience
  }
> = [
  { to: '/app/prm/programs', label: 'PRM Programs', icon: 'briefcase', featureFlag: 'prm_enabled', audience: 'tenant' },
  { to: '/app/prm/program-enrollments', label: 'PRM Enrollments', icon: 'box', featureFlag: 'prm_enabled', audience: 'tenant' },
  { to: '/app/prm/my-program', label: 'My Program', icon: 'briefcase', featureFlag: 'prm_enabled', audience: 'partner' },
  { to: '/app/prm/commissions', label: 'PRM Commissions', icon: 'receipt', featureFlag: 'prm_enabled', audience: 'all' },
  { to: '/app/prm/payouts', label: 'Payouts', icon: 'creditCard', featureFlag: 'prm_enabled', audience: 'tenant' },
  { to: '/app/prm/partner-payouts', label: 'My payouts', icon: 'creditCard', featureFlag: 'prm_enabled', audience: 'partner' },
  { to: '/app/prm/reseller-payouts', label: 'My payouts', icon: 'creditCard', featureFlag: 'prm_enabled', audience: 'partner' },
  { to: '/app/prm/licenses', label: 'PRM Licenses', icon: 'fileText', featureFlag: 'prm_enabled', audience: 'all' },
  { to: '/app/prm/resources', label: 'Resource Center', icon: 'fileText', featureFlag: 'prm_enabled', audience: 'all' },
]

function audienceOk(audience: NavAudience): boolean {
  if (audience === 'all') return isTenantAdminUser() || isPartnerChannelUser()
  if (audience === 'tenant') return isTenantAdminUser()
  return isPartnerChannelUser()
}

function isPartnerChannelUser(): boolean {
  const u = authStore.user
  if (!u) return false
  const profile = (u.navigation_profile || '').toLowerCase()
  if (profile.includes('partner') || profile.includes('reseller')) return true
  const r = u.role || ''
  return r.startsWith('partner_') || r.startsWith('reseller_')
}

function isTenantAdminUser(): boolean {
  return hasAnyRole(authStore.user, ['global_admin', 'company_admin'])
}

function mergedFlags(): Record<string, boolean> {
  return navigationStore.mergedFeatureFlags
}

/** Explicit false hides; true shows; unset preserves legacy visibility for that audience. */
function allowsPrmFeature(key: string | undefined, channel: PrmFeatureChannel): boolean {
  const flags = mergedFlags()
  if (key && flags[key] === false) return false
  if (key && flags[key] === true) return true
  if (channel === 'either') return isTenantAdminUser() || isPartnerChannelUser()
  return channel === 'tenant' ? isTenantAdminUser() : isPartnerChannelUser()
}

function prmFeatureChannel(audience: NavAudience): PrmFeatureChannel {
  if (audience === 'tenant') return 'tenant'
  if (audience === 'partner') return 'partner'
  return 'either'
}

function visiblePrmAddons(): NavItem[] {
  const u = authStore.user
  if (!u) return []
  const out: NavItem[] = []
  const seenTo = new Set<string>()

  for (const item of prmAddonCandidates) {
    if (item.to === '/app/prm/reseller-payouts' && !isResellerUser.value) continue
    if (item.to === '/app/prm/partner-payouts' && isResellerUser.value) continue
    if (!audienceOk(item.audience)) continue
    const channel = prmFeatureChannel(item.audience)
    if (!allowsPrmFeature(item.featureFlag, channel)) continue
    if (seenTo.has(item.to)) continue
    seenTo.add(item.to)
    out.push({ to: item.to, label: item.label, icon: item.icon })
  }
  return out
}

const resellerTeamLink = computed((): NavItem | null => {
  const orgId = authStore.user?.organization_id
  if (!orgId || !canManageResellerTeam.value) return null
  if (!hasAnyRole(authStore.user, ['reseller_admin', 'global_admin', 'company_admin', 'partner_admin'])) return null
  return { to: `/app/organizations/${orgId}/team`, label: 'Reseller team', icon: 'team' }
})

const menuItems = computed(() => {
  const filterNav = (items: NavItem[]) =>
    items.filter((item) => !item.permission || hasAnyPermission(authStore.user, [item.permission]))

  let base: NavItem[] = []
  if (isGlobalAdmin.value) base = filterNav([...common, ...companyAdminExtras, ...globalAdminExtras])
  else if (isCompanyAdmin.value) base = filterNav([...common, ...companyAdminExtras])
  else if (isResellerUser.value) {
    base = common.filter((item) => {
      if (hasAnyRole(authStore.user, ['reseller_sales_consultant']) && item.to === '/app/organizations') return false
      return true
    })
    const extras: NavItem[] = [{ to: '/app/prm/reseller-dashboard', label: 'Reseller dashboard', icon: 'grid' }]
    const team = resellerTeamLink.value
    if (team) extras.push(team)
    base = filterNav([...base, ...extras])
  } else if (isPartnerChannelUser()) base = filterNav([...common])
  else base = filterNav([...common])

  const baseTos = new Set(base.map((i) => i.to))
  const addons = visiblePrmAddons().filter((i) => !baseTos.has(i.to))
  return [...base, ...addons]
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
        :key="item.to + item.label"
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
          <svg v-else-if="item.icon === 'checkSquare'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
          <svg v-else-if="item.icon === 'briefcase'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m-8 0h10a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2z"/></svg>
          <svg v-else-if="item.icon === 'box'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8 4-8-4m16 0l-8-4-8 4m16 0v10l-8 4m-8-14v10l8 4m0-10v10"/></svg>
          <svg v-else-if="item.icon === 'fileText'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2v6h6"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 13H8M16 17H8M10 9H8"/></svg>
          <svg v-else-if="item.icon === 'receipt'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14h6M9 10h6M9 18h6M7 3h10a1 1 0 011 1v16l-2-1-2 1-2-1-2 1-2-1-2 1V4a1 1 0 011-1z"/></svg>
          <svg v-else-if="item.icon === 'creditCard'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="5" width="20" height="14" rx="2" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 10h20"/></svg>
          <svg v-else-if="item.icon === 'fileInvoice'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8M8 11h8M8 15h5"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 3h8l4 4v14a1 1 0 01-1 1H7a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>
          <svg v-else-if="item.icon === 'network'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="5" r="2" stroke-width="2"/><circle cx="5" cy="19" r="2" stroke-width="2"/><circle cx="19" cy="19" r="2" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v5M12 12l-7 5M12 12l7 5"/></svg>
          <svg v-else-if="item.icon === 'settings'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317a1 1 0 011.35-.936l.862.345a1 1 0 00.927-.073l.79-.527a1 1 0 011.296.115l.707.707a1 1 0 01.115 1.296l-.527.79a1 1 0 00-.073.927l.345.862a1 1 0 01-.936 1.35h-1a1 1 0 00-.95.684l-.315.946a1 1 0 01-1.9 0l-.315-.946a1 1 0 00-.95-.684h-1a1 1 0 01-.936-1.35l.345-.862a1 1 0 00-.073-.927l-.527-.79a1 1 0 01.115-1.296l.707-.707a1 1 0 011.296-.115l.79.527a1 1 0 00.927.073l.862-.345z"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
          <svg v-else-if="item.icon === 'globe'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3a9 9 0 100 18 9 9 0 000-18"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3a15 15 0 010 18"/></svg>
          <svg v-else-if="item.icon === 'link'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656-5.656l1.414-1.414"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.172 13.828a4 4 0 010-5.656l1.414-1.414a4 4 0 015.656 5.656l-1.414 1.414"/></svg>
          <svg v-else-if="item.icon === 'mail'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
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
  background: #4338ca;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 0.8rem; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 0.7rem; color: #4b5563; }

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #4b5563;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  display: flex;
  align-items: center;
}
.logout-btn:hover { color: #b91c1c; background: #fee2e2; }
</style>
