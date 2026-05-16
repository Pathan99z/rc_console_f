<script setup lang="ts">
import type { DashboardDatePreset, DashboardDateRange } from '@/modules/dashboard/types/dashboard.types'
import { resolveDashboardDateRange } from '@/modules/dashboard/utils/dashboardDateParams'

const model = defineModel<DashboardDateRange>({ required: true })

const presets: Array<{ value: DashboardDatePreset; label: string }> = [
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_90_days', label: 'Last 90 days' },
  { value: 'this_year', label: 'This year' },
  { value: 'all_time', label: 'All time' },
  { value: 'custom', label: 'Custom' },
]

function onPresetChange(preset: DashboardDatePreset) {
  if (preset === 'custom') {
    model.value = { preset, from: model.value.from, to: model.value.to }
    return
  }
  const resolved = resolveDashboardDateRange({ preset })
  model.value = { preset, ...resolved }
}
</script>

<template>
  <div class="flex flex-wrap items-end gap-2">
    <label class="sr-only" for="dash-preset">Date range</label>
    <select
      id="dash-preset"
      class="rc-input min-w-[10rem]"
      :value="model.preset || 'last_30_days'"
      @change="onPresetChange(($event.target as HTMLSelectElement).value as DashboardDatePreset)"
    >
      <option v-for="p in presets" :key="p.value" :value="p.value">{{ p.label }}</option>
    </select>
    <template v-if="model.preset === 'custom'">
      <input v-model="model.from" type="date" class="rc-input" aria-label="From date" />
      <input v-model="model.to" type="date" class="rc-input" aria-label="To date" />
    </template>
  </div>
</template>
