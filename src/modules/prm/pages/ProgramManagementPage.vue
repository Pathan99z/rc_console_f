<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import DataTable from '@/shared/components/DataTable.vue'
import { useToast } from '@/shared/utils/useToast'
import { usePrmStore } from '@/modules/prm/store/prm.store'
import type { PartnerProgramItem, PartnerProgramUpsertPayload } from '@/modules/prm/types/prm.types'

const prmStore = usePrmStore()
const toast = useToast()

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
  { key: 'description', label: 'Description' },
  { key: 'commission', label: 'Default commission %' },
  { key: 'tier', label: 'Tier level' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const modalOpen = ref(false)
const modalSaving = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingId = ref<number | null>(null)

const statusConfirm = ref<{ id: number; name: string; nextStatus: string; label: string } | null>(null)

const form = reactive({
  name: '',
  code: '',
  description: '',
  tier_level: '',
  default_commission_percent: '' as string,
  metadata_json: '',
  status: 'active' as string,
})

function resetForm() {
  form.name = ''
  form.code = ''
  form.description = ''
  form.tier_level = ''
  form.default_commission_percent = ''
  form.metadata_json = ''
  form.status = 'active'
}

function programRowDescription(p: PartnerProgramItem): string {
  const d = p.description
  if (typeof d === 'string' && d.trim()) {
    return d.length > 80 ? `${d.slice(0, 77)}…` : d
  }
  return '—'
}

function programDefaultCommission(p: PartnerProgramItem): string {
  const raw = p.default_commission_percent ?? (p as Record<string, unknown>).default_commission
  if (raw == null || raw === '') return '—'
  const n = Number(raw)
  return Number.isFinite(n) ? `${n}%` : String(raw)
}

function programTierLevel(p: PartnerProgramItem): string {
  const tl = p.tier_level
  if (tl != null && tl !== '') {
    if (typeof tl === 'number' && Number.isFinite(tl)) return String(tl)
    if (typeof tl === 'string' && tl.trim()) return tl.trim()
  }
  const tc = p.tier_code
  if (tc != null && tc !== '') {
    if (typeof tc === 'number' && Number.isFinite(tc)) return String(tc)
    if (typeof tc === 'string' && tc.trim()) return tc.trim()
  }
  return '—'
}

function programStatusLabel(p: PartnerProgramItem): string {
  const s = p.status
  return typeof s === 'string' && s.trim() ? s : '—'
}

function statusPillClass(status: string): string {
  const s = status.toLowerCase()
  if (s === 'active') return 'bg-emerald-50 text-emerald-800'
  if (s === 'inactive' || s === 'disabled' || s === 'draft') return 'bg-slate-100 text-slate-700'
  return 'bg-amber-50 text-amber-800'
}

function isProgramActive(p: PartnerProgramItem): boolean {
  const s = String(p.status ?? 'active').toLowerCase()
  return s === 'active' || s === '' || s === 'enabled'
}

function openCreate() {
  modalMode.value = 'create'
  editingId.value = null
  resetForm()
  modalOpen.value = true
}

async function openEdit(programId: number) {
  modalMode.value = 'edit'
  editingId.value = programId
  resetForm()
  modalOpen.value = true
  try {
    const p = await prmStore.fetchProgram(programId)
    if (!p) return
    form.name = p.name?.trim() || ''
    form.code = typeof p.code === 'string' ? p.code : String(p.code ?? '')
    form.description = typeof p.description === 'string' ? p.description : ''
    form.tier_level = programTierLevel(p) === '—' ? '' : programTierLevel(p)
    const raw = p.default_commission_percent ?? (p as Record<string, unknown>).default_commission
    form.default_commission_percent = raw != null && raw !== '' ? String(raw) : ''
    form.status = typeof p.status === 'string' && p.status.trim() ? p.status : 'active'
    if (p.metadata && typeof p.metadata === 'object') {
      try {
        form.metadata_json = JSON.stringify(p.metadata, null, 2)
      } catch {
        form.metadata_json = ''
      }
    }
  } catch {
    toast.error(prmStore.message || 'Could not load program.')
    modalOpen.value = false
  }
}

function closeModal() {
  if (modalSaving.value) return
  modalOpen.value = false
}

function parseMetadata(): Record<string, unknown> | undefined {
  const t = form.metadata_json.trim()
  if (!t) return undefined
  try {
    const parsed = JSON.parse(t) as unknown
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      toast.error('Metadata must be a JSON object.')
      return undefined
    }
    return parsed as Record<string, unknown>
  } catch {
    toast.error('Metadata must be valid JSON.')
    return undefined
  }
}

function buildPayload(): PartnerProgramUpsertPayload | null {
  if (!form.name.trim()) {
    toast.error('Name is required.')
    return null
  }
  if (!form.code.trim()) {
    toast.error('Code is required.')
    return null
  }
  let default_commission_percent: number | null | undefined
  const commTrim = form.default_commission_percent.trim()
  if (commTrim === '') {
    default_commission_percent = undefined
  } else {
    const n = Number(commTrim)
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      toast.error('Default commission must be between 0 and 100 or left blank.')
      return null
    }
    default_commission_percent = n
  }
  const metadata = parseMetadata()
  if (metadata === undefined && form.metadata_json.trim() !== '') return null

  const payload: PartnerProgramUpsertPayload = {
    name: form.name.trim(),
    code: form.code.trim(),
    description: form.description.trim() || null,
    tier_level: form.tier_level.trim() || null,
    status: form.status.trim() || null,
  }
  if (default_commission_percent !== undefined) payload.default_commission_percent = default_commission_percent
  if (metadata !== undefined) payload.metadata = metadata
  return payload
}

async function saveModal() {
  const payload = buildPayload()
  if (!payload) return
  modalSaving.value = true
  try {
    if (modalMode.value === 'create') {
      await prmStore.createProgram(payload)
      toast.success(prmStore.message || 'Program created.')
    } else if (editingId.value != null) {
      await prmStore.updateProgram(editingId.value, payload)
      toast.success(prmStore.message || 'Program updated.')
    }
    modalOpen.value = false
  } catch {
    toast.error(prmStore.message || 'Save failed.')
  } finally {
    modalSaving.value = false
  }
}

function askToggleStatus(p: PartnerProgramItem) {
  const id = p.id
  const name = p.name?.trim() || p.code?.trim() || 'this program'
  const active = isProgramActive(p)
  statusConfirm.value = {
    id,
    name,
    nextStatus: active ? 'inactive' : 'active',
    label: active ? 'deactivate' : 'activate',
  }
}

async function confirmStatusChange() {
  if (!statusConfirm.value) return
  try {
    await prmStore.patchProgramStatus(statusConfirm.value.id, statusConfirm.value.nextStatus)
    toast.success(prmStore.message || 'Status updated.')
  } catch {
    toast.error(prmStore.message || 'Status update failed.')
  } finally {
    statusConfirm.value = null
  }
}

onMounted(async () => {
  try {
    await prmStore.fetchPrograms()
  } catch {
    toast.error(prmStore.message || 'Failed to load programs.')
  }
})
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">PRM program management</h2>
        <p class="text-sm text-slate-500">Create and maintain partner program templates used for enrollments.</p>
      </div>
      <button type="button" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="openCreate">Create program</button>
    </header>

    <div v-if="prmStore.programsLoading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-10 text-center text-sm text-slate-500">
      Loading programs…
    </div>
    <div v-else-if="!prmStore.programs.length" class="rounded-xl border border-dashed border-[var(--rc-border-soft)] bg-white p-10 text-center text-sm text-slate-600">
      No partner programs yet. Create one to begin enrolling partners.
    </div>
    <DataTable v-else :columns="columns" :rows="prmStore.programs" :loading="false" empty-message="No programs.">
      <template #rows>
        <tr v-for="p in prmStore.programs" :key="p.id" class="border-t border-[var(--rc-border-soft)]">
          <td class="px-4 py-3 font-medium text-slate-900">{{ p.name?.trim() || '—' }}</td>
          <td class="px-4 py-3 text-slate-700">{{ typeof p.code === 'string' && p.code.trim() ? p.code : '—' }}</td>
          <td class="max-w-xs px-4 py-3 text-slate-600">{{ programRowDescription(p) }}</td>
          <td class="px-4 py-3 text-slate-700">{{ programDefaultCommission(p) }}</td>
          <td class="px-4 py-3 text-slate-700">{{ programTierLevel(p) }}</td>
          <td class="px-4 py-3">
            <span class="rounded-full px-2 py-0.5 text-xs font-semibold capitalize" :class="statusPillClass(programStatusLabel(p))">
              {{ programStatusLabel(p) }}
            </span>
          </td>
          <td class="px-4 py-3 text-right">
            <button type="button" class="mr-1 rounded border px-2 py-1 text-xs font-medium" @click="openEdit(p.id)">Edit</button>
            <button
              type="button"
              class="rounded border px-2 py-1 text-xs font-medium"
              :class="isProgramActive(p) ? 'text-amber-800' : 'text-emerald-800'"
              @click="askToggleStatus(p)"
            >
              {{ isProgramActive(p) ? 'Deactivate' : 'Activate' }}
            </button>
          </td>
        </tr>
      </template>
    </DataTable>

    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prm-program-modal-title"
      @click.self="closeModal"
    >
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h3 id="prm-program-modal-title" class="text-lg font-semibold text-slate-900">
          {{ modalMode === 'create' ? 'Create program' : 'Edit program' }}
        </h3>
        <p v-if="prmStore.programDetailLoading" class="mt-2 text-sm text-slate-500">Loading…</p>
        <div v-else class="mt-4 grid gap-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600" for="ppm-name">Name</label>
            <input id="ppm-name" v-model="form.name" class="rc-input w-full" autocomplete="off" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600" for="ppm-code">Code</label>
            <input id="ppm-code" v-model="form.code" class="rc-input w-full" autocomplete="off" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600" for="ppm-desc">Description</label>
            <textarea id="ppm-desc" v-model="form.description" rows="3" class="rc-input w-full resize-y" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600" for="ppm-tier">Tier level</label>
            <input id="ppm-tier" v-model="form.tier_level" class="rc-input w-full" autocomplete="off" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600" for="ppm-comm">Default commission %</label>
            <input id="ppm-comm" v-model="form.default_commission_percent" class="rc-input w-full" inputmode="decimal" placeholder="Optional" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600" for="ppm-status">Status</label>
            <select id="ppm-status" v-model="form.status" class="rc-input w-full">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="draft">draft</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600" for="ppm-meta">Metadata (optional JSON)</label>
            <textarea id="ppm-meta" v-model="form.metadata_json" rows="3" class="rc-input w-full resize-y font-mono text-xs" placeholder="{}" />
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="rounded border px-4 py-2 text-sm" :disabled="modalSaving" @click="closeModal">Cancel</button>
          <button type="button" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" :disabled="modalSaving || prmStore.programDetailLoading" @click="saveModal">
            {{ modalSaving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="statusConfirm" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div class="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h4 class="text-sm font-semibold text-slate-900">Confirm status change</h4>
        <p class="mt-2 text-sm text-slate-600">
          {{ statusConfirm.label === 'deactivate' ? 'Deactivate' : 'Activate' }}
          <span class="font-medium">{{ statusConfirm.name }}</span>
          ?
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded border px-3 py-2 text-sm" @click="statusConfirm = null">Cancel</button>
          <button type="button" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="confirmStatusChange">Confirm</button>
        </div>
      </div>
    </div>
  </section>
</template>
