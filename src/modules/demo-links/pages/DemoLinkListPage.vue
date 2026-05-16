<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import DemoLinkCard from '@/modules/demo-links/components/DemoLinkCard.vue'
import TaskConfirmModal from '@/modules/tasks/components/TaskConfirmModal.vue'
import { useDemoLinkAccess } from '@/modules/demo-links/composables/useDemoLinkAccess'
import { useDemoLinkStore } from '@/modules/demo-links/store/demoLink.store'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'
import { productsApi } from '@/modules/products/services/product.api'
import type { ProductItem } from '@/modules/products/types/product.types'
import { orgDisplayName } from '@/modules/demo-links/utils/demoLinkFormat'
import type { DemoLinkItem } from '@/modules/demo-links/types/demoLink.types'

const router = useRouter()
const store = useDemoLinkStore()
const toast = useToast()
const { canManageDemoLinks } = useDemoLinkAccess()

const search = ref('')
const searchDebounced = ref('')
const isActive = ref<'' | '1' | '0'>('')
const ownerOrgId = ref('')
const productId = ref('')
const page = ref(1)

const deleteTarget = ref<DemoLinkItem | null>(null)
const passwordModal = ref<{ open: boolean; loading: boolean; password: string; username: string }>({
  open: false,
  loading: false,
  password: '',
  username: '',
})
const passwordRevealed = ref(false)

const ownerOrgs = ref<OrganizationItem[]>([])
const products = ref<ProductItem[]>([])

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, (v) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchDebounced.value = v.trim()
    page.value = 1
  }, 350)
})

watch([searchDebounced, isActive, ownerOrgId, productId, page], () => {
  void loadList()
})

onMounted(async () => {
  await Promise.all([loadFilterOptions(), loadList()])
})

async function loadFilterOptions() {
  try {
    const [partnerRes, resellerRes, productRes] = await Promise.all([
      organizationsApi.list({ page: 1, per_page: 100, type: 'partner', status: 'active' }),
      organizationsApi.list({ page: 1, per_page: 100, type: 'reseller', status: 'active' }),
      productsApi.list({ page: 1, per_page: 100, status: 1 }),
    ])
    const map = new Map<number, OrganizationItem>()
    for (const o of partnerRes.data.data.items) map.set(o.id, o)
    for (const o of resellerRes.data.data.items) map.set(o.id, o)
    ownerOrgs.value = [...map.values()]
    products.value = productRes.data.data.items
  } catch {
    ownerOrgs.value = []
    products.value = []
  }
}

async function loadList() {
  try {
    await store.fetchDemoLinks({
      page: page.value,
      per_page: 12,
      search: searchDebounced.value || undefined,
      is_active: isActive.value === '' ? '' : isActive.value === '1',
      owner_organization_id: ownerOrgId.value ? Number(ownerOrgId.value) : undefined,
      product_id: productId.value ? Number(productId.value) : undefined,
    })
  } catch {
    toast.error(store.message || 'Failed to load demo links.')
  }
}

function clearFilters() {
  search.value = ''
  searchDebounced.value = ''
  isActive.value = ''
  ownerOrgId.value = ''
  productId.value = ''
  page.value = 1
}

function openDemo(link: DemoLinkItem) {
  if (!link.demo_url) return
  window.open(link.demo_url, '_blank', 'noopener,noreferrer')
}

async function onCheckStatus(link: DemoLinkItem) {
  try {
    await store.checkDemoLinkStatus(link.id)
    toast.success(store.message || 'Status updated.')
  } catch {
    toast.error(store.message || 'Status check failed.')
  }
}

function onEdit(link: DemoLinkItem) {
  router.push(`/app/demo-links/${link.id}/edit`)
}

function requestDelete(link: DemoLinkItem) {
  deleteTarget.value = link
}

async function confirmDelete() {
  const link = deleteTarget.value
  deleteTarget.value = null
  if (!link) return
  try {
    await store.deleteDemoLink(link.id)
    toast.success(store.message || 'Demo link deleted.')
    await loadList()
  } catch {
    toast.error(store.message || 'Delete failed.')
  }
}

async function revealPassword(link: DemoLinkItem) {
  passwordModal.value = { open: true, loading: true, password: '', username: link.demo_username || '' }
  passwordRevealed.value = false
  try {
    const detail = await store.fetchDemoLink(link.id, true)
    passwordModal.value.password = detail.demo_password || ''
    passwordModal.value.username = detail.demo_username || link.demo_username || ''
  } catch {
    toast.error(store.message || 'Could not reveal credentials.')
    passwordModal.value.open = false
  } finally {
    passwordModal.value.loading = false
  }
}

function closePasswordModal() {
  passwordModal.value.open = false
  passwordRevealed.value = false
  passwordModal.value.password = ''
}

const isChecking = (id: number) => store.statusCheckingId === id
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Demo Links</h2>
        <p class="text-sm text-slate-500">Manage internal and shared product demo access.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          @click="loadList"
        >
          Refresh
        </button>
        <RouterLink
          v-if="canManageDemoLinks"
          to="/app/demo-links/create"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + New Demo Link
        </RouterLink>
      </div>
    </header>

    <div class="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <label class="min-w-[10rem] flex-1 text-sm">
        <span class="text-slate-600">Search</span>
        <input v-model="search" class="rc-input mt-1 w-full" placeholder="Title or description" />
      </label>
      <label class="text-sm">
        <span class="text-slate-600">Status</span>
        <select v-model="isActive" class="rc-input mt-1 w-32">
          <option value="">All</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </label>
      <label class="text-sm">
        <span class="text-slate-600">Owner organization</span>
        <select v-model="ownerOrgId" class="rc-input mt-1 w-44">
          <option value="">All</option>
          <option v-for="org in ownerOrgs" :key="org.id" :value="String(org.id)">{{ orgDisplayName(org) }}</option>
        </select>
      </label>
      <label class="text-sm">
        <span class="text-slate-600">Product</span>
        <select v-model="productId" class="rc-input mt-1 w-40">
          <option value="">All</option>
          <option v-for="p in products" :key="p.id" :value="String(p.id)">{{ p.name }}</option>
        </select>
      </label>
      <button type="button" class="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700" @click="clearFilters">
        Clear filters
      </button>
    </div>

    <div v-if="store.loading" class="rounded-xl border bg-white px-4 py-16 text-center text-slate-500">
      Loading demo links…
    </div>
    <div v-else-if="!store.demoLinks.length" class="rounded-xl border bg-white px-4 py-16 text-center text-slate-500">
      No demo links match your filters.
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <DemoLinkCard
        v-for="link in store.demoLinks"
        :key="link.id"
        :link="link"
        :checking="isChecking(link.id)"
        @open="openDemo(link)"
        @check-status="onCheckStatus(link)"
        @edit="onEdit(link)"
        @delete="requestDelete(link)"
        @reveal-password="revealPassword(link)"
      />
    </div>

    <PaginationControls
      :current-page="store.pagination.current_page"
      :last-page="store.pagination.last_page"
      @change="(p) => { page = p }"
    />

    <TaskConfirmModal
      :open="Boolean(deleteTarget)"
      title="Delete demo link"
      :message="deleteTarget ? `Delete “${deleteTarget.title}”? This cannot be undone.` : ''"
      confirm-label="Delete"
      danger
      @close="deleteTarget = null"
      @confirm="confirmDelete"
    />

    <div
      v-if="passwordModal.open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      @click.self="closePasswordModal"
    >
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 class="text-lg font-semibold text-slate-900">Demo credentials</h3>
        <p v-if="passwordModal.loading" class="mt-4 text-sm text-slate-500">Loading…</p>
        <template v-else>
          <dl class="mt-4 space-y-3 text-sm">
            <div>
              <dt class="text-slate-500">Username</dt>
              <dd class="font-mono text-slate-900">{{ passwordModal.username || '—' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Password</dt>
              <dd class="font-mono text-slate-900">
                <span v-if="!passwordRevealed">••••••••</span>
                <span v-else>{{ passwordModal.password || '—' }}</span>
              </dd>
            </div>
          </dl>
          <button
            type="button"
            class="mt-4 text-sm font-semibold text-indigo-600"
            @click="passwordRevealed = !passwordRevealed"
          >
            {{ passwordRevealed ? 'Hide password' : 'Reveal password' }}
          </button>
        </template>
        <div class="mt-5 flex justify-end">
          <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="closePasswordModal">Close</button>
        </div>
      </div>
    </div>
  </section>
</template>
