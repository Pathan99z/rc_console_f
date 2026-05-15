<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { productsApi } from '@/modules/products/services/product.api'
import type { ProductItem } from '@/modules/products/types/product.types'
import PrmResourceFormModal from '@/modules/prm/components/PrmResourceFormModal.vue'
import { usePrmResourcesStore } from '@/modules/prm/store/prm.resources.store'
import type { PartnerResourceItem, PrmResourceItem } from '@/modules/prm/types/prm.resources.types'

type ViewableResource = PrmResourceItem | PartnerResourceItem

const RESOURCE_CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'training', label: 'Training' },
  { value: 'brochure', label: 'Brochure' },
  { value: 'battle_card', label: 'Battle card' },
  { value: 'nda', label: 'NDA' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'sales', label: 'Sales' },
  { value: 'enablement', label: 'Enablement' },
  { value: 'other', label: 'Other' },
] as const

const store = usePrmResourcesStore()
const toast = useToast()
const { isPrivilegedUser, isPartnerChannelUser } = useAuth()

const showAdminExperience = computed(() => isPrivilegedUser.value)
const showPartnerExperience = computed(() => !isPrivilegedUser.value && isPartnerChannelUser.value)

const adminTab = ref<'library' | 'analytics'>('library')
const formOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formResource = ref<PrmResourceItem | null>(null)

const viewOpen = ref(false)
const viewRow = ref<ViewableResource | null>(null)

const filterProducts = ref<ProductItem[]>([])
const partnerFilterProducts = ref<ProductItem[]>([])

let adminSearchTimer: ReturnType<typeof setTimeout> | null = null
let partnerSearchTimer: ReturnType<typeof setTimeout> | null = null

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function rowCategory(row: { category?: string | null; resource_category?: string | null }) {
  return row.category || row.resource_category || '—'
}

function partnerTitle(row: PartnerResourceItem) {
  return (row.title || row.name || 'Resource').trim()
}

function rowProductName(row: PrmResourceItem | PartnerResourceItem) {
  const p = row.product
  if (p?.name) return p.sku ? `${p.name} (${p.sku})` : p.name
  if (row.product_id != null) return `Product #${row.product_id}`
  return '—'
}

function rowDownloads(row: ViewableResource) {
  const n = row.downloads_count ?? row.download_count ?? row.downloads
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

function viewHeading(row: ViewableResource) {
  return partnerTitle(row as PartnerResourceItem)
}

function visibilityLabel(row: PrmResourceItem | PartnerResourceItem) {
  const p = Boolean(row.partner_visible)
  const r = Boolean(row.reseller_visible)
  if (p && r) return { text: 'Partner & reseller', class: 'bg-violet-100 text-violet-800' }
  if (p) return { text: 'Partner', class: 'bg-sky-100 text-sky-800' }
  if (r) return { text: 'Reseller', class: 'bg-amber-100 text-amber-800' }
  return { text: 'None', class: 'bg-slate-100 text-slate-600' }
}

function statusBadge(status?: string) {
  const s = (status || '').toLowerCase()
  if (s === 'inactive') return { text: 'Inactive', class: 'bg-rose-100 text-rose-800' }
  return { text: 'Active', class: 'bg-emerald-100 text-emerald-800' }
}

function rowSignedUrl(row: PrmResourceItem): string | null {
  const u = row.signed_url
  return typeof u === 'string' && u.trim() ? u.trim() : null
}

function partnerPreviewUrl(row: PartnerResourceItem): string | null {
  const s = row.signed_url || row.preview_url || row.download_url
  return typeof s === 'string' && s.trim() ? s.trim() : null
}

function formatFileSizeBytes(n?: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—'
  if (n < 1024) return `${Math.round(n)} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function adminFileLine(res: PrmResourceItem | null): string {
  if (!res) return '—'
  const f = res.file
  if (f && typeof f === 'object') {
    const name = (f.original_name || f.name || res.file_name || 'File') as string
    const mime = (f.mime_type || res.mime_type || '—') as string
    const size = (f.size as number | undefined) ?? res.file_size
    return `${name} · ${mime} · ${formatFileSizeBytes(typeof size === 'number' ? size : null)}`
  }
  const bits = [res.file_name, res.mime_type, formatFileSizeBytes(typeof res.file_size === 'number' ? res.file_size : null)].filter(
    (x) => x && x !== '—',
  )
  return bits.length ? bits.join(' · ') : '—'
}

function adminSignedDocumentUrl(): string | null {
  const u = store.selectedResource?.signed_url
  return typeof u === 'string' && u.trim() ? u.trim() : null
}

function openDocumentUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function openRowListPreview(row: PrmResourceItem, e?: Event) {
  e?.preventDefault()
  const url = rowSignedUrl(row)
  if (!url) {
    toast.error('No preview link on this row. Use View to load the latest link.')
    return
  }
  openDocumentUrl(url)
}

function openViewedDocument() {
  if (showAdminExperience.value) {
    const url = adminSignedDocumentUrl()
    if (!url) {
      toast.error('No preview link available. Try again after the resource loads.')
      return
    }
    openDocumentUrl(url)
    return
  }
  const row = viewRow.value as PartnerResourceItem | null
  if (!row) return
  const url = partnerPreviewUrl(row)
  if (!url) {
    toast.error('No preview link available for this resource.')
    return
  }
  openDocumentUrl(url)
}

const viewModalTitle = computed(() => {
  if (showAdminExperience.value && store.selectedResource?.title) return String(store.selectedResource.title)
  if (viewRow.value) return viewHeading(viewRow.value)
  return 'Resource'
})

const viewModalDescription = computed(() => {
  if (showAdminExperience.value && store.selectedResource) {
    const d = store.selectedResource.description
    return typeof d === 'string' && d.trim() ? d : 'No description.'
  }
  const row = viewRow.value as PartnerResourceItem | null
  if (row?.description && String(row.description).trim()) return String(row.description).trim()
  return 'No description.'
})

const adminViewMetaSource = computed((): PrmResourceItem | null => {
  if (!showAdminExperience.value || !viewRow.value) return null
  return (store.selectedResource || (viewRow.value as PrmResourceItem)) as PrmResourceItem
})

async function loadFilterProducts() {
  try {
    const { data } = await productsApi.list({ page: 1, per_page: 100, status: 1 })
    filterProducts.value = data.data.items
  } catch {
    filterProducts.value = []
  }
}

async function loadPartnerFilterProducts() {
  try {
    const { data } = await productsApi.list({ page: 1, per_page: 100, status: 1 })
    partnerFilterProducts.value = data.data.items
  } catch {
    partnerFilterProducts.value = []
  }
}

function scheduleAdminReload() {
  if (adminSearchTimer) clearTimeout(adminSearchTimer)
  adminSearchTimer = setTimeout(() => {
    adminSearchTimer = null
    store.fetchAdminResources(1, store.adminResourcesPagination.per_page).catch(() => {
      toast.error(store.message || 'Failed to load resources.')
    })
  }, 400)
}

function schedulePartnerReload() {
  if (partnerSearchTimer) clearTimeout(partnerSearchTimer)
  partnerSearchTimer = setTimeout(() => {
    partnerSearchTimer = null
    store.fetchPartnerResources(1, store.partnerResourcesPagination.per_page).catch(() => {
      toast.error(store.message || 'Failed to load resources.')
    })
  }, 400)
}

watch(() => store.adminFilters.search, scheduleAdminReload)
watch(
  () => [store.adminFilters.category, store.adminFilters.product_id, store.adminFilters.status],
  () => {
    store.fetchAdminResources(1, store.adminResourcesPagination.per_page).catch(() => {
      toast.error(store.message || 'Failed to load resources.')
    })
  },
)

watch(() => store.partnerFilters.search, schedulePartnerReload)
watch(
  () => [store.partnerFilters.resource_category, store.partnerFilters.product_id],
  () => {
    store.fetchPartnerResources(1, store.partnerResourcesPagination.per_page).catch(() => {
      toast.error(store.message || 'Failed to load resources.')
    })
  },
)

watch(adminTab, (t) => {
  if (t === 'analytics' && showAdminExperience.value) {
    store.fetchAnalytics().catch(() => toast.error(store.message || 'Failed to load analytics.'))
  }
})

onMounted(async () => {
  if (showAdminExperience.value) {
    await loadFilterProducts()
    try {
      await store.fetchAdminResources(1, 15)
    } catch {
      toast.error(store.message || 'Failed to load resources.')
    }
  } else if (showPartnerExperience.value) {
    await loadPartnerFilterProducts()
    try {
      await store.fetchPartnerResources(1, 12)
    } catch {
      toast.error(store.message || 'Failed to load resources.')
    }
  }
})

function openCreate() {
  formMode.value = 'create'
  formResource.value = null
  formOpen.value = true
}

function openEdit(row: PrmResourceItem) {
  formMode.value = 'edit'
  formResource.value = row
  formOpen.value = true
}

function openView(row: ViewableResource) {
  viewRow.value = row
  viewOpen.value = true
  if (showAdminExperience.value) {
    store.clearSelection()
    store
      .fetchResource((row as PrmResourceItem).id)
      .catch(() => {
        toast.error(store.message || 'Failed to load resource.')
        closeView()
      })
  } else {
    store.clearSelection()
  }
}

function closeView() {
  viewOpen.value = false
  viewRow.value = null
  store.clearSelection()
}

async function onToggleStatus(row: PrmResourceItem) {
  const next = (row.status || '').toLowerCase() === 'inactive' ? 'active' : 'inactive'
  try {
    await store.toggleStatus(row.id, next)
    toast.success(store.message || 'Status updated.')
  } catch {
    toast.error(store.message || 'Status update failed.')
  }
}

async function onDelete(row: PrmResourceItem) {
  if (!confirm(`Delete resource "${row.title || 'Untitled'}"? This cannot be undone.`)) return
  try {
    await store.deleteResource(row.id)
    toast.success(store.message || 'Deleted.')
  } catch {
    toast.error(store.message || 'Delete failed.')
  }
}

async function onPartnerDownload(row: PartnerResourceItem) {
  try {
    const url = await store.downloadPartnerResource(row.id)
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
      toast.success(store.message || 'Download started.')
    } else {
      toast.success(store.message || 'Download recorded.')
    }
    await store.fetchPartnerResources(store.partnerResourcesPagination.current_page, store.partnerResourcesPagination.per_page)
  } catch {
    toast.error(store.message || 'Download failed.')
  }
}

function onFormSaved() {
  store.fetchAdminResources(store.adminResourcesPagination.current_page, store.adminResourcesPagination.per_page)
}
</script>

<template>
  <!-- ——— Admin / company & global ——— -->
  <section v-if="showAdminExperience" class="space-y-6">
    <header class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900">PRM Resource Center</h2>
        <p class="text-sm text-slate-500">Manage partner-facing sales, training, and enablement resources.</p>
      </div>
      <nav class="flex gap-1 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="adminTab === 'library' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          @click="adminTab = 'library'"
        >
          Resource library
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="adminTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          @click="adminTab = 'analytics'"
        >
          Analytics
        </button>
      </nav>
    </header>

    <!-- Library -->
    <div v-show="adminTab === 'library'" class="space-y-4">
      <div class="flex flex-col gap-3 rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-sm lg:flex-row lg:flex-wrap lg:items-end">
        <div class="min-w-[160px] flex-1 space-y-1">
          <label for="prm-adm-search" class="text-xs font-medium text-slate-600">Search</label>
          <input id="prm-adm-search" v-model.trim="store.adminFilters.search" type="search" class="rc-input w-full" placeholder="Title or description…" />
        </div>
        <div class="w-full min-w-[140px] space-y-1 sm:w-auto">
          <label for="prm-adm-cat" class="text-xs font-medium text-slate-600">Category</label>
          <select id="prm-adm-cat" v-model="store.adminFilters.category" class="rc-input w-full min-w-[140px]">
            <option v-for="c in RESOURCE_CATEGORIES" :key="c.value || 'all'" :value="c.value">{{ c.label }}</option>
          </select>
        </div>
        <div class="w-full min-w-[160px] space-y-1 sm:w-auto">
          <label for="prm-adm-prod" class="text-xs font-medium text-slate-600">Product</label>
          <select id="prm-adm-prod" v-model="store.adminFilters.product_id" class="rc-input w-full min-w-[160px]">
            <option value="">All products</option>
            <option v-for="p in filterProducts" :key="p.id" :value="String(p.id)">{{ p.name }}</option>
          </select>
        </div>
        <div class="w-full min-w-[120px] space-y-1 sm:w-auto">
          <label for="prm-adm-status" class="text-xs font-medium text-slate-600">Status</label>
          <select id="prm-adm-status" v-model="store.adminFilters.status" class="rc-input w-full">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button type="button" class="btn-primary shrink-0 rounded-lg px-4 py-2 text-sm font-semibold" @click="openCreate">Upload resource</button>
      </div>

      <div class="overflow-hidden rounded-xl border border-[var(--rc-border-soft)] bg-white shadow-sm">
        <div v-if="store.adminResourcesLoading" class="divide-y divide-slate-100">
          <div v-for="n in 5" :key="n" class="animate-pulse px-4 py-4">
            <div class="h-4 w-1/3 rounded bg-slate-200" />
            <div class="mt-2 h-3 w-1/4 rounded bg-slate-100" />
          </div>
        </div>
        <template v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-4 py-3 text-left">Title</th>
                  <th class="px-4 py-3 text-left">Category</th>
                  <th class="px-4 py-3 text-left">Product</th>
                  <th class="px-4 py-3 text-left">Visibility</th>
                  <th class="px-4 py-3 text-left">Status</th>
                  <th class="px-4 py-3 text-right">Downloads</th>
                  <th class="px-4 py-3 text-left">Updated</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!store.adminResources.length">
                  <td colspan="8" class="px-4 py-12 text-center text-slate-500">No resources match your filters.</td>
                </tr>
                <tr
                  v-for="row in store.adminResources"
                  v-else
                  :key="row.id"
                  class="border-t border-[var(--rc-border-soft)] transition-colors hover:bg-slate-50/80"
                >
                  <td class="px-4 py-3 font-medium text-slate-900">{{ row.title || 'Untitled' }}</td>
                  <td class="px-4 py-3 capitalize text-slate-600">{{ rowCategory(row) }}</td>
                  <td class="max-w-[200px] truncate px-4 py-3 text-slate-700">{{ rowProductName(row) }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium" :class="visibilityLabel(row).class">
                      {{ visibilityLabel(row).text }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium" :class="statusBadge(row.status).class">
                      {{ statusBadge(row.status).text }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right tabular-nums text-slate-700">{{ rowDownloads(row) }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ formatDate(row.updated_at) }}</td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex flex-wrap justify-end gap-1">
                      <button type="button" class="rounded border border-slate-200 px-2 py-1 text-xs font-medium hover:bg-white" @click="openView(row)">
                        View
                      </button>
                      <button
                        v-if="rowSignedUrl(row)"
                        type="button"
                        class="rounded border border-sky-200 px-2 py-1 text-xs font-medium text-sky-800 hover:bg-sky-50"
                        @click="openRowListPreview(row, $event)"
                      >
                        Preview
                      </button>
                      <button type="button" class="rounded border border-slate-200 px-2 py-1 text-xs font-medium hover:bg-white" @click="openEdit(row)">
                        Edit
                      </button>
                      <button
                        type="button"
                        class="rounded border border-slate-200 px-2 py-1 text-xs font-medium hover:bg-white"
                        @click="onToggleStatus(row)"
                      >
                        {{ (row.status || '').toLowerCase() === 'inactive' ? 'Activate' : 'Deactivate' }}
                      </button>
                      <button
                        type="button"
                        class="rounded border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-40"
                        :disabled="store.deletingId === row.id"
                        @click="onDelete(row)"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>

      <PaginationControls
        :current-page="store.adminResourcesPagination.current_page"
        :last-page="store.adminResourcesPagination.last_page"
        @change="(p) => store.fetchAdminResources(p, store.adminResourcesPagination.per_page).catch(() => toast.error(store.message || 'Failed to load page.'))"
      />
    </div>

    <!-- Analytics -->
    <div v-show="adminTab === 'analytics'" class="space-y-6">
      <div v-if="store.analyticsLoading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="n in 4" :key="n" class="h-24 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <template v-else-if="store.analytics">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase text-slate-500">Total resources</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ store.analytics.totalResources }}</p>
          </article>
          <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase text-slate-500">Active</p>
            <p class="mt-2 text-2xl font-bold text-emerald-700">{{ store.analytics.activeResources }}</p>
          </article>
          <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase text-slate-500">Inactive</p>
            <p class="mt-2 text-2xl font-bold text-rose-700">{{ store.analytics.inactiveResources }}</p>
          </article>
          <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase text-slate-500">Total downloads</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ store.analytics.totalDownloads }}</p>
          </article>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
            <h3 class="text-sm font-semibold text-slate-900">Top downloaded resources</h3>
            <div class="mt-4 overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead class="text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th class="pb-2 pr-4">Title</th>
                    <th class="pb-2 text-right">Downloads</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in store.analytics.topDownloaded" :key="r.id ?? i">
                    <td class="py-2 pr-4 text-slate-800">{{ (r.title as string) || `Resource #${r.id}` }}</td>
                    <td class="py-2 text-right tabular-nums text-slate-600">{{ r.download_count ?? r.downloads ?? '—' }}</td>
                  </tr>
                  <tr v-if="!store.analytics.topDownloaded?.length">
                    <td colspan="2" class="py-6 text-center text-slate-500">No data yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
          <article class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm">
            <h3 class="text-sm font-semibold text-slate-900">Top partner downloaders</h3>
            <div class="mt-4 overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead class="text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th class="pb-2 pr-4">Organization</th>
                    <th class="pb-2 text-right">Downloads</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in store.analytics.topDownloaders" :key="r.organization_id ?? i">
                    <td class="py-2 pr-4 text-slate-800">
                      {{ (r.organization_name as string) || (r.partner_organization_name as string) || '—' }}
                    </td>
                    <td class="py-2 text-right tabular-nums text-slate-600">{{ r.download_count ?? r.downloads ?? '—' }}</td>
                  </tr>
                  <tr v-if="!store.analytics.topDownloaders?.length">
                    <td colspan="2" class="py-6 text-center text-slate-500">No data yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </template>
      <p v-else class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        Analytics could not be loaded.
      </p>
    </div>
  </section>

  <!-- ——— Partner / reseller ——— -->
  <section v-else-if="showPartnerExperience" class="space-y-6">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Resource Center</h2>
      <p class="text-sm text-slate-500">Sales, training, and partner enablement materials.</p>
    </header>

    <div class="flex flex-col gap-3 rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-end">
      <div class="min-w-[180px] flex-1 space-y-1">
        <label for="prm-pt-search" class="text-xs font-medium text-slate-600">Search</label>
        <input id="prm-pt-search" v-model.trim="store.partnerFilters.search" type="search" class="rc-input w-full" placeholder="Search resources…" />
      </div>
      <div class="min-w-[140px] space-y-1">
        <label for="prm-pt-cat" class="text-xs font-medium text-slate-600">Category</label>
        <select id="prm-pt-cat" v-model="store.partnerFilters.resource_category" class="rc-input w-full">
          <option v-for="c in RESOURCE_CATEGORIES" :key="'p-' + (c.value || 'all')" :value="c.value">{{ c.label }}</option>
        </select>
      </div>
      <div class="min-w-[160px] space-y-1">
        <label for="prm-pt-prod" class="text-xs font-medium text-slate-600">Product</label>
        <select id="prm-pt-prod" v-model="store.partnerFilters.product_id" class="rc-input w-full">
          <option value="">All products</option>
          <option v-for="p in partnerFilterProducts" :key="p.id" :value="String(p.id)">{{ p.name }}</option>
        </select>
      </div>
    </div>

    <div v-if="store.partnerResourcesLoading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 6" :key="n" class="h-48 animate-pulse rounded-xl bg-slate-100" />
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="row in store.partnerResources"
        :key="row.id"
        class="flex flex-col rounded-xl border border-[var(--rc-border-soft)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ rowCategory(row) }}</p>
        <h3 class="mt-1 line-clamp-2 text-base font-semibold text-slate-900">{{ partnerTitle(row) }}</h3>
        <p class="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{{ row.description || '—' }}</p>
        <p class="mt-3 text-xs text-slate-500">Product: {{ rowProductName(row) }}</p>
        <p class="text-xs text-slate-400">Updated {{ formatDate(row.updated_at || row.created_at) }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" @click="openView(row)">
            View
          </button>
          <button
            type="button"
            class="btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            :disabled="store.downloadingId === row.id"
            @click="onPartnerDownload(row)"
          >
            {{ store.downloadingId === row.id ? 'Working…' : 'Download' }}
          </button>
        </div>
      </article>
    </div>

    <p v-if="!store.partnerResourcesLoading && !store.partnerResources.length" class="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
      No resources available.
    </p>

    <PaginationControls
      :current-page="store.partnerResourcesPagination.current_page"
      :last-page="store.partnerResourcesPagination.last_page"
      @change="(p) => store.fetchPartnerResources(p, store.partnerResourcesPagination.per_page).catch(() => toast.error(store.message || 'Failed to load page.'))"
    />
  </section>

  <section v-else class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
    <h2 class="text-lg font-semibold text-slate-800">Resource Center</h2>
    <p class="mt-2 text-sm text-slate-600">
      This area is available to company administrators (full management) and partner or reseller channel users (downloads).
    </p>
  </section>

  <PrmResourceFormModal
    v-if="showAdminExperience"
    v-model="formOpen"
    :mode="formMode"
    :resource="formResource"
    @saved="onFormSaved"
  />

  <div
    v-if="viewOpen && viewRow"
    class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
    role="dialog"
    aria-modal="true"
    @click.self="closeView"
  >
    <div class="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--rc-border-soft)] bg-white p-6 shadow-2xl">
      <template v-if="showAdminExperience && store.selectedResourceLoading">
        <p class="py-10 text-center text-sm text-slate-500">Loading resource…</p>
      </template>
      <template v-else>
        <h3 class="text-lg font-semibold text-slate-900">{{ viewModalTitle }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ viewModalDescription }}</p>

        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between gap-4 border-t border-slate-100 pt-2">
            <dt class="text-slate-500">Category</dt>
            <dd class="font-medium capitalize text-slate-800">{{ rowCategory(viewRow) }}</dd>
          </div>
          <div class="flex justify-between gap-4 border-t border-slate-100 pt-2">
            <dt class="text-slate-500">Product</dt>
            <dd class="text-right font-medium text-slate-800">{{ rowProductName(viewRow) }}</dd>
          </div>
          <template v-if="showAdminExperience && adminViewMetaSource">
            <div class="flex justify-between gap-4 border-t border-slate-100 pt-2">
              <dt class="text-slate-500">Visibility</dt>
              <dd>
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium" :class="visibilityLabel(adminViewMetaSource).class">
                  {{ visibilityLabel(adminViewMetaSource).text }}
                </span>
              </dd>
            </div>
            <div class="flex justify-between gap-4 border-t border-slate-100 pt-2">
              <dt class="text-slate-500">Status</dt>
              <dd>
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium" :class="statusBadge(adminViewMetaSource.status).class">
                  {{ statusBadge(adminViewMetaSource.status).text }}
                </span>
              </dd>
            </div>
            <div class="flex justify-between gap-4 border-t border-slate-100 pt-2">
              <dt class="text-slate-500">Downloads</dt>
              <dd class="tabular-nums font-medium text-slate-800">{{ rowDownloads(adminViewMetaSource) }}</dd>
            </div>
            <div class="flex justify-between gap-4 border-t border-slate-100 pt-2">
              <dt class="text-slate-500">File</dt>
              <dd class="max-w-[60%] text-right text-xs text-slate-800">{{ adminFileLine(store.selectedResource) }}</dd>
            </div>
          </template>
        </dl>

        <div class="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium" @click="closeView">Close</button>
          <button
            v-if="showAdminExperience && !store.selectedResourceLoading && adminSignedDocumentUrl()"
            type="button"
            class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold"
            @click="openViewedDocument"
          >
            Open document
          </button>
          <button
            v-if="!showAdminExperience && partnerPreviewUrl(viewRow as PartnerResourceItem)"
            type="button"
            class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold"
            @click="openViewedDocument"
          >
            Open document
          </button>
          <button
            v-if="!showAdminExperience"
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-50"
            :disabled="store.downloadingId === viewRow.id"
            @click="onPartnerDownload(viewRow as PartnerResourceItem)"
          >
            {{ store.downloadingId === viewRow.id ? 'Working…' : 'Download' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
