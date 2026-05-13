<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useToast } from '@/shared/utils/useToast'
import { usePrmStore } from '@/modules/prm/store/prm.store'
import type { ProgramEnrollmentItem } from '@/modules/prm/types/prm.types'

const prmStore = usePrmStore()
const toast = useToast()

onMounted(async () => {
  try {
    await prmStore.fetchPartnerProgramEnrollments()
  } catch {
    toast.error(prmStore.message || 'Failed to load your program enrollment.')
  }
})

const rows = computed(() => prmStore.partnerProgramEnrollments)

function programName(e: ProgramEnrollmentItem): string {
  const name = e.program_name
  if (typeof name === 'string' && name.trim()) return name.trim()
  const nested = e.program as { name?: string } | undefined
  if (nested && typeof nested.name === 'string' && nested.name.trim()) return nested.name.trim()
  return 'Partner program'
}

function programDescription(e: ProgramEnrollmentItem): string {
  const d = e.program_description ?? e.description
  if (typeof d === 'string' && d.trim()) return d.trim()
  const nested = e.program as { description?: string } | undefined
  if (nested && typeof nested.description === 'string' && nested.description.trim()) return nested.description.trim()
  return ''
}

function statusLabel(e: ProgramEnrollmentItem): string {
  const s = e.status
  return typeof s === 'string' && s.trim() ? s : '—'
}

function commissionLabel(e: ProgramEnrollmentItem): string {
  if (e.commission_percent == null) return '—'
  return `${e.commission_percent}%`
}

function effectiveLabel(e: ProgramEnrollmentItem): string {
  const raw = e.effective_at ?? e.starts_at ?? e.enrolled_at ?? e.created_at
  if (typeof raw !== 'string' || !raw.trim()) return '—'
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? raw : d.toLocaleString()
}
</script>

<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-xl font-bold text-slate-900">My program</h2>
      <p class="text-sm text-slate-500">Your organization’s partner program enrollment (read only).</p>
    </header>

    <div v-if="prmStore.partnerProgramEnrollmentsLoading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-8 text-center text-sm text-slate-500">
      Loading…
    </div>

    <div v-else-if="!rows.length" class="rounded-xl border border-dashed border-[var(--rc-border-soft)] bg-white p-10 text-center">
      <p class="text-sm font-medium text-slate-800">No program enrollment</p>
      <p class="mt-2 text-sm text-slate-500">When your company enrolls your organization in a partner program, it will appear here.</p>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <article
        v-for="row in rows"
        :key="row.id"
        class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm"
      >
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Partner program</p>
        <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ programName(row) }}</h3>
        <p v-if="programDescription(row)" class="mt-2 text-sm leading-relaxed text-slate-600">{{ programDescription(row) }}</p>
        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between gap-2">
            <dt class="text-slate-500">Commission</dt>
            <dd class="font-medium text-slate-900">{{ commissionLabel(row) }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt class="text-slate-500">Status</dt>
            <dd class="font-medium text-slate-900">{{ statusLabel(row) }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt class="text-slate-500">Effective date</dt>
            <dd class="text-slate-800">{{ effectiveLabel(row) }}</dd>
          </div>
        </dl>
      </article>
    </div>
  </section>
</template>
