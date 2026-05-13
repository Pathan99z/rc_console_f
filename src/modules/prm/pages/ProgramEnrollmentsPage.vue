<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useToast } from '@/shared/utils/useToast'
import { usePrmStore } from '@/modules/prm/store/prm.store'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'
import type { ProgramEnrollmentItem, PartnerProgramItem } from '@/modules/prm/types/prm.types'
import DataTable from '@/shared/components/DataTable.vue'

const prmStore = usePrmStore()
const toast = useToast()

const partnerOrganizations = ref<OrganizationItem[]>([])
const partnersLoading = ref(false)
const enrollOrgId = ref<number | null>(null)
const enrolling = ref(false)

const enrollForm = reactive({
  organization_id: '' as string,
  partner_program_id: '' as string,
  commission_override: '' as string,
})

const enrollmentColumns = [
  { key: 'org', label: 'Partner organization' },
  { key: 'orgType', label: 'Organization type' },
  { key: 'program', label: 'Partner program' },
  { key: 'commission', label: 'Commission %' },
  { key: 'status', label: 'Status' },
  { key: 'effective', label: 'Effective date' },
]

const activePrograms = computed(() =>
  prmStore.programs.filter((p) => {
    const s = String(p.status ?? 'active').toLowerCase()
    return s === 'active' || s === 'enabled' || s === ''
  }),
)

const selectedOrganizationId = computed(() => {
  const id = Number(enrollForm.organization_id)
  return Number.isFinite(id) && id > 0 ? id : null
})

const canViewEnrollments = computed(() => selectedOrganizationId.value != null)

const enrollOrgDisplayName = computed(() => {
  if (enrollOrgId.value == null) return ''
  const o = partnerOrganizations.value.find((x) => x.id === enrollOrgId.value)
  return o ? orgDisplayName(o) : ''
})

watch(
  () => enrollForm.organization_id,
  () => {
    enrollOrgId.value = null
  },
)

onMounted(async () => {
  try {
    await Promise.all([prmStore.fetchPrograms(), loadPartnerOrganizations()])
  } catch {
    toast.error(prmStore.message || 'Failed to load data.')
  }
})

async function loadPartnerOrganizations() {
  partnersLoading.value = true
  const all: OrganizationItem[] = []
  try {
    let page = 1
    const per_page = 100
    let lastPage = 1
    do {
      const { data } = await organizationsApi.list({
        page,
        per_page,
        type: 'partner',
        status: 'active',
      })
      const items = data.data.items.filter((o) => o.type === 'partner' && o.status === 'active')
      all.push(...items)
      lastPage = data.data.pagination.last_page
      page += 1
    } while (page <= lastPage && page <= 50)

    partnerOrganizations.value = all
  } catch {
    partnerOrganizations.value = []
    toast.error('Failed to load partner organizations.')
  } finally {
    partnersLoading.value = false
  }
}

async function loadEnrollments() {
  const id = selectedOrganizationId.value
  if (id == null) {
    toast.error('Select a partner organization.')
    return
  }
  enrollOrgId.value = id
  try {
    await prmStore.fetchProgramEnrollments(id)
    toast.success(prmStore.message || 'Enrollment history loaded.')
  } catch {
    toast.error(prmStore.message || 'Failed to load enrollments.')
  }
}

function orgDisplayName(o: OrganizationItem) {
  const d = o.display_name?.trim()
  const l = o.legal_name?.trim()
  return d || l || 'Unnamed partner organization'
}

function programBusinessLabel(p: PartnerProgramItem) {
  return p.name?.trim() || (typeof p.code === 'string' && p.code.trim()) || p.tier_code?.trim() || 'Partner program'
}

function enrollmentOrganizationName(e: ProgramEnrollmentItem): string {
  const o = e.organization
  if (o && typeof o === 'object') {
    const d = typeof o.display_name === 'string' ? o.display_name.trim() : ''
    const l = typeof o.legal_name === 'string' ? o.legal_name.trim() : ''
    if (d) return d
    if (l) return l
  }
  if (enrollOrgId.value != null) {
    const match = partnerOrganizations.value.find((x) => x.id === enrollOrgId.value)
    if (match) return orgDisplayName(match)
  }
  return '—'
}

function enrollmentOrganizationType(e: ProgramEnrollmentItem): string {
  const o = e.organization
  if (o && typeof o === 'object') {
    const t = typeof o.type === 'string' ? o.type.trim() : ''
    if (t) return t
  }
  return '—'
}

function enrollmentCommissionDisplay(e: ProgramEnrollmentItem): string {
  const raw = e.commission_percent
  if (raw == null || raw === '') return '—'
  const n = Number(raw)
  if (Number.isFinite(n)) return `${n}%`
  return `${raw}%`
}

function enrollmentProgramName(e: ProgramEnrollmentItem): string {
  const name = e.program_name
  if (typeof name === 'string' && name.trim()) return name.trim()
  const nested = e.program as { name?: string } | undefined
  if (nested && typeof nested.name === 'string' && nested.name.trim()) return nested.name.trim()
  const pid = e.partner_program_id
  if (pid != null) {
    const found = prmStore.programs.find((pr) => pr.id === pid)
    if (found) return programBusinessLabel(found)
  }
  return 'Partner program'
}

function enrollmentStatus(e: ProgramEnrollmentItem): string {
  const s = e.status
  return typeof s === 'string' && s.trim() ? s : '—'
}

function formatEffectiveDate(e: ProgramEnrollmentItem): string {
  const raw = e.effective_at ?? e.starts_at ?? e.enrolled_at ?? e.created_at
  if (typeof raw !== 'string' || !raw.trim()) return '—'
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? raw : d.toLocaleString()
}

async function enroll() {
  const oid = selectedOrganizationId.value
  const pid = Number(enrollForm.partner_program_id)
  if (oid == null) {
    toast.error('Select a partner organization.')
    return
  }
  if (!Number.isFinite(pid) || pid <= 0) {
    toast.error('Select a partner program.')
    return
  }
  const trimmed = enrollForm.commission_override.trim()
  let commission: number | undefined
  if (trimmed !== '') {
    const n = Number(trimmed)
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      toast.error('Commission override must be between 0 and 100, or left blank.')
      return
    }
    commission = n
  }

  enrolling.value = true
  try {
    const payload: { organization_id: number; partner_program_id: number; commission_percent?: number } = {
      organization_id: oid,
      partner_program_id: pid,
    }
    if (commission !== undefined) payload.commission_percent = commission

    await prmStore.enrollProgram(payload)
    toast.success(prmStore.message || 'Enrollment saved.')
    enrollOrgId.value = oid
    await prmStore.fetchProgramEnrollments(oid)
  } catch {
    toast.error(prmStore.message || 'Enrollment failed.')
  } finally {
    enrolling.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-xl font-bold text-slate-900">PRM program enrollments</h2>
      <p class="text-sm text-slate-500">Enroll active partner organizations in active partner programs. Tier is determined by the program.</p>
    </header>

    <div v-if="prmStore.programsLoading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-8 text-center text-sm text-slate-500">
      Loading…
    </div>
    <article v-else class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6">
      <h3 class="text-sm font-semibold text-slate-900">New enrollment</h3>
      <p class="mt-1 text-xs text-slate-500">Duplicate enrollments are rejected by the server.</p>
      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-600" for="pen-partner">Partner organization</label>
          <select id="pen-partner" v-model="enrollForm.organization_id" class="rc-input" :disabled="partnersLoading">
            <option value="" disabled>{{ partnersLoading ? 'Loading…' : 'Choose partner organization' }}</option>
            <option v-for="o in partnerOrganizations" :key="o.id" :value="String(o.id)">{{ orgDisplayName(o) }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-600" for="pen-program">Partner program</label>
          <select id="pen-program" v-model="enrollForm.partner_program_id" class="rc-input">
            <option value="" disabled>Choose active program</option>
            <option v-for="p in activePrograms" :key="p.id" :value="String(p.id)">{{ programBusinessLabel(p) }}</option>
          </select>
          <p v-if="!activePrograms.length" class="text-xs text-amber-700">No active programs available. Create or activate a program under PRM Programs.</p>
        </div>
        <div class="flex flex-col gap-1 md:col-span-2">
          <label class="text-xs font-medium text-slate-600" for="pen-comm">Commission override (optional)</label>
          <input
            id="pen-comm"
            v-model="enrollForm.commission_override"
            type="text"
            inputmode="decimal"
            class="rc-input max-w-xs"
            placeholder="Leave blank for program default"
            autocomplete="off"
          />
          <p class="text-xs text-slate-500">If set, must be between 0 and 100 (percent).</p>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" :disabled="enrolling" @click="enroll">
          {{ enrolling ? 'Saving…' : 'Save enrollment' }}
        </button>
        <button
          type="button"
          class="rounded border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canViewEnrollments || prmStore.enrollmentsLoading"
          @click="loadEnrollments"
        >
          {{ prmStore.enrollmentsLoading ? 'Loading…' : 'View enrollment history' }}
        </button>
      </div>
    </article>

    <article v-if="enrollOrgId" class="space-y-3">
      <div>
        <h3 class="text-sm font-semibold text-slate-900">Enrollment history</h3>
        <p v-if="enrollOrgDisplayName" class="mt-1 text-sm text-slate-600">{{ enrollOrgDisplayName }}</p>
      </div>
      <DataTable
        :columns="enrollmentColumns"
        :rows="prmStore.enrollments"
        :loading="prmStore.enrollmentsLoading"
        empty-message="No enrollments for this partner organization."
      >
        <template #rows>
          <tr v-for="e in prmStore.enrollments" :key="e.id" class="border-t">
            <td class="px-4 py-3 text-slate-800">{{ enrollmentOrganizationName(e) }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
                {{ enrollmentOrganizationType(e) }}
              </span>
            </td>
            <td class="px-4 py-3 font-medium text-slate-900">{{ enrollmentProgramName(e) }}</td>
            <td class="px-4 py-3 text-slate-700">{{ enrollmentCommissionDisplay(e) }}</td>
            <td class="px-4 py-3 text-slate-700">{{ enrollmentStatus(e) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ formatEffectiveDate(e) }}</td>
          </tr>
        </template>
      </DataTable>
    </article>
  </section>
</template>
