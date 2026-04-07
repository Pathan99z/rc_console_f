<template>
  <div class="dashboard-shell">

    <!-- ══════════════════════════════════════
         SIDEBAR
    ══════════════════════════════════════ -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">

      <!-- Logo -->
      <div class="sidebar-logo">
        <img :src="logo" alt="RC" class="logo-img" />
        <span v-if="!sidebarCollapsed" class="logo-text text-gradient">Console</span>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: activeNav === item.id }"
          @click="activeNav = item.id"
          :title="sidebarCollapsed ? item.label : ''"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          <span v-if="!sidebarCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </button>
      </nav>

      <!-- User at bottom -->
      <div class="sidebar-user">
        <div class="user-avatar">{{ userInitials }}</div>
        <div v-if="!sidebarCollapsed" class="user-info">
          <p class="user-name">{{ userName }}</p>
          <p class="user-role">Administrator</p>
        </div>
        <button
          v-if="!sidebarCollapsed"
          class="logout-btn"
          @click="logout"
          title="Sign out"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>

    <!-- ══════════════════════════════════════
         MAIN AREA
    ══════════════════════════════════════ -->
    <div class="main-area">

      <!-- Top bar -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 class="page-title">{{ currentPage.label }}</h1>
            <p class="page-sub">Welcome back, {{ userName }}</p>
          </div>
        </div>

        <div class="topbar-right">
          <!-- Search -->
          <div class="search-wrap">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search…" class="search-input" />
          </div>

          <!-- Notifications -->
          <button class="icon-btn relative">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="notif-dot"></span>
          </button>

          <!-- Avatar -->
          <div class="topbar-avatar">{{ userInitials }}</div>
        </div>
      </header>

      <!-- Page content -->
      <main class="content">

        <!-- ── Stats Row ── -->
        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-card">
            <div class="stat-top">
              <span class="stat-label">{{ stat.label }}</span>
              <div class="stat-icon-wrap">
                <span v-html="stat.icon"></span>
              </div>
            </div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-change" :class="stat.up ? 'up' : 'down'">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                  :d="stat.up ? 'M5 10l7-7 7 7' : 'M19 14l-7 7-7-7'" />
              </svg>
              {{ stat.change }} vs last month
            </div>
          </div>
        </div>

        <!-- ── Two-column: Chart + Activity ── -->
        <div class="mid-grid">

          <!-- Revenue Chart -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Monthly Revenue</h3>
              <span class="badge-metric">+18.4% MoM</span>
            </div>
            <div class="bar-chart">
              <div
                v-for="(bar, i) in barData"
                :key="i"
                class="bar-col"
              >
                <div
                  class="bar"
                  :style="`height: ${bar.h}%; opacity: ${0.5 + i * 0.07}`"
                ></div>
                <span class="bar-label">{{ bar.month }}</span>
              </div>
            </div>
          </div>

          <!-- Tier Distribution -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Tier Distribution</h3>
            </div>
            <div class="tier-list">
              <div v-for="tier in tiers" :key="tier.label" class="tier-row">
                <div class="tier-info">
                  <span class="tier-dot" :style="`background: ${tier.color}`"></span>
                  <span class="tier-name">{{ tier.label }}</span>
                </div>
                <div class="tier-bar-wrap">
                  <div class="tier-bar-track">
                    <div
                      class="tier-bar-fill"
                      :style="`width: ${tier.pct}%; background: ${tier.color}`"
                    ></div>
                  </div>
                  <span class="tier-pct">{{ tier.pct }}%</span>
                </div>
              </div>
            </div>

            <!-- Quick pills -->
            <div class="pill-row">
              <span v-for="pill in pills" :key="pill.text" class="pill">
                {{ pill.text }}
              </span>
            </div>
          </div>
        </div>

        <!-- ── Recent Transactions ── -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recent Transactions</h3>
            <button class="text-btn">View all →</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Partner / Reseller</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in transactions" :key="tx.id">
                  <td>
                    <div class="td-name">
                      <div class="td-avatar" :style="`background: ${tx.color}`">{{ tx.initials }}</div>
                      <div>
                        <p class="td-title">{{ tx.name }}</p>
                        <p class="td-sub">{{ tx.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td><span class="type-badge" :style="`color: ${tx.typeColor}; background: ${tx.typeColor}15`">{{ tx.type }}</span></td>
                  <td class="td-amount">{{ tx.amount }}</td>
                  <td class="td-date">{{ tx.date }}</td>
                  <td>
                    <span class="status-badge" :class="tx.status.toLowerCase()">{{ tx.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/logo.png'

const router = useRouter()
const sidebarCollapsed = ref(false)
const activeNav = ref('overview')

const userName = localStorage.getItem('userName') || 'Admin User'
const userInitials = computed(() =>
  userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
)

const navItems = [
  {
    id: 'overview', label: 'Overview',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
  },
  {
    id: 'sales', label: 'Sales',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
    badge: '12',
  },
  {
    id: 'partners', label: 'Partners',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  },
  {
    id: 'resellers', label: 'Resellers',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>',
  },
  {
    id: 'reports', label: 'Reports',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
  },
  {
    id: 'settings', label: 'Settings',
    icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
  },
]

const currentPage = computed(() => navItems.find(n => n.id === activeNav.value) || navItems[0])

const stats = [
  { label: 'Total Revenue', value: '$2.4M', change: '+12%', up: true, icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' },
  { label: 'Active Partners', value: '284', change: '+8%', up: true, icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' },
  { label: 'Resellers', value: '1,248', change: '+18%', up: true, icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>' },
  { label: 'Transactions', value: '5,621', change: '+24%', up: true, icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>' },
]

const barData = [
  { h: 38, month: 'Jan' }, { h: 60, month: 'Feb' }, { h: 45, month: 'Mar' },
  { h: 78, month: 'Apr' }, { h: 58, month: 'May' }, { h: 90, month: 'Jun' },
  { h: 70, month: 'Jul' },
]

const tiers = [
  { label: 'Internal Sales', color: '#64748b', pct: 40 },
  { label: 'Partners', color: '#94a3b8', pct: 35 },
  { label: 'Resellers', color: '#cbd5e1', pct: 25 },
]

const pills = [
  { text: 'RBAC Active' },
  { text: 'Realtime' },
  { text: 'Secure' },
]

const transactions = [
  { id: 1, name: 'Acme Corp', email: 'billing@acme.com', type: 'Partner', typeColor: '#5b21b6', amount: '$12,400', date: '25 Mar 2026', status: 'Paid', initials: 'AC', color: '#eef2ff' },
  { id: 2, name: 'BrightEdge Ltd', email: 'accounts@brightedge.io', type: 'Reseller', typeColor: '#4c1d95', amount: '$8,750', date: '24 Mar 2026', status: 'Paid', initials: 'BE', color: '#f5f3ff' },
  { id: 3, name: 'Nova Systems', email: 'finance@nova.co.za', type: 'Partner', typeColor: '#6d28d9', amount: '$21,000', date: '23 Mar 2026', status: 'Pending', initials: 'NS', color: '#ede9fe' },
  { id: 4, name: 'Summit Tech', email: 'pay@summittech.com', type: 'Reseller', typeColor: '#5b21b6', amount: '$5,300', date: '22 Mar 2026', status: 'Paid', initials: 'ST', color: '#f3f4f6' },
  { id: 5, name: 'Vertex Group', email: 'ar@vertexgroup.net', type: 'Internal', typeColor: '#475569', amount: '$33,200', date: '21 Mar 2026', status: 'Overdue', initials: 'VG', color: '#f1f5f9' },
]

function logout() {
  localStorage.removeItem('isAuth')
  localStorage.removeItem('userName')
  router.push('/login')
}
</script>

<style scoped>
/* ── Shell ── */
.dashboard-shell {
  display: flex;
  min-height: 100vh;
  background: #f5f6fa;
}

/* ── Sidebar ── */
.sidebar {
  width: 248px;
  min-height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e7eaf0;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  flex-shrink: 0;
}
.sidebar-collapsed {
  width: 74px;
}

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
}
.nav-item:hover { background: #f5f7fb; color: #334155; }
.nav-item.active { background: #eef2ff; color: #4f46e5; font-weight: 600; }
.nav-icon { flex-shrink: 0; display: flex; }
.nav-label { flex: 1; }
.nav-badge { background: #e0e7ff; color: #4338ca; font-size: 0.65rem; font-weight: 700; padding: 1px 6px; border-radius: 999px; }

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.95rem 1rem;
  border-top: 1px solid #eef1f5;
}
.user-avatar {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: #6366f1;
  color: #ffffff; font-size: 0.75rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 0.8rem; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 0.7rem; color: #9ca3af; }
.logout-btn {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; padding: 4px; border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  display: flex; align-items: center;
}
.logout-btn:hover { color: #ef4444; background: #fee2e2; }

/* ── Main area ── */
.main-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }

/* ── Topbar ── */
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
  background: none; border: none; cursor: pointer;
  color: #6b7280; padding: 6px; border-radius: 8px;
  transition: background 0.2s;
  display: flex;
}
.collapse-btn:hover { background: #f3f4f6; }
.page-title { font-size: 1.02rem; font-weight: 700; color: #111827; line-height: 1.2; letter-spacing: -0.01em; }
.page-sub { font-size: 0.75rem; color: var(--rc-text-muted); }

.topbar-right { display: flex; align-items: center; gap: 0.75rem; }
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute; left: 0.75rem;
  width: 1rem; height: 1rem; color: #9ca3af;
}
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
.icon-btn {
  background: none; border: none; cursor: pointer;
  color: #6b7280; padding: 6px; border-radius: 8px;
  transition: background 0.2s; display: flex;
}
.icon-btn:hover { background: #f3f4f6; }
.notif-dot {
  position: absolute; top: 4px; right: 4px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #ef4444; border: 1.5px solid var(--rc-surface);
}
.topbar-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: #334155;
  color: #ffffff; font-size: 0.75rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}

/* ── Content ── */
.content {
  padding: 1.35rem 1.5rem 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  overflow-y: auto;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.9rem;
}
.stat-card {
  background: #ffffff;
  border-radius: 0.9rem;
  padding: 1.05rem 1.1rem;
  border: 1px solid #e9edf3;
  box-shadow: 0 1px 2px rgba(2, 6, 23, 0.04);
  transition: box-shadow 0.2s, border-color 0.2s;
}
.stat-card:hover { box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06); border-color: #dce4ee; }
.stats-grid .stat-card:nth-child(1) { background: #efe9f8; }
.stats-grid .stat-card:nth-child(2) { background: #e8f4f1; }
.stats-grid .stat-card:nth-child(3) { background: #f7efe8; }
.stats-grid .stat-card:nth-child(4) { background: #e8eef8; }
.stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
.stat-label { font-size: 0.75rem; font-weight: 600; color: var(--rc-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.stat-icon-wrap { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.stat-value { font-size: 1.75rem; font-weight: 700; color: #0f172a; line-height: 1; margin-bottom: 0.42rem; letter-spacing: -0.02em; }
.stat-icon-wrap {
  background: rgba(255,255,255,0.7);
  color: #475569;
  border: 1px solid rgba(255,255,255,0.9);
}
.stat-change { display: flex; align-items: center; gap: 0.25rem; font-size: 0.72rem; font-weight: 600; }
.stat-change.up { color: #0f766e; }
.stat-change.down { color: #b91c1c; }

/* ── Mid grid ── */
.mid-grid { display: grid; grid-template-columns: 1.45fr 1fr; gap: 1rem; }
@media (max-width: 900px) { .mid-grid { grid-template-columns: 1fr; } }

/* ── Card ── */
.card {
  background: #ffffff;
  border-radius: 0.9rem;
  padding: 1.05rem 1.1rem;
  border: 1px solid #e9edf3;
  box-shadow: 0 1px 2px rgba(2, 6, 23, 0.04);
}
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.9rem; }
.card-title { font-size: 0.88rem; font-weight: 700; color: #0f172a; letter-spacing: 0.01em; }
.badge-metric {
  font-size: 0.7rem; font-weight: 600; padding: 3px 10px; border-radius: 999px;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e6ebf2;
}
.text-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; font-weight: 600; color: #374151; }

/* ── Bar chart ── */
.bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 118px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
.bar {
  width: 100%; border-radius: 8px 8px 0 0;
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
  transition: height 0.3s;
}
.bar-label { font-size: 0.65rem; color: #9ca3af; }

/* ── Tiers ── */
.tier-list { display: flex; flex-direction: column; gap: 0.875rem; margin-bottom: 1rem; }
.tier-row { display: flex; flex-direction: column; gap: 4px; }
.tier-info { display: flex; align-items: center; gap: 0.5rem; }
.tier-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.tier-name { font-size: 0.8rem; font-weight: 500; color: #374151; }
.tier-bar-wrap { display: flex; align-items: center; gap: 0.5rem; }
.tier-bar-track { flex: 1; height: 7px; background: #eef2f7; border-radius: 999px; overflow: hidden; }
.tier-bar-fill { height: 100%; border-radius: 999px; transition: width 0.6s ease; }
.tier-pct { font-size: 0.72rem; font-weight: 600; color: #6b7280; width: 32px; text-align: right; }
.pill-row { display: flex; gap: 0.5rem; flex-wrap: wrap; padding-top: 0.5rem; border-top: 1px solid #f3f4f6; }
.pill-row { border-top: 1px solid var(--rc-border-soft); }
.pill {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

/* ── Table ── */
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.data-table th {
  text-align: left; padding: 0.65rem 0.75rem;
  font-size: 0.7rem; font-weight: 700; color: var(--rc-text-muted);
  text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 1px solid #e6ebf2;
}
.data-table td { padding: 0.85rem 0.75rem; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #f8fafc; }
.td-name { display: flex; align-items: center; gap: 0.625rem; }
.td-avatar {
  width: 32px; height: 32px; border-radius: 8px;
  color: #4c1d95; font-size: 0.65rem; font-weight: 700;
  border: 1px solid #e5e7eb;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.td-title { font-weight: 600; color: #111827; font-size: 0.82rem; }
.td-sub { font-size: 0.7rem; color: #9ca3af; }
.td-amount { font-weight: 700; color: #111827; }
.td-date { color: #6b7280; }
.type-badge { font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; border: 1px solid #cbd5e1; }
.status-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
.status-badge.paid { background: #ecfdf3; color: #15803d; border: 1px solid #bbf7d0; }
.status-badge.pending { background: #fff7ed; color: #b45309; border: 1px solid #fed7aa; }
.status-badge.overdue { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
</style>
