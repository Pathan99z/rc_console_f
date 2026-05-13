<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/shared/utils/useToast'
import { toApiError } from '@/core/http/apiClient'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import OrganizationForm from '@/modules/organizations/components/OrganizationForm.vue'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import { useOrganizationStore } from '@/modules/organizations/store/organization.store'
import type { OrganizationItem, OrganizationPayload, OrganizationType } from '@/modules/organizations/types/organization.types'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const organizationStore = useOrganizationStore()

const parentPickerItems = ref<OrganizationItem[]>([])
const parentsLoading = ref(false)
/** Global admin: tenant for create (and for reseller parent-options). */
const targetTenantId = ref('')

const canCreatePartner = ['global_admin', 'company_admin'].includes(authStore.user?.role || '')
const canCreateReseller = ['global_admin', 'company_admin', 'partner_admin'].includes(authStore.user?.role || '')

const initialChildType: OrganizationType = !canCreatePartner && canCreateReseller ? 'reseller' : 'partner'

const form = reactive({
  type: initialChildType,
  parent_organization_id: '',
  legal_name: '',
  display_name: '',
  registration_number: '',
  tax_number: '',
  email: '',
  phone: '',
  website: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  onboarding_status: 'pending_review' as 'draft' | 'pending_review' | 'approved' | 'active' | 'suspended' | 'rejected',
  status: 'active' as 'active' | 'inactive',
  credit_limit: '',
  metadata_tier: '',
})

const isGlobalAdmin = computed(() => authStore.user?.role === 'global_admin')
const isCompanyAdmin = computed(() => authStore.user?.role === 'company_admin')
const isPartnerAdmin = computed(() => authStore.user?.role === 'partner_admin')

/** When false, parent UI is hidden and parent_organization_id is omitted on create (backend implicit parent). */
const showParentOrganization = computed(() => {
  if (form.type === 'partner' && (isGlobalAdmin.value || isCompanyAdmin.value)) return false
  if (form.type === 'reseller' && isPartnerAdmin.value) return false
  return form.type === 'reseller'
})

const implicitParentNote = computed(() => {
  if (form.type === 'partner' && (isGlobalAdmin.value || isCompanyAdmin.value)) {
    return "Parent company is assigned automatically (your user's company record when set, otherwise this tenant's root company)."
  }
  if (form.type === 'reseller' && isPartnerAdmin.value) {
    return 'Parent partner is assigned automatically from your signed-in account.'
  }
  return ''
})

const parentPickerWaitingForTenant = computed(
  () =>
    showParentOrganization.value &&
    isGlobalAdmin.value &&
    (!targetTenantId.value || Number(targetTenantId.value) <= 0),
)

function shouldFetchParentOptions() {
  if (form.type === 'partner') return false
  if (form.type !== 'reseller') return false
  if (!(isGlobalAdmin.value || isCompanyAdmin.value)) return false
  if (isGlobalAdmin.value && (!targetTenantId.value || Number(targetTenantId.value) <= 0)) return false
  return true
}

async function loadParentOptions() {
  if (!shouldFetchParentOptions()) {
    parentPickerItems.value = []
    parentsLoading.value = false
    return
  }

  parentsLoading.value = true
  parentPickerItems.value = []
  try {
    const params: { child_type: OrganizationType; tenant_id?: number } = {
      child_type: 'reseller',
    }
    if (isGlobalAdmin.value) {
      params.tenant_id = Number(targetTenantId.value)
    }
    const { data } = await organizationsApi.parentOptions(params)
    parentPickerItems.value = data.data.items
  } catch (error) {
    parentPickerItems.value = []
    const normalized = toApiError(error)
    toast.error(normalized.message || 'Could not load parent options. Check role, tenant, or type.')
  } finally {
    parentsLoading.value = false
  }
}

watch(
  () => [form.type, targetTenantId.value] as const,
  async () => {
    form.parent_organization_id = ''
    await loadParentOptions()
  },
  { immediate: true },
)

onMounted(async () => {
  if (!organizationStore.items.length) {
    await organizationStore.fetchOrganizations(1, 100)
  }
})

function requiresExplicitParentOnCreate() {
  return form.type === 'reseller' && (isGlobalAdmin.value || isCompanyAdmin.value)
}

async function submit() {
  if (isGlobalAdmin.value) {
    const tid = Number(targetTenantId.value)
    if (!Number.isFinite(tid) || tid <= 0) {
      toast.error('Enter a valid tenant ID for this record.')
      return
    }
  }

  if (requiresExplicitParentOnCreate()) {
    const parentId = Number(form.parent_organization_id)
    if (!Number.isFinite(parentId) || parentId <= 0) {
      toast.error('Select the partner this reseller belongs to.')
      return
    }
  }

  const payload: OrganizationPayload = {
    type: form.type,
    legal_name: form.legal_name.trim(),
    display_name: form.display_name.trim(),
    registration_number: form.registration_number || undefined,
    tax_number: form.tax_number || undefined,
    email: form.email || undefined,
    phone: form.phone || undefined,
    website: form.website || undefined,
    address_line_1: form.address_line_1 || undefined,
    address_line_2: form.address_line_2 || undefined,
    city: form.city || undefined,
    state: form.state || undefined,
    country: form.country || undefined,
    postal_code: form.postal_code || undefined,
    onboarding_status: form.onboarding_status,
    status: form.status,
    credit_limit: Number(form.credit_limit) || undefined,
    metadata: form.metadata_tier ? { tier: form.metadata_tier.trim() } : undefined,
  }

  if (isGlobalAdmin.value) {
    payload.tenant_id = Number(targetTenantId.value)
  }

  if (requiresExplicitParentOnCreate()) {
    payload.parent_organization_id = Number(form.parent_organization_id)
  }

  try {
    await organizationStore.createOrganization(payload)
    toast.success('Partner or reseller created successfully.')
    await router.push('/app/organizations')
  } catch {
    toast.error(organizationStore.message || 'Failed to create partner or reseller.')
  }
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Add partner or reseller</h2>
      <p class="text-sm text-slate-500">
        Create partner or reseller records. Parent assignment follows server rules when the parent field is hidden.
      </p>
    </header>

    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <div v-if="isGlobalAdmin" class="mb-4">
        <label for="org-create-tenant" class="mb-1 block text-xs font-semibold text-slate-600">Tenant ID</label>
        <input
          id="org-create-tenant"
          v-model.trim="targetTenantId"
          type="number"
          min="1"
          class="rc-input max-w-md"
          placeholder="Required for global admin (create and reseller parent list)"
        />
        <p class="mt-1 text-xs text-slate-500">
          Required for every create in this tenant. Used when loading reseller parent choices and for the create request.
        </p>
      </div>

      <OrganizationForm
        v-model="form"
        :show-parent-organization="showParentOrganization"
        :implicit-parent-note="implicitParentNote"
        :parent-picker-items="parentPickerItems"
        :parents-loading="parentsLoading"
        :parent-picker-waiting-for-tenant="parentPickerWaitingForTenant"
        :disabled="organizationStore.submitting"
        :allow-type-change="true"
        mode="create"
        :can-create-partner="canCreatePartner"
        :can-create-reseller="canCreateReseller"
      />
      <p v-if="organizationStore.errors.parent_organization_id?.[0]" class="mt-2 text-sm text-red-600">
        {{ organizationStore.errors.parent_organization_id[0] }}
      </p>
      <p v-if="organizationStore.errors.legal_name?.[0]" class="mt-2 text-sm text-red-600">
        {{ organizationStore.errors.legal_name[0] }}
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <button class="rounded border px-3 py-2 text-sm" @click="router.push('/app/organizations')">Cancel</button>
        <button class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" :disabled="organizationStore.submitting" @click="submit">
          {{ organizationStore.submitting ? 'Saving...' : 'Save partner or reseller' }}
        </button>
      </div>
    </div>
  </section>
</template>
