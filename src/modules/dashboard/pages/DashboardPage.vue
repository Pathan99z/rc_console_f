<script setup lang="ts">
// Keep your existing fields intact.
const stats = [
  { label: 'Total Revenue', value: '$2.4M' },
  { label: 'Active Partners', value: '284' },
  { label: 'Resellers', value: '1,248' },
  { label: 'Transactions', value: '5,621' },
]

const transactions = [
  { name: 'Acme Corp', type: 'Partner', amount: '$12,400', date: '25 Mar 2026', status: 'Paid' },
  { name: 'BrightEdge Ltd', type: 'Reseller', amount: '$8,750', date: '24 Mar 2026', status: 'Paid' },
  { name: 'Nova Systems', type: 'Partner', amount: '$21,000', date: '23 Mar 2026', status: 'Pending' },
]

// Visual-only data (same as Dashboard.vue)
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
</script>

<template>
  <!-- ProtectedLayout already renders AppSidebar + the global header -->
  <main class="content">
    <!-- Stats Row -->
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-top">
          <span class="stat-label">{{ stat.label }}</span>
          <div v-if="stat.icon" class="stat-icon-wrap">
            <span v-html="stat.icon"></span>
          </div>
        </div>

        <div class="stat-value">{{ stat.value }}</div>

        <div v-if="stat.change != null && stat.up != null" class="stat-change" :class="stat.up ? 'up' : 'down'">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              :d="stat.up ? 'M5 10l7-7 7 7' : 'M19 14l-7 7-7-7'"
            />
          </svg>
          {{ stat.change }} vs last month
        </div>
      </div>
    </div>

    <!-- Two-column: Chart + Activity -->
    <div class="mid-grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Monthly Revenue</h3>
          <span class="badge-metric">+18.4% MoM</span>
        </div>

        <div class="bar-chart">
          <div v-for="(bar, i) in barData" :key="i" class="bar-col">
            <div class="bar" :style="`height: ${bar.h}%; opacity: ${0.5 + i * 0.07}`"></div>
            <span class="bar-label">{{ bar.month }}</span>
          </div>
        </div>
      </div>

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
                <div class="tier-bar-fill" :style="`width: ${tier.pct}%; background: ${tier.color}`"></div>
              </div>
              <span class="tier-pct">{{ tier.pct }}%</span>
            </div>
          </div>
        </div>

        <div class="pill-row">
          <span v-for="pill in pills" :key="pill.text" class="pill">{{ pill.text }}</span>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
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
            <tr v-for="tx in transactions" :key="tx.id ?? tx.name">
              <td>
                <div class="td-name">
                  <div class="td-avatar" :style="`background: ${tx.color || '#eef2ff'}`">
                    {{ tx.initials || String(tx.name || '?').slice(0, 2) }}
                  </div>
                  <div>
                    <p class="td-title">{{ tx.name }}</p>
                    <p v-if="tx.email" class="td-sub">{{ tx.email }}</p>
                  </div>
                </div>
              </td>

              <td>
                <span class="type-badge" :style="`color: ${(tx.typeColor || '#4c1d95')}; background: ${(tx.typeColor || '#4c1d95')}15`">
                  {{ tx.type }}
                </span>
              </td>

              <td class="td-amount">{{ tx.amount }}</td>
              <td class="td-date">{{ tx.date }}</td>

              <td>
                <span class="status-badge" :class="String(tx.status).toLowerCase()">{{ tx.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Content only: sidebar/topbar styles live in AppSidebar + ProtectedLayout */
.content {
  padding: 0;
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
.stat-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.7);
  color: #475569;
  border: 1px solid rgba(255,255,255,0.9);
}
.stat-value { font-size: 1.75rem; font-weight: 700; color: #0f172a; line-height: 1; margin-bottom: 0.42rem; letter-spacing: -0.02em; }
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
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e6ebf2;
}
.text-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; font-weight: 600; color: #374151; }

/* ── Bar chart ── */
.bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 118px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
.bar { width: 100%; border-radius: 8px 8px 0 0; background: linear-gradient(180deg, #64748b 0%, #475569 100%); transition: height 0.3s; }
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
.pill-row { display: flex; gap: 0.5rem; flex-wrap: wrap; padding-top: 0.5rem; border-top: 1px solid var(--rc-border-soft); }
.pill { font-size: 0.7rem; font-weight: 600; padding: 3px 10px; border-radius: 999px; background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; }

/* ── Table ── */
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.data-table th {
  text-align: left;
  padding: 0.65rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--rc-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e6ebf2;
}
.data-table td { padding: 0.85rem 0.75rem; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #f8fafc; }
.td-name { display: flex; align-items: center; gap: 0.625rem; }
.td-avatar { width: 32px; height: 32px; border-radius: 8px; color: #4c1d95; font-size: 0.65rem; font-weight: 700; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
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
