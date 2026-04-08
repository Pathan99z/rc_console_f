<script setup lang="ts">
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
</script>

<template>
  <section class="space-y-5">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="item in stats" :key="item.label" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ item.label }}</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ item.value }}</p>
      </article>
    </div>

    <div class="grid gap-4 xl:grid-cols-3">
      <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-sm xl:col-span-2">
        <h3 class="text-sm font-semibold text-slate-800">Monthly Revenue</h3>
        <div class="mt-4 grid h-36 grid-cols-7 items-end gap-2">
          <div class="rounded-t bg-slate-300" style="height: 42%"></div>
          <div class="rounded-t bg-slate-400" style="height: 64%"></div>
          <div class="rounded-t bg-slate-300" style="height: 53%"></div>
          <div class="rounded-t bg-slate-500" style="height: 82%"></div>
          <div class="rounded-t bg-slate-400" style="height: 61%"></div>
          <div class="rounded-t bg-slate-600" style="height: 90%"></div>
          <div class="rounded-t bg-slate-500" style="height: 72%"></div>
        </div>
      </article>
      <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-800">Tier Distribution</h3>
        <div class="mt-4 space-y-3 text-sm">
          <div class="flex items-center justify-between"><span>Internal Sales</span><span>40%</span></div>
          <div class="h-2 rounded bg-slate-100"><div class="h-2 w-[40%] rounded bg-slate-500"></div></div>
          <div class="flex items-center justify-between"><span>Partners</span><span>35%</span></div>
          <div class="h-2 rounded bg-slate-100"><div class="h-2 w-[35%] rounded bg-slate-400"></div></div>
          <div class="flex items-center justify-between"><span>Resellers</span><span>25%</span></div>
          <div class="h-2 rounded bg-slate-100"><div class="h-2 w-[25%] rounded bg-slate-300"></div></div>
        </div>
      </article>
    </div>

    <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-800">Recent Transactions</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-left text-sm">
          <thead class="text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="border-b border-[var(--rc-border-soft)] py-2">Partner / Reseller</th>
              <th class="border-b border-[var(--rc-border-soft)] py-2">Type</th>
              <th class="border-b border-[var(--rc-border-soft)] py-2">Amount</th>
              <th class="border-b border-[var(--rc-border-soft)] py-2">Date</th>
              <th class="border-b border-[var(--rc-border-soft)] py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in transactions" :key="row.name">
              <td class="border-b border-[var(--rc-border-soft)] py-3">{{ row.name }}</td>
              <td class="border-b border-[var(--rc-border-soft)] py-3">{{ row.type }}</td>
              <td class="border-b border-[var(--rc-border-soft)] py-3 font-semibold">{{ row.amount }}</td>
              <td class="border-b border-[var(--rc-border-soft)] py-3">{{ row.date }}</td>
              <td class="border-b border-[var(--rc-border-soft)] py-3">
                <span class="rounded-full px-2 py-0.5 text-xs" :class="row.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">
                  {{ row.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>
