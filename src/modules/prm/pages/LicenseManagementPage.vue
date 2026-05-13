<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import PaginationControls from '@/shared/components/PaginationControls.vue'
import { useToast } from '@/shared/utils/useToast'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { usePrmStore } from '@/modules/prm/store/prm.store'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import { productsApi } from '@/modules/products/services/product.api'
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'
import type { ProductItem } from '@/modules/products/types/product.types'
import type { LicenseEntitlementItem } from '@/modules/prm/types/prm.types'

const prmStore = usePrmStore()
const toast = useToast()
const { isGlobalAdmin, isCompanyAdmin } = useAuth()

const canAllocate = computed(() => isGlobalAdmin.value || isCompanyAdmin.value)

const allocateForm = reactive({
  holder_organization_id: '' as string,
  product_id: '' as string,
  units_total: '' as string,
  notes: '',
})

const holderSearch = ref('')
const productSearch = ref('')
const holderOptions = ref<OrganizationItem[]>([])
const productOptions = ref<ProductItem[]>([])
const holdersLoading = ref(false)
const productsLoading = ref(false)
const pinnedHolder = ref<OrganizationItem | null>(null)
const pinnedProduct = ref<ProductItem | null>(null)

let holderDebounce: ReturnType<typeof setTimeout> | null = null
let productDebounce: ReturnType<typeof setTimeout> | null = null

const consumeUnits = ref('')
const consumeTargetId = ref<number | null>(null)
const consumeTargetRow = ref<LicenseEntitlementItem | null>(null)
const allocating = ref(false)
const consuming = ref(false)

function orgLabel(o: OrganizationItem) {
  return (o.display_name || o.legal_name || '').trim() || `Organization #${o.id}`
}

function productLabel(p: ProductItem) {
  const base = (p.name || '').trim() || `Product #${p.id}`
  return p.sku ? `${base} · ${p.sku}` : base
}

const mergedHolderOptions = computed(() => {
  const list = [...holderOptions.value]
  const id = Number(allocateForm.holder_organization_id)
  if (pinnedHolder.value && Number.isFinite(id) && id === pinnedHolder.value.id && !list.some((o) => o.id === id)) {
    list.unshift(pinnedHolder.value)
  }
  return list
})

const mergedProductOptions = computed(() => {
  const list = [...productOptions.value]
  const id = Number(allocateForm.product_id)
  if (pinnedProduct.value && Number.isFinite(id) && id === pinnedProduct.value.id && !list.some((p) => p.id === id)) {
    list.unshift(pinnedProduct.value)
  }
  return list
})

async function fetchHolderOptions() {
  holdersLoading.value = true
  const q = holderSearch.value.trim() || undefined
  try {
    const [partnerRes, resellerRes] = await Promise.all([
      organizationsApi.list({ page: 1, per_page: 100, type: 'partner', status: 'active', search: q }),
      organizationsApi.list({ page: 1, per_page: 100, type: 'reseller', status: 'active', search: q }),
    ])
    const byId = new Map<number, OrganizationItem>()
    for (const o of partnerRes.data.data.items) byId.set(o.id, o)
    for (const o of resellerRes.data.data.items) byId.set(o.id, o)
    holderOptions.value = [...byId.values()].sort((a, b) => orgLabel(a).localeCompare(orgLabel(b)))
  } catch {
    holderOptions.value = []
  } finally {
    holdersLoading.value = false
  }
}

function scheduleHolderFetch() {
  if (holderDebounce) clearTimeout(holderDebounce)
  holderDebounce = setTimeout(() => {
    holderDebounce = null
    void fetchHolderOptions()
  }, 300)
}

async function fetchProductOptions() {
  productsLoading.value = true
  const q = productSearch.value.trim() || undefined
  try {
    const { data } = await productsApi.list({
      page: 1,
      per_page: 100,
      search: q,
      status: 1,
    })
    productOptions.value = data.data.items
  } catch {
    productOptions.value = []
  } finally {
    productsLoading.value = false
  }
}

function scheduleProductFetch() {
  if (productDebounce) clearTimeout(productDebounce)
  productDebounce = setTimeout(() => {
    productDebounce = null
    void fetchProductOptions()
  }, 300)
}

watch(holderSearch, scheduleHolderFetch)
watch(productSearch, scheduleProductFetch)

watch(holderOptions, (opts) => {
  const id = Number(allocateForm.holder_organization_id)
  if (!allocateForm.holder_organization_id || !Number.isFinite(id) || id <= 0) return
  const found = opts.find((o) => o.id === id)
  if (found) pinnedHolder.value = found
})

watch(productOptions, (opts) => {
  const id = Number(allocateForm.product_id)
  if (!allocateForm.product_id || !Number.isFinite(id) || id <= 0) return
  const found = opts.find((p) => p.id === id)
  if (found) pinnedProduct.value = found
})

watch(
  () => allocateForm.holder_organization_id,
  (v) => {
    if (!v) {
      pinnedHolder.value = null
      return
    }
    const id = Number(v)
    const found = holderOptions.value.find((o) => o.id === id)
    if (found) pinnedHolder.value = found
  },
)

watch(
  () => allocateForm.product_id,
  (v) => {
    if (!v) {
      pinnedProduct.value = null
      return
    }
    const id = Number(v)
    const found = productOptions.value.find((p) => p.id === id)
    if (found) pinnedProduct.value = found
  },
)

function entitlementHolderLabel(row: LicenseEntitlementItem): string {
  const h = row.holder_organization
  const name = (h?.display_name || h?.legal_name || '').trim()
  if (name) return name
  if (row.holder_display_name) return row.holder_display_name
  if (row.holder_organization_id != null) return `Organization #${row.holder_organization_id}`
  return '—'
}

function entitlementProductLabel(row: LicenseEntitlementItem): string {
  const p = row.product
  if (p?.name) {
    const base = p.name.trim()
    return p.sku ? `${base} · ${p.sku}` : base
  }
  if (row.product_name) return row.product_name
  if (row.product_id != null) return `Product #${row.product_id}`
  return '—'
}

function remainingUnits(row: LicenseEntitlementItem): number {
  const r = row.units_remaining
  if (typeof r === 'number' && Number.isFinite(r)) return r
  const a = row.units_available
  if (typeof a === 'number' && Number.isFinite(a)) return a
  return 0
}

onMounted(async () => {
  void fetchHolderOptions()
  void fetchProductOptions()
  try {
    await prmStore.fetchLicenseEntitlements(1, 15)
  } catch {
    toast.error(prmStore.message || 'Failed to load entitlements.')
  }
})

async function allocate() {
  const holder = Number(allocateForm.holder_organization_id)
  const product = Number(allocateForm.product_id)
  const units = Number(allocateForm.units_total)
  if (!Number.isFinite(holder) || holder <= 0 || !Number.isFinite(product) || product <= 0 || !Number.isFinite(units) || units <= 0) {
    toast.error('Choose a holder organization, product, and a positive units total.')
    return
  }
  allocating.value = true
  try {
    await prmStore.allocateLicenses({
      holder_organization_id: holder,
      product_id: product,
      units_total: units,
      parent_entitlement_id: null,
      notes: allocateForm.notes.trim() || undefined,
    })
    toast.success(prmStore.message || 'Allocated.')
    allocateForm.holder_organization_id = ''
    allocateForm.product_id = ''
    allocateForm.units_total = ''
    allocateForm.notes = ''
    pinnedHolder.value = null
    pinnedProduct.value = null
  } catch {
    toast.error(prmStore.message || 'Allocation failed.')
  } finally {
    allocating.value = false
  }
}

function openConsume(row: LicenseEntitlementItem) {
  consumeTargetId.value = row.id
  consumeTargetRow.value = row
  consumeUnits.value = '1'
}

function closeConsume() {
  consumeTargetId.value = null
  consumeTargetRow.value = null
}

async function submitConsume() {
  if (consumeTargetId.value == null) return
  const u = Number(consumeUnits.value)
  if (!Number.isFinite(u) || u <= 0) {
    toast.error('Enter a positive number of units.')
    return
  }
  consuming.value = true
  try {
    await prmStore.consumeLicenseUnits(consumeTargetId.value, u)
    toast.success(prmStore.message || 'Units consumed.')
    closeConsume()
  } catch {
    toast.error(prmStore.message || 'Consume failed.')
  } finally {
    consuming.value = false
  }
}

const consumeModalSubtitle = computed(() => {
  const row = consumeTargetRow.value
  if (!row) return ''
  const h = entitlementHolderLabel(row)
  const p = entitlementProductLabel(row)
  return `${h} · ${p}`
})
</script>

<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-xl font-bold text-slate-900">License entitlements</h2>
      <p class="text-sm text-slate-500">Allocation (vendor) and consumption (holder) with full audit trail on the server.</p>
    </header>

    <article v-if="canAllocate" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-6">
      <h3 class="text-sm font-semibold text-slate-900">Allocate units</h3>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <label for="license-holder-search" class="block text-xs font-medium uppercase tracking-wide text-slate-600">Holder organization</label>
          <input
            id="license-holder-search"
            v-model.trim="holderSearch"
            type="search"
            autocomplete="off"
            class="rc-input"
            placeholder="Search partners and resellers…"
          />
          <select id="license-holder-select" v-model="allocateForm.holder_organization_id" class="rc-input w-full" aria-label="Selected holder organization">
            <option value="" disabled>Select holder…</option>
            <option v-for="o in mergedHolderOptions" :key="o.id" :value="String(o.id)">
              {{ orgLabel(o) }} ({{ o.type }})
            </option>
          </select>
          <p v-if="holdersLoading" class="text-xs text-slate-400">Updating list…</p>
        </div>
        <div class="space-y-2">
          <label for="license-product-search" class="block text-xs font-medium uppercase tracking-wide text-slate-600">Product</label>
          <input
            id="license-product-search"
            v-model.trim="productSearch"
            type="search"
            autocomplete="off"
            class="rc-input"
            placeholder="Search active products…"
          />
          <select id="license-product-select" v-model="allocateForm.product_id" class="rc-input w-full" aria-label="Selected product">
            <option value="" disabled>Select product…</option>
            <option v-for="p in mergedProductOptions" :key="p.id" :value="String(p.id)">
              {{ productLabel(p) }}
            </option>
          </select>
          <p v-if="productsLoading" class="text-xs text-slate-400">Updating list…</p>
        </div>
        <div class="space-y-2">
          <label for="license-units-total" class="block text-xs font-medium uppercase tracking-wide text-slate-600">Units total</label>
          <input id="license-units-total" v-model="allocateForm.units_total" type="number" min="1" step="1" class="rc-input" placeholder="Units" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label for="license-notes" class="block text-xs font-medium uppercase tracking-wide text-slate-600">Notes</label>
          <input id="license-notes" v-model.trim="allocateForm.notes" class="rc-input w-full" placeholder="Optional notes" />
        </div>
      </div>
      <button type="button" class="btn-primary mt-4 rounded-lg px-4 py-2 text-sm font-semibold" :disabled="allocating" @click="allocate">
        {{ allocating ? 'Saving…' : 'Allocate' }}
      </button>
    </article>

    <div class="overflow-x-auto rounded-xl border border-[var(--rc-border-soft)] bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-3 text-left">Holder organization</th>
            <th class="px-4 py-3 text-left">Product</th>
            <th class="px-4 py-3 text-left">Total</th>
            <th class="px-4 py-3 text-left">Remaining</th>
            <th class="px-4 py-3 text-right">Consume</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="prmStore.entitlementsLoading">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">Loading…</td>
          </tr>
          <tr v-else-if="!prmStore.entitlements.length">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">No entitlements.</td>
          </tr>
          <tr v-for="row in prmStore.entitlements" v-else :key="row.id" class="border-t border-[var(--rc-border-soft)]">
            <td class="px-4 py-3 text-slate-900">{{ entitlementHolderLabel(row) }}</td>
            <td class="px-4 py-3 text-slate-900">{{ entitlementProductLabel(row) }}</td>
            <td class="px-4 py-3 tabular-nums">{{ row.units_total ?? '—' }}</td>
            <td class="px-4 py-3 tabular-nums">{{ remainingUnits(row) }}</td>
            <td class="px-4 py-3 text-right">
              <button
                type="button"
                class="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                :disabled="remainingUnits(row) <= 0"
                @click="openConsume(row)"
              >
                Consume
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationControls
      :current-page="prmStore.entitlementsPagination.current_page"
      :last-page="prmStore.entitlementsPagination.last_page"
      @change="(p) => prmStore.fetchLicenseEntitlements(p, prmStore.entitlementsPagination.per_page)"
    />

    <div v-if="consumeTargetId != null" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div class="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 class="text-sm font-semibold text-slate-900">Consume units</h3>
        <p class="mt-1 text-xs leading-relaxed text-slate-500">{{ consumeModalSubtitle }}</p>
        <p class="mt-0.5 text-xs text-slate-400">Entitlement #{{ consumeTargetId }}</p>
        <label for="license-consume-units" class="mt-3 block text-xs font-medium text-slate-600">Units to consume</label>
        <input id="license-consume-units" v-model="consumeUnits" type="number" min="1" class="rc-input mt-1" />
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded border px-3 py-2 text-sm" @click="closeConsume">Cancel</button>
          <button type="button" class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" :disabled="consuming" @click="submitConsume">
            {{ consuming ? 'Saving…' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
