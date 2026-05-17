<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import { useAuth } from '@/modules/auth/composables/useAuth'
import AuditLogDetailDrawer from '@/modules/audit-logs/components/AuditLogDetailDrawer.vue'
import AuditLogFilters from '@/modules/audit-logs/components/AuditLogFilters.vue'
import AuditLogTable from '@/modules/audit-logs/components/AuditLogTable.vue'
import { useAuditLogAccess } from '@/modules/audit-logs/composables/useAuditLogAccess'
import { useAuditLogStore } from '@/modules/audit-logs/store/auditLog.store'
import type { AuditLogListItem } from '@/modules/audit-logs/types/auditLog.types'
import { defaultAuditFilters } from '@/modules/audit-logs/utils/auditLogParams'

const store = useAuditLogStore()
const toast = useToast()
const { canViewAuditLogs, canExportAuditLogs } = useAuditLogAccess()
const { isGlobalAdmin } = useAuth()

const listError = ref(false)
const page = ref(1)
const showDetail = ref(false)
const selectedPublicId = ref<string | null>(null)

const filters = reactive({ ...defaultAuditFilters() })

const headerToggles = computed({
  get: () => ({
    include_archived: filters.include_archived,
    include_deal_histories: filters.include_deal_histories,
  }),
  set: (value: { include_archived: boolean; include_deal_histories: boolean }) => {
    filters.include_archived = value.include_archived
    filters.include_deal_histories = value.include_deal_histories
  },
})

function syncFiltersToStore() {
  Object.assign(store.filters, filters)
}

async function load(pageNum = page.value) {
  if (!canViewAuditLogs.value || store.accessDenied) return
  listError.value = false
  syncFiltersToStore()
  try {
    await store.fetchAuditLogs(pageNum, store.pagination.per_page)
    page.value = store.pagination.current_page
  } catch {
    if (store.accessDenied) return
    listError.value = true
    toast.error(store.message || 'Unable to load audit logs.')
  }
}

async function applyFilters() {
  page.value = 1
  await load(1)
}

function clearFilters() {
  store.resetFilters()
  Object.assign(filters, defaultAuditFilters())
  page.value = 1
  void load(1)
}

async function refresh() {
  await load(page.value)
}

async function onView(item: AuditLogListItem) {
  selectedPublicId.value = item.public_id
  showDetail.value = true
  store.clearDetail()
  try {
    await store.fetchAuditLogDetail(item.public_id)
  } catch {
    toast.error(store.message || 'Unable to load audit event detail.')
    showDetail.value = false
  }
}

function closeDetail() {
  showDetail.value = false
  selectedPublicId.value = null
  store.clearDetail()
}

function parseExportFilename(headers: Record<string, string>): string {
  const disposition = headers['content-disposition'] || headers['Content-Disposition']
  if (disposition) {
    const match = /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(disposition)
    if (match?.[1]) return decodeURIComponent(match[1].replace(/"/g, '').trim())
  }
  const stamp = new Date().toISOString().slice(0, 10)
  return `audit-logs-${stamp}.csv`
}

async function exportCsv() {
  if (!canExportAuditLogs.value || store.exporting) return
  syncFiltersToStore()
  try {
    const { blob, headers } = await store.exportAuditLogs(page.value, store.pagination.per_page)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', parseExportFilename(headers))
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success('Audit log export started.')
  } catch {
    toast.error(store.message || 'Export failed.')
  }
}

watch(
  () => [filters.include_archived, filters.include_deal_histories],
  () => {
    if (!canViewAuditLogs.value) return
    page.value = 1
    void load(1)
  },
  { flush: 'post' },
)

onMounted(() => {
  if (!canViewAuditLogs.value || store.accessDenied) return
  Object.assign(filters, store.filters)
  void load(1)
})
</script>

<template>
  <section v-if="!canViewAuditLogs" class="rounded-xl border bg-white p-8 text-center text-sm text-slate-600">
    You do not have permission to view business audit logs.
  </section>

  <section v-else-if="store.accessDenied" class="rounded-xl border bg-white p-8 text-center text-sm text-slate-600">
    Business audit logs are not available for your account.
  </section>

  <section v-else class="space-y-5">
    <header class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div>
        <h2 class="text-xl font-bold tracking-tight text-slate-900">Business Audit Logs</h2>
        <p class="mt-1 max-w-2xl text-sm text-slate-600">
          Track critical business, security, and operational events across your organization.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <label class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
          <input v-model="headerToggles.include_archived" type="checkbox" class="rounded border-slate-300" />
          Archived
        </label>
        <label class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
          <input v-model="headerToggles.include_deal_histories" type="checkbox" class="rounded border-slate-300" />
          Deal histories
        </label>
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          :disabled="store.listLoading"
          @click="refresh"
        >
          {{ store.listLoading ? 'Refreshing…' : 'Refresh' }}
        </button>
        <button
          v-if="canExportAuditLogs"
          type="button"
          class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          :disabled="store.exporting"
          @click="exportCsv"
        >
          {{ store.exporting ? 'Exporting…' : 'Export CSV' }}
        </button>
      </div>
    </header>

    <AuditLogFilters
      v-model="filters"
      :show-tenant-filter="isGlobalAdmin"
      :is-global-admin="isGlobalAdmin"
      @apply="applyFilters"
      @clear="clearFilters"
    />

    <AuditLogTable
      :rows="store.items"
      :loading="store.listLoading"
      :error="listError"
      @view="onView"
    />

    <PaginationControls
      v-if="store.pagination.last_page > 1 || store.pagination.total > 0"
      :current-page="store.pagination.current_page"
      :last-page="store.pagination.last_page"
      @change="(p) => { page = p; void load(p) }"
    />

    <AuditLogDetailDrawer
      :open="showDetail"
      :detail="store.currentDetail"
      :loading="store.detailLoading"
      @close="closeDetail"
    />
  </section>
</template>
