<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'
import { productsApi } from '@/modules/products/services/product.api'
import type { ProductItem } from '@/modules/products/types/product.types'
import SearchableMultiSelect from '@/modules/demo-links/components/SearchableMultiSelect.vue'
import type { MultiSelectOption } from '@/modules/demo-links/components/SearchableMultiSelect.vue'
import { useDemoLinkAccess } from '@/modules/demo-links/composables/useDemoLinkAccess'
import { useDemoLinkStore } from '@/modules/demo-links/store/demoLink.store'
import type {
  DemoLinkItem,
  DemoLinkPayload,
  DemoLinkUpdatePayload,
  DemoLinkVisibilityPayload,
} from '@/modules/demo-links/types/demoLink.types'
import { orgDisplayName } from '@/modules/demo-links/utils/demoLinkFormat'

const props = defineProps<{
  mode: 'create' | 'edit'
  initial?: DemoLinkItem | null
  fieldErrors?: Record<string, string[]>
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: DemoLinkPayload | DemoLinkUpdatePayload): void
  (e: 'cancel'): void
}>()

const store = useDemoLinkStore()
const authStore = useAuthStore()
const { canShareDemoLinks, canManageAllDemoLinks } = useDemoLinkAccess()

const ownerOrgs = ref<OrganizationItem[]>([])
/** Resolved owner when UI picker is hidden (e.g. company admin → tenant company org). */
const implicitOwnerOrgId = ref<number | null>(null)
const products = ref<ProductItem[]>([])
const productsLoading = ref(true)
const shareOrgsLoading = ref(false)
const screenshotPreview = ref<string | null>(null)
const removeScreenshot = ref(false)
const screenshotDragging = ref(false)
const screenshotInputRef = ref<HTMLInputElement | null>(null)
const ownerResolveError = ref('')

const form = reactive({
  owner_organization_id: '',
  title: '',
  demo_url: '',
  demo_username: '',
  demo_password: '',
  description: '',
  product_ids: [] as number[],
  is_active: true,
  check_live_status: true,
  screenshot: null as File | null,
})

const selectedShareOrgIds = ref<number[]>([])
const includeChildrenByOrg = ref<Record<number, boolean>>({})

/** Only when multiple company orgs exist and user must choose explicitly. */
const showOwnerPicker = computed(() => props.mode === 'create' && ownerOrgs.value.length > 1)
const showSharing = computed(() => canShareDemoLinks.value)

const productOptions = computed((): MultiSelectOption[] =>
  products.value.map((p) => ({ id: p.id, label: p.name })),
)

const shareOrgOptions = computed((): MultiSelectOption[] =>
  store.shareableOrganizations.map((org) => ({
    id: org.id,
    label: orgDisplayName(org),
    meta: org.type || undefined,
  })),
)

const selectedShareOrgs = computed(() =>
  store.shareableOrganizations.filter((org) => selectedShareOrgIds.value.includes(org.id)),
)

function fieldErr(key: string) {
  return props.fieldErrors?.[key]?.[0]
}

function resetFromInitial(link?: DemoLinkItem | null) {
  if (!link) {
    form.owner_organization_id = ''
    form.title = ''
    form.demo_url = ''
    form.demo_username = ''
    form.demo_password = ''
    form.description = ''
    form.product_ids = []
    form.is_active = true
    form.check_live_status = true
    form.screenshot = null
    screenshotPreview.value = null
    removeScreenshot.value = false
    selectedShareOrgIds.value = []
    includeChildrenByOrg.value = {}
    return
  }
  form.owner_organization_id = link.owner_organization_id ? String(link.owner_organization_id) : ''
  form.title = link.title
  form.demo_url = link.demo_url
  form.demo_username = link.demo_username || ''
  form.demo_password = ''
  form.description = link.description || ''
  form.product_ids = link.products?.map((p) => p.id) || link.product_ids || []
  form.is_active = link.is_active !== false
  form.check_live_status = link.check_live_status !== false
  form.screenshot = null
  screenshotPreview.value = link.screenshot_url || link.screenshot_path || null
  removeScreenshot.value = false
  const visibility = link.visibility || []
  selectedShareOrgIds.value = visibility.map((v) => v.organization_id)
  const childMap: Record<number, boolean> = {}
  for (const v of visibility) {
    childMap[v.organization_id] = Boolean(v.include_child_organizations)
  }
  includeChildrenByOrg.value = childMap
}

watch(
  () => props.initial,
  (link) => resetFromInitial(link),
  { immediate: true },
)

watch(
  () => form.owner_organization_id,
  (v) => {
    if (v) implicitOwnerOrgId.value = Number(v)
  },
)

watch(selectedShareOrgIds, (ids) => {
  for (const id of ids) {
    if (includeChildrenByOrg.value[id] === undefined) {
      includeChildrenByOrg.value[id] = false
    }
  }
  for (const key of Object.keys(includeChildrenByOrg.value)) {
    const num = Number(key)
    if (!ids.includes(num)) delete includeChildrenByOrg.value[num]
  }
})

onMounted(async () => {
  await loadProducts()
  if (props.mode === 'create') await loadOwnerContext()
  if (showSharing.value) await loadShareableOrgs()
})

/** Resolve owner org for create: user org, else tenant company org (required by API). */
async function loadOwnerContext() {
  implicitOwnerOrgId.value = null
  ownerOrgs.value = []

  const userOrgId = authStore.user?.organization_id
  if (userOrgId) {
    implicitOwnerOrgId.value = userOrgId
    return
  }

  try {
    const { data } = await organizationsApi.list({ page: 1, per_page: 100, type: 'company', status: 'active' })
    const companies = data.data.items

    if (companies.length === 1) {
      implicitOwnerOrgId.value = companies[0].id
      return
    }

    if (companies.length > 1) {
      ownerOrgs.value = [...companies].sort((a, b) => orgDisplayName(a).localeCompare(orgDisplayName(b)))
      implicitOwnerOrgId.value = companies[0].id
      form.owner_organization_id = String(companies[0].id)
      return
    }

    if (canManageAllDemoLinks.value) {
      await loadOwnerOrgsForPicker()
      if (ownerOrgs.value.length === 1) {
        implicitOwnerOrgId.value = ownerOrgs.value[0].id
      }
    }
  } catch {
    implicitOwnerOrgId.value = null
  }
}

async function loadOwnerOrgsForPicker() {
  try {
    const [partnerRes, resellerRes, companyRes] = await Promise.all([
      organizationsApi.list({ page: 1, per_page: 100, type: 'partner', status: 'active' }),
      organizationsApi.list({ page: 1, per_page: 100, type: 'reseller', status: 'active' }),
      organizationsApi.list({ page: 1, per_page: 100, type: 'company', status: 'active' }),
    ])
    const map = new Map<number, OrganizationItem>()
    for (const o of companyRes.data.data.items) map.set(o.id, o)
    for (const o of partnerRes.data.data.items) map.set(o.id, o)
    for (const o of resellerRes.data.data.items) map.set(o.id, o)
    ownerOrgs.value = [...map.values()].sort((a, b) =>
      orgDisplayName(a).localeCompare(orgDisplayName(b)),
    )
    if (ownerOrgs.value.length === 1) {
      implicitOwnerOrgId.value = ownerOrgs.value[0].id
    }
  } catch {
    ownerOrgs.value = []
  }
}

async function loadProducts() {
  productsLoading.value = true
  try {
    const { data } = await productsApi.list({ page: 1, per_page: 100, status: 1 })
    products.value = data.data.items
  } catch {
    products.value = []
  } finally {
    productsLoading.value = false
  }
}

async function loadShareableOrgs() {
  shareOrgsLoading.value = true
  try {
    await store.fetchShareableOrganizations()
  } catch {
    /* optional */
  } finally {
    shareOrgsLoading.value = false
  }
}

function resolveOwnerOrganizationId(): number | undefined {
  if (showOwnerPicker.value && form.owner_organization_id) {
    return Number(form.owner_organization_id)
  }
  if (implicitOwnerOrgId.value) return implicitOwnerOrgId.value
  const fromUser = authStore.user?.organization_id
  if (fromUser) return fromUser
  if (props.initial?.owner_organization_id) return props.initial.owner_organization_id
  const companies = ownerOrgs.value.filter((o) => o.type === 'company')
  if (companies.length === 1) return companies[0].id
  if (ownerOrgs.value.length === 1) return ownerOrgs.value[0].id
  return undefined
}

function onScreenshotSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) applyScreenshot(file)
  if (screenshotInputRef.value) screenshotInputRef.value.value = ''
}

function onScreenshotDrop(event: DragEvent) {
  event.preventDefault()
  screenshotDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file?.type.startsWith('image/')) applyScreenshot(file)
}

function applyScreenshot(file: File) {
  form.screenshot = file
  removeScreenshot.value = false
  screenshotPreview.value = URL.createObjectURL(file)
}

function clearScreenshot() {
  form.screenshot = null
  screenshotPreview.value = null
  removeScreenshot.value = true
  if (screenshotInputRef.value) screenshotInputRef.value.value = ''
}

function triggerScreenshotPick() {
  screenshotInputRef.value?.click()
}

function buildVisibility(): DemoLinkVisibilityPayload[] {
  return selectedShareOrgIds.value.map((organization_id) => ({
    organization_id,
    include_child_organizations: Boolean(includeChildrenByOrg.value[organization_id]),
  }))
}

function submit() {
  ownerResolveError.value = ''
  const visibility = showSharing.value ? buildVisibility() : undefined
  const ownerId = resolveOwnerOrganizationId()

  if (props.mode === 'create') {
    if (ownerId == null) {
      ownerResolveError.value =
        'Could not determine owner organization. Refresh the page or sign in again.'
      return
    }
    const payload: DemoLinkPayload = {
      owner_organization_id: ownerId,
      title: form.title.trim(),
      demo_url: form.demo_url.trim(),
      demo_username: form.demo_username.trim() || undefined,
      description: form.description.trim() || undefined,
      product_ids: form.product_ids,
      is_active: form.is_active,
      check_live_status: form.check_live_status,
      visibility,
      screenshot: form.screenshot,
    }
    if (form.demo_password.trim()) payload.demo_password = form.demo_password
    emit('submit', payload)
    return
  }

  const payload: DemoLinkUpdatePayload = {
    title: form.title.trim(),
    demo_url: form.demo_url.trim(),
    demo_username: form.demo_username.trim() || undefined,
    description: form.description.trim() || undefined,
    product_ids: form.product_ids,
    is_active: form.is_active,
    check_live_status: form.check_live_status,
    visibility,
    screenshot: form.screenshot,
    remove_screenshot: removeScreenshot.value,
  }
  if (showOwnerPicker.value && form.owner_organization_id) {
    payload.owner_organization_id = Number(form.owner_organization_id)
  }
  if (form.demo_password.trim()) payload.demo_password = form.demo_password
  emit('submit', payload)
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submit">
    <!-- Section 1: Demo Information -->
    <section class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 sm:p-5">
      <h3 class="text-sm font-semibold text-slate-900">Demo Information</h3>
      <p class="mt-0.5 text-xs text-slate-500">Basic details for this demo environment.</p>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <label v-if="showOwnerPicker" class="block text-sm sm:col-span-2">
          <span class="mb-1 block text-xs font-medium text-slate-600">Owner organization *</span>
          <select v-model="form.owner_organization_id" class="rc-input w-full" required>
            <option value="">Select organization</option>
            <option v-for="org in ownerOrgs" :key="org.id" :value="String(org.id)">
              {{ orgDisplayName(org) }} ({{ org.type }})
            </option>
          </select>
          <p v-if="fieldErr('owner_organization_id')" class="mt-1 text-xs text-rose-600">{{ fieldErr('owner_organization_id') }}</p>
        </label>

        <label class="block text-sm sm:col-span-2">
          <span class="mb-1 block text-xs font-medium text-slate-600">Demo link name *</span>
          <input v-model="form.title" class="rc-input w-full" required maxlength="255" placeholder="e.g. RC-ISMS Product Demo" />
          <p v-if="fieldErr('title')" class="mt-1 text-xs text-rose-600">{{ fieldErr('title') }}</p>
        </label>

        <label class="block text-sm sm:col-span-2">
          <span class="mb-1 block text-xs font-medium text-slate-600">Demo URL *</span>
          <input v-model="form.demo_url" type="url" class="rc-input w-full" required placeholder="https://demo.example.com" />
          <p v-if="fieldErr('demo_url')" class="mt-1 text-xs text-rose-600">{{ fieldErr('demo_url') }}</p>
        </label>

        <label class="block text-sm">
          <span class="mb-1 block text-xs font-medium text-slate-600">Demo username</span>
          <input v-model="form.demo_username" class="rc-input w-full" placeholder="Optional" />
        </label>

        <label class="block text-sm">
          <span class="mb-1 block text-xs font-medium text-slate-600">Demo password</span>
          <input
            v-model="form.demo_password"
            type="password"
            class="rc-input w-full"
            :placeholder="mode === 'edit' ? 'Leave blank to keep current' : 'Optional'"
            autocomplete="new-password"
          />
        </label>

        <label class="block text-sm sm:col-span-2">
          <span class="mb-1 block text-xs font-medium text-slate-600">Description</span>
          <textarea v-model="form.description" class="rc-input w-full" rows="2" placeholder="Optional notes for your team" />
        </label>
      </div>
    </section>

    <!-- Section 2: Linked Products -->
    <section class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 sm:p-5">
      <h3 class="text-sm font-semibold text-slate-900">Linked Products</h3>
      <p class="mt-0.5 text-xs text-slate-500">Associate products this demo showcases.</p>
      <div class="mt-3">
        <SearchableMultiSelect
          v-model="form.product_ids"
          :options="productOptions"
          :loading="productsLoading"
          placeholder="Select products…"
          search-placeholder="Search products…"
          empty-text="No products available"
        />
      </div>
    </section>

    <!-- Section 3: Sharing -->
    <section v-if="showSharing" class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 sm:p-5">
      <h3 class="text-sm font-semibold text-slate-900">Sharing Visibility</h3>
      <p class="mt-0.5 text-xs text-slate-500">Share with partners / resellers who can access this demo.</p>
      <div class="mt-3">
        <label class="mb-1 block text-xs font-medium text-slate-600">Organizations</label>
        <SearchableMultiSelect
          v-model="selectedShareOrgIds"
          :options="shareOrgOptions"
          :loading="shareOrgsLoading"
          placeholder="Select organizations…"
          search-placeholder="Search partners or resellers…"
          empty-text="No organizations available"
        />
      </div>
      <div v-if="selectedShareOrgs.length" class="mt-3 space-y-2 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
        <label
          v-for="org in selectedShareOrgs"
          :key="org.id"
          class="flex cursor-pointer items-center gap-2 text-xs text-slate-700"
        >
          <input v-model="includeChildrenByOrg[org.id]" type="checkbox" class="rounded border-slate-300 text-indigo-600" />
          <span>
            <span class="font-medium">{{ orgDisplayName(org) }}</span>
            — Include child organizations
          </span>
        </label>
      </div>
    </section>

    <!-- Section 4: Media & Settings -->
    <section class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4 sm:p-5">
      <h3 class="text-sm font-semibold text-slate-900">Media &amp; Settings</h3>

      <div class="mt-4">
        <span class="mb-2 block text-xs font-medium text-slate-600">Screenshot</span>
        <input
          ref="screenshotInputRef"
          type="file"
          class="hidden"
          accept="image/*"
          @change="onScreenshotSelected"
        />
        <div
          v-if="screenshotPreview"
          class="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
        >
          <img :src="screenshotPreview" alt="Screenshot preview" class="max-h-40 w-full object-cover" />
          <div class="flex gap-2 border-t border-slate-200 bg-white p-2">
            <button type="button" class="text-xs font-semibold text-indigo-600" @click="triggerScreenshotPick">
              Replace
            </button>
            <button type="button" class="text-xs font-semibold text-rose-600" @click="clearScreenshot">
              Remove
            </button>
          </div>
        </div>
        <label
          v-else
          class="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition"
          :class="screenshotDragging ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-300 bg-slate-50/50 hover:border-indigo-300'"
          @dragover.prevent="screenshotDragging = true"
          @dragleave="screenshotDragging = false"
          @drop="onScreenshotDrop"
          @click="triggerScreenshotPick"
        >
          <svg class="mb-2 h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-sm font-medium text-slate-700">Drop image or click to upload</p>
          <p class="mt-1 text-xs text-slate-500">PNG, JPG up to 10 MB</p>
        </label>
      </div>

      <div class="mt-5 flex flex-wrap gap-6 border-t border-slate-100 pt-4">
        <label class="flex cursor-pointer items-center gap-3">
          <button
            type="button"
            role="switch"
            :aria-checked="form.is_active"
            class="relative h-6 w-11 shrink-0 rounded-full transition"
            :class="form.is_active ? 'bg-indigo-600' : 'bg-slate-300'"
            @click="form.is_active = !form.is_active"
          >
            <span
              class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition"
              :class="form.is_active ? 'translate-x-5' : ''"
            />
          </button>
          <span class="text-sm text-slate-700">Active</span>
        </label>
        <label class="flex cursor-pointer items-center gap-3">
          <button
            type="button"
            role="switch"
            :aria-checked="form.check_live_status"
            class="relative h-6 w-11 shrink-0 rounded-full transition"
            :class="form.check_live_status ? 'bg-indigo-600' : 'bg-slate-300'"
            @click="form.check_live_status = !form.check_live_status"
          >
            <span
              class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition"
              :class="form.check_live_status ? 'translate-x-5' : ''"
            />
          </button>
          <span class="text-sm text-slate-700">Check live status</span>
        </label>
      </div>
    </section>

    <p v-if="ownerResolveError || fieldErr('owner_organization_id')" class="text-sm text-rose-600">
      {{ ownerResolveError || fieldErr('owner_organization_id') }}
    </p>

    <div class="flex justify-end gap-2 pt-1">
      <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="emit('cancel')">
        Cancel
      </button>
      <button
        type="submit"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        :disabled="saving"
      >
        {{ saving ? 'Saving…' : mode === 'create' ? 'Create Demo Link' : 'Update Demo Link' }}
      </button>
    </div>
  </form>
</template>
