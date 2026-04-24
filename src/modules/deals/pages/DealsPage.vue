<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import { useDealsStore } from '@/modules/deals/store/deals.store'
import { usePipelinesStore } from '@/modules/pipelines/store/pipelines.store'
import { useAuth } from '@/modules/auth/composables/useAuth'
import type { DealItem, DealStatusCode, DealStatusLabel } from '@/modules/deals/services/deals.api'

const toast = useToast()
const router = useRouter()
const dealsStore = useDealsStore()
const pipelinesStore = usePipelinesStore()
const { auth, isPrivilegedUser } = useAuth()

const viewMode = ref<'list' | 'kanban'>('list')
const selectedPipelineId = ref<number | ''>('')
const loadingStages = ref(false)
const creatingDeal = ref(false)
const savingDeal = ref(false)
const deletingDealId = ref<number | null>(null)
const showCreateDealModal = ref(false)
const showEditDealModal = ref(false)
const draggingDealId = ref<number | null>(null)
const showPipelineModal = ref(false)
const showStageModal = ref(false)
const currencyOptions = ['INR', 'USD', 'ZAR', 'EUR', 'GBP'] as const

const createDealForm = reactive({
  name: '',
  contact_id: '',
  company_id: '',
  owner_user_id: '',
  pipeline_id: '',
  pipeline_stage_id: '',
  currency_code: 'INR',
  probability: '',
  value: '',
  expected_close_date: '',
})

const editDealForm = reactive({
  name: '',
  contact_id: '',
  company_id: '',
  owner_user_id: '',
  pipeline_id: '',
  pipeline_stage_id: '',
  currency_code: 'INR',
  probability: '',
  value: '',
  expected_close_date: '',
})
const editingDealId = ref<number | null>(null)

const pipelineForm = reactive({
  name: '',
  status: 1,
})

const stageForm = reactive({
  name: '',
  stage_order: '',
  status: 1,
})

const selectedPipelineStages = computed(() => {
  if (!selectedPipelineId.value) return []
  return pipelinesStore.stageMap[selectedPipelineId.value] || []
})

const selectedEditPipelineStages = computed(() => {
  const pipelineId = Number(editDealForm.pipeline_id || 0) || 0
  if (!pipelineId) return []
  return pipelinesStore.stageMap[pipelineId] || []
})

const dealsByStage = computed(() => {
  const map: Record<number, DealItem[]> = {}
  for (const stage of selectedPipelineStages.value) {
    map[stage.id] = dealsStore.items.filter((deal) => deal.pipeline_stage_id === stage.id)
  }
  return map
})

function normalizeStatusCode(status: DealItem['status']): DealStatusCode {
  if (status === 1 || status === 'won') return 1
  if (status === 2 || status === 'lost') return 2
  return 0
}

function toStatusLabel(status: DealItem['status']): DealStatusLabel {
  const code = normalizeStatusCode(status)
  if (code === 1) return 'won'
  if (code === 2) return 'lost'
  return 'open'
}

function statusBadgeClass(status: DealItem['status']) {
  const code = normalizeStatusCode(status)
  if (code === 1) return 'bg-emerald-50 text-emerald-700'
  if (code === 2) return 'bg-rose-50 text-rose-700'
  return 'bg-slate-100 text-slate-700'
}

function firstValidationMessage(errors: Record<string, string[]>) {
  const first = Object.values(errors)[0]
  return first?.[0] || ''
}

function dealDisplayValue(deal: DealItem): string {
  const normalized =
    deal.value ??
    (deal as DealItem & { estimated_value?: number | string | null }).estimated_value ??
    ((deal.company as { revenue?: number | string | null } | null | undefined)?.revenue ?? null)
  if (normalized === null || normalized === undefined || normalized === '') return '-'
  const currency = deal.currency_code ? `${String(deal.currency_code).toUpperCase()} ` : ''
  return `${currency}${String(normalized)}`
}

function dealRawValue(deal: DealItem): string {
  const normalized =
    deal.value ??
    (deal as DealItem & { estimated_value?: number | string | null }).estimated_value ??
    ((deal.company as { revenue?: number | string | null } | null | undefined)?.revenue ?? null)
  return normalized === null || normalized === undefined || normalized === '' ? '' : String(normalized)
}

function dealDisplayProbability(deal: DealItem): string {
  return deal.probability === null || deal.probability === undefined ? '-' : `${deal.probability}%`
}

function toOptionalProbability(value: string): number | undefined {
  if (value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

async function loadStagesForPipeline(pipelineId: number) {
  loadingStages.value = true
  try {
    await pipelinesStore.fetchStages(pipelineId)
  } finally {
    loadingStages.value = false
  }
}

async function bootstrap() {
  await Promise.all([pipelinesStore.fetchPipelines(1, 100), dealsStore.fetchUsers(), dealsStore.fetchContacts(), dealsStore.fetchCompanies()])
  if (!selectedPipelineId.value && pipelinesStore.items[0]) {
    selectedPipelineId.value = pipelinesStore.items[0].id
    dealsStore.filters.pipeline_id = pipelinesStore.items[0].id
  }
  if (selectedPipelineId.value) {
    await loadStagesForPipeline(selectedPipelineId.value)
  }
  await dealsStore.fetchDeals()
}

watch(selectedPipelineId, async (pipelineId) => {
  dealsStore.filters.pipeline_id = pipelineId
  dealsStore.filters.pipeline_stage_id = ''
  if (!pipelineId) {
    await dealsStore.fetchDeals(1, dealsStore.pagination.per_page)
    return
  }
  await loadStagesForPipeline(pipelineId)
  await dealsStore.fetchDeals(1, dealsStore.pagination.per_page)
})

onMounted(bootstrap)

async function applyFilters() {
  await dealsStore.fetchDeals(1, dealsStore.pagination.per_page)
}

async function submitCreateDeal() {
  if (creatingDeal.value) return
  creatingDeal.value = true
  try {
    await dealsStore.createDeal({
      name: createDealForm.name.trim(),
      contact_id: Number(createDealForm.contact_id),
      company_id: Number(createDealForm.company_id || 0) || undefined,
      owner_user_id: Number(createDealForm.owner_user_id || 0) || undefined,
      pipeline_id: Number(createDealForm.pipeline_id),
      pipeline_stage_id: Number(createDealForm.pipeline_stage_id),
      value: Number(createDealForm.value || 0) || undefined,
      currency_code: createDealForm.currency_code || undefined,
      probability: toOptionalProbability(createDealForm.probability),
      expected_close_date: createDealForm.expected_close_date || undefined,
      tenant_id: auth.user?.role === 'global_admin' ? auth.user.tenant_id : undefined,
    })
    toast.success('Deal created successfully.')
    showCreateDealModal.value = false
    Object.assign(createDealForm, {
      name: '',
      contact_id: '',
      company_id: '',
      owner_user_id: '',
      pipeline_id: selectedPipelineId.value ? String(selectedPipelineId.value) : '',
      pipeline_stage_id: '',
      currency_code: 'INR',
      probability: '',
      value: '',
      expected_close_date: '',
    })
  } catch {
    toast.error(firstValidationMessage(dealsStore.errors) || dealsStore.message || 'Deal create failed.')
  } finally {
    creatingDeal.value = false
  }
}

async function openEditDeal(deal: DealItem) {
  editingDealId.value = deal.id
  editDealForm.name = deal.name
  editDealForm.contact_id = deal.contact_id ? String(deal.contact_id) : deal.contact?.id ? String(deal.contact.id) : ''
  editDealForm.company_id = deal.company_id ? String(deal.company_id) : deal.company?.id ? String(deal.company.id) : ''
  editDealForm.owner_user_id = deal.owner_user_id ? String(deal.owner_user_id) : deal.owner?.id ? String(deal.owner.id) : ''
  editDealForm.pipeline_id = deal.pipeline_id ? String(deal.pipeline_id) : deal.pipeline?.id ? String(deal.pipeline.id) : ''
  editDealForm.pipeline_stage_id = deal.pipeline_stage_id ? String(deal.pipeline_stage_id) : deal.stage?.id ? String(deal.stage.id) : ''
  editDealForm.currency_code = deal.currency_code ? String(deal.currency_code).toUpperCase() : 'INR'
  editDealForm.probability = deal.probability === null || deal.probability === undefined ? '' : String(deal.probability)
  editDealForm.value = dealRawValue(deal)
  editDealForm.expected_close_date = deal.expected_close_date ? String(deal.expected_close_date).slice(0, 10) : ''
  const pipelineId = Number(editDealForm.pipeline_id || 0) || 0
  if (pipelineId) {
    await loadStagesForPipeline(pipelineId)
  }
  showEditDealModal.value = true
}

async function submitEditDeal() {
  if (!editingDealId.value || savingDeal.value) return
  savingDeal.value = true
  try {
    await dealsStore.updateDeal(editingDealId.value, {
      name: editDealForm.name.trim() || undefined,
      contact_id: Number(editDealForm.contact_id || 0) || undefined,
      company_id: Number(editDealForm.company_id || 0) || undefined,
      owner_user_id: Number(editDealForm.owner_user_id || 0) || undefined,
      pipeline_id: Number(editDealForm.pipeline_id || 0) || undefined,
      pipeline_stage_id: Number(editDealForm.pipeline_stage_id || 0) || undefined,
      value: Number(editDealForm.value || 0) || undefined,
      currency_code: editDealForm.currency_code || undefined,
      probability: toOptionalProbability(editDealForm.probability),
      expected_close_date: editDealForm.expected_close_date || undefined,
    })
    toast.success('Deal updated successfully.')
    showEditDealModal.value = false
    editingDealId.value = null
  } catch {
    toast.error(firstValidationMessage(dealsStore.errors) || dealsStore.message || 'Deal update failed.')
  } finally {
    savingDeal.value = false
  }
}

async function removeDeal(dealId: number) {
  if (deletingDealId.value) return
  if (!window.confirm('Delete this deal?')) return
  deletingDealId.value = dealId
  try {
    await dealsStore.deleteDeal(dealId)
    toast.success('Deal deleted successfully.')
  } catch {
    toast.error(dealsStore.message || 'Deal delete failed.')
  } finally {
    deletingDealId.value = null
  }
}

async function moveDealToStage(stageId: number) {
  if (!draggingDealId.value) return
  const dealId = draggingDealId.value
  draggingDealId.value = null
  try {
    await dealsStore.moveDealStage(dealId, stageId)
    toast.success('Deal moved successfully.')
  } catch {
    toast.error(dealsStore.message || 'Unable to move deal.')
  }
}

function openDealDetails(dealId: number) {
  void router.push(`/app/deals/${dealId}`)
}

async function createPipeline() {
  try {
    const created = await pipelinesStore.createPipeline({
      name: pipelineForm.name.trim(),
      status: pipelineForm.status,
      tenant_id: auth.user?.role === 'global_admin' ? auth.user.tenant_id : undefined,
    })
    selectedPipelineId.value = created.id
    showPipelineModal.value = false
    pipelineForm.name = ''
    pipelineForm.status = 1
    toast.success('Pipeline created successfully.')
  } catch {
    toast.error(pipelinesStore.message || 'Pipeline create failed.')
  }
}

async function createStage() {
  if (!selectedPipelineId.value) return
  try {
    await pipelinesStore.createStage(selectedPipelineId.value, {
      name: stageForm.name.trim(),
      stage_order: Number(stageForm.stage_order || 0),
      status: stageForm.status,
    })
    showStageModal.value = false
    stageForm.name = ''
    stageForm.stage_order = ''
    stageForm.status = 1
    toast.success('Stage created successfully.')
  } catch {
    toast.error(pipelinesStore.message || 'Stage create failed.')
  }
}

function useFirstPipelineForKanban() {
  if (selectedPipelineId.value || pipelinesStore.items.length === 0) return
  selectedPipelineId.value = pipelinesStore.items[0].id
}

async function onEditPipelineChanged() {
  const pipelineId = Number(editDealForm.pipeline_id || 0) || 0
  if (!pipelineId) {
    editDealForm.pipeline_stage_id = ''
    return
  }
  await loadStagesForPipeline(pipelineId)
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Deals</h2>
        <p class="text-sm text-slate-500">Manage pipeline-based deals with list and kanban workflows.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="rounded border px-3 py-1.5 text-sm" :class="viewMode === 'list' ? 'bg-slate-900 text-white' : ''" @click="viewMode = 'list'">List View</button>
        <button class="rounded border px-3 py-1.5 text-sm" :class="viewMode === 'kanban' ? 'bg-slate-900 text-white' : ''" @click="viewMode = 'kanban'">Kanban View</button>
        <button class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="showCreateDealModal = true">Create Deal</button>
        <button v-if="isPrivilegedUser" class="rounded border px-3 py-1.5 text-sm" @click="showPipelineModal = true">New Pipeline</button>
        <button v-if="isPrivilegedUser && selectedPipelineId" class="rounded border px-3 py-1.5 text-sm" @click="showStageModal = true">New Stage</button>
      </div>
    </header>

    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <div class="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <select v-model="selectedPipelineId" class="rc-input">
          <option :value="''">All pipelines</option>
          <option v-for="pipeline in pipelinesStore.items" :key="pipeline.id" :value="pipeline.id">{{ pipeline.name }}</option>
        </select>
        <select v-model="dealsStore.filters.pipeline_stage_id" class="rc-input" :disabled="!selectedPipelineId || loadingStages">
          <option :value="''">All stages</option>
          <option v-for="stage in selectedPipelineStages" :key="stage.id" :value="stage.id">{{ stage.name }}</option>
        </select>
        <select v-model="dealsStore.filters.owner_user_id" class="rc-input">
          <option :value="''">All owners</option>
          <option v-for="user in dealsStore.users" :key="user.id" :value="user.id">{{ user.name }}</option>
        </select>
        <select v-model="dealsStore.filters.status" class="rc-input">
          <option :value="''">All status</option>
          <option :value="0">open</option>
          <option :value="1">won</option>
          <option :value="2">lost</option>
        </select>
        <input v-model.trim="dealsStore.filters.search" class="rc-input" placeholder="Search deals..." @keyup.enter="applyFilters" />
        <button class="rounded border px-3 py-1.5 text-sm" :disabled="dealsStore.loading" @click="applyFilters">Apply Filters</button>
      </div>
    </div>

    <div v-if="dealsStore.loading" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6 text-center text-sm text-slate-500">
      Loading deals...
    </div>

    <div v-else-if="viewMode === 'list'" class="rounded-xl border border-[var(--rc-border-soft)] bg-white">
      <div v-if="dealsStore.items.length === 0" class="p-6 text-center text-sm text-slate-500">No deals found.</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-3 py-2 text-left font-semibold text-slate-600">Deal</th>
              <th class="px-3 py-2 text-left font-semibold text-slate-600">Contact</th>
              <th class="px-3 py-2 text-left font-semibold text-slate-600">Owner</th>
              <th class="px-3 py-2 text-left font-semibold text-slate-600">Stage</th>
              <th class="px-3 py-2 text-left font-semibold text-slate-600">Status</th>
              <th class="px-3 py-2 text-left font-semibold text-slate-600">Probability</th>
              <th class="px-3 py-2 text-left font-semibold text-slate-600">Value</th>
              <th class="px-3 py-2 text-left font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="deal in dealsStore.items" :key="deal.id" class="hover:bg-slate-50">
              <td class="px-3 py-2">
                <button class="font-semibold text-indigo-700 hover:underline" @click="openDealDetails(deal.id)">{{ deal.name }}</button>
              </td>
              <td class="px-3 py-2">{{ deal.contact ? `${deal.contact.first_name} ${deal.contact.last_name}` : '-' }}</td>
              <td class="px-3 py-2">{{ deal.owner?.name || '-' }}</td>
              <td class="px-3 py-2">{{ deal.stage?.name || '-' }}</td>
              <td class="px-3 py-2"><span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusBadgeClass(deal.status)">{{ toStatusLabel(deal.status) }}</span></td>
              <td class="px-3 py-2">{{ dealDisplayProbability(deal) }}</td>
              <td class="px-3 py-2">{{ dealDisplayValue(deal) }}</td>
              <td class="px-3 py-2">
                <div class="flex items-center gap-2">
                  <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="View" @click="openDealDetails(deal.id)">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
                  </button>
                  <button class="rounded border p-2 text-slate-700 hover:bg-slate-50" title="Edit" @click="openEditDeal(deal)">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                  </button>
                  <button class="rounded border p-2 text-rose-700 hover:bg-rose-50 disabled:opacity-60" title="Delete" :disabled="deletingDealId === deal.id" @click="removeDeal(deal.id)">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M8 6V4h8v2m-1 0v14H9V6"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-3 pb-3">
        <PaginationControls
          :current-page="dealsStore.pagination.current_page"
          :last-page="dealsStore.pagination.last_page"
          @change="(page) => dealsStore.fetchDeals(page, dealsStore.pagination.per_page)"
        />
      </div>
    </div>

    <div v-else-if="!selectedPipelineId" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-8 text-center">
      <p class="text-sm font-semibold text-slate-700">Select a pipeline to view Kanban columns.</p>
      <p class="mt-1 text-xs text-slate-500">Kanban stages are pipeline-specific and require one active pipeline.</p>
      <button class="mt-4 rounded border px-3 py-1.5 text-sm hover:bg-slate-50" @click="useFirstPipelineForKanban">
        Use first available pipeline
      </button>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="stage in selectedPipelineStages"
        :key="stage.id"
        class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-3"
        @dragover.prevent
        @drop="moveDealToStage(stage.id)"
      >
        <header class="mb-2 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-900">{{ stage.name }}</h3>
          <span class="text-xs text-slate-500">{{ (dealsByStage[stage.id] || []).length }}</span>
        </header>
        <div class="space-y-2">
          <div
            v-for="deal in dealsByStage[stage.id] || []"
            :key="deal.id"
            draggable="true"
            class="cursor-move rounded-lg border border-slate-200 bg-slate-50 p-3"
            @dragstart="draggingDealId = deal.id"
            @dblclick="openDealDetails(deal.id)"
          >
            <p class="text-sm font-semibold text-slate-900">{{ deal.name }}</p>
            <p class="text-xs text-slate-500">{{ deal.owner?.name || 'Unassigned' }}</p>
            <div class="mt-2 flex items-center justify-between">
              <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusBadgeClass(deal.status)">{{ toStatusLabel(deal.status) }}</span>
              <span class="text-xs text-slate-500">{{ dealDisplayValue(deal) }}</span>
            </div>
            <p class="mt-1 text-xs text-slate-500">Probability: {{ dealDisplayProbability(deal) }}</p>
            <div class="mt-2 flex items-center justify-end gap-2">
              <button class="rounded border p-1.5 text-slate-700 hover:bg-slate-100" title="View" @click.stop="openDealDetails(deal.id)">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
              </button>
              <button class="rounded border p-1.5 text-slate-700 hover:bg-slate-100" title="Edit" @click.stop="openEditDeal(deal)">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
              </button>
              <button class="rounded border p-1.5 text-rose-700 hover:bg-rose-50 disabled:opacity-60" title="Delete" :disabled="deletingDealId === deal.id" @click.stop="removeDeal(deal.id)">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M8 6V4h8v2m-1 0v14H9V6"/></svg>
              </button>
            </div>
          </div>
          <p v-if="(dealsByStage[stage.id] || []).length === 0" class="rounded-lg border border-dashed border-slate-300 p-3 text-center text-xs text-slate-400">
            No deals
          </p>
        </div>
      </article>
    </div>

    <div v-if="showEditDealModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-3xl rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">Edit Deal</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="showEditDealModal = false">Close</button>
        </div>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Deal Name <span class="text-red-500">*</span></label>
            <input v-model.trim="editDealForm.name" class="rc-input" placeholder="e.g. Q2 Enterprise Renewal" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Contact <span class="text-red-500">*</span></label>
            <select v-model="editDealForm.contact_id" class="rc-input">
              <option value="">Select contact</option>
              <option v-for="contact in dealsStore.contacts" :key="contact.id" :value="String(contact.id)">
                {{ contact.first_name }} {{ contact.last_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Company</label>
            <select v-model="editDealForm.company_id" class="rc-input">
              <option value="">Select company (optional)</option>
              <option v-for="company in dealsStore.companies" :key="company.id" :value="String(company.id)">{{ company.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Owner</label>
            <select v-model="editDealForm.owner_user_id" class="rc-input">
              <option value="">Select owner</option>
              <option v-for="user in dealsStore.users" :key="user.id" :value="String(user.id)">{{ user.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Pipeline <span class="text-red-500">*</span></label>
            <select v-model="editDealForm.pipeline_id" class="rc-input" @change="onEditPipelineChanged">
              <option value="">Select pipeline</option>
              <option v-for="pipeline in pipelinesStore.items" :key="pipeline.id" :value="String(pipeline.id)">{{ pipeline.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Stage <span class="text-red-500">*</span></label>
            <select v-model="editDealForm.pipeline_stage_id" class="rc-input">
              <option value="">Select stage</option>
              <option v-for="stage in selectedEditPipelineStages" :key="stage.id" :value="String(stage.id)">{{ stage.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Currency</label>
            <select v-model="editDealForm.currency_code" class="rc-input">
              <option v-for="currency in currencyOptions" :key="currency" :value="currency">{{ currency }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Deal Value</label>
            <input v-model="editDealForm.value" type="number" class="rc-input" placeholder="e.g. 250000" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Probability</label>
            <input v-model="editDealForm.probability" type="number" min="0" max="100" class="rc-input" placeholder="e.g. 40" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Expected Close Date</label>
            <input v-model="editDealForm.expected_close_date" type="date" class="rc-input" />
          </div>
        </div>
        <p v-if="dealsStore.errors.probability?.[0]" class="mt-2 text-sm text-red-600">{{ dealsStore.errors.probability[0] }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded border px-3 py-2 text-sm" @click="showEditDealModal = false">Cancel</button>
          <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="savingDeal" @click="submitEditDeal">
            <span v-if="savingDeal" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            {{ savingDeal ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showCreateDealModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-3xl rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">Create Deal</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="showCreateDealModal = false">Close</button>
        </div>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Deal Name <span class="text-red-500">*</span></label>
            <input v-model.trim="createDealForm.name" class="rc-input" placeholder="e.g. Q2 Enterprise Renewal" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Contact <span class="text-red-500">*</span></label>
            <select v-model="createDealForm.contact_id" class="rc-input">
              <option value="">Select contact</option>
              <option v-for="contact in dealsStore.contacts" :key="contact.id" :value="String(contact.id)">
                {{ contact.first_name }} {{ contact.last_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Company</label>
            <select v-model="createDealForm.company_id" class="rc-input">
              <option value="">Select company (optional)</option>
              <option v-for="company in dealsStore.companies" :key="company.id" :value="String(company.id)">{{ company.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Owner</label>
            <select v-model="createDealForm.owner_user_id" class="rc-input">
              <option value="">Select owner</option>
              <option v-for="user in dealsStore.users" :key="user.id" :value="String(user.id)">{{ user.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Pipeline <span class="text-red-500">*</span></label>
            <select v-model="createDealForm.pipeline_id" class="rc-input" @change="selectedPipelineId = Number(createDealForm.pipeline_id || 0) || ''">
              <option value="">Select pipeline</option>
              <option v-for="pipeline in pipelinesStore.items" :key="pipeline.id" :value="String(pipeline.id)">{{ pipeline.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Stage <span class="text-red-500">*</span></label>
            <select v-model="createDealForm.pipeline_stage_id" class="rc-input">
              <option value="">Select stage</option>
              <option v-for="stage in selectedPipelineStages" :key="stage.id" :value="String(stage.id)">{{ stage.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Currency</label>
            <select v-model="createDealForm.currency_code" class="rc-input">
              <option v-for="currency in currencyOptions" :key="currency" :value="currency">{{ currency }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Deal Value</label>
            <input v-model="createDealForm.value" type="number" class="rc-input" placeholder="e.g. 250000" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Probability</label>
            <input v-model="createDealForm.probability" type="number" min="0" max="100" class="rc-input" placeholder="e.g. 40" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-600">Expected Close Date</label>
            <input v-model="createDealForm.expected_close_date" type="date" class="rc-input" />
          </div>
        </div>
        <p v-if="dealsStore.errors.contact_id?.[0]" class="mt-2 text-sm text-red-600">{{ dealsStore.errors.contact_id[0] }}</p>
        <p v-if="dealsStore.errors.probability?.[0]" class="mt-2 text-sm text-red-600">{{ dealsStore.errors.probability[0] }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded border px-3 py-2 text-sm" @click="showCreateDealModal = false">Cancel</button>
          <button class="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="creatingDeal" @click="submitCreateDeal">
            <span v-if="creatingDeal" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            {{ creatingDeal ? 'Saving...' : 'Save Deal' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showPipelineModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-md rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">Create Pipeline</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="showPipelineModal = false">Close</button>
        </div>
        <input v-model.trim="pipelineForm.name" class="rc-input" placeholder="Pipeline name" />
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded border px-3 py-2 text-sm" @click="showPipelineModal = false">Cancel</button>
          <button class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="createPipeline">Create</button>
        </div>
      </div>
    </div>

    <div v-if="showStageModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-md rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">Create Stage</h3>
          <button class="rounded border px-2 py-1 text-xs" @click="showStageModal = false">Close</button>
        </div>
        <div class="grid gap-3">
          <input v-model.trim="stageForm.name" class="rc-input" placeholder="Stage name" />
          <input v-model="stageForm.stage_order" type="number" class="rc-input" placeholder="Stage order" />
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded border px-3 py-2 text-sm" @click="showStageModal = false">Cancel</button>
          <button class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" @click="createStage">Create</button>
        </div>
      </div>
    </div>
  </section>
</template>
