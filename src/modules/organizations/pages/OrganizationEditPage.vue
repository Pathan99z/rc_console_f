<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/shared/utils/useToast'
import { toApiError } from '@/core/http/apiClient'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import OrganizationForm from '@/modules/organizations/components/OrganizationForm.vue'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import { useOrganizationStore } from '@/modules/organizations/store/organization.store'
import type { OrganizationItem, OrganizationType } from '@/modules/organizations/types/organization.types'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const organizationStore = useOrganizationStore()

const parentPickerItems = ref<OrganizationItem[]>([])
const parentsLoading = ref(false)
const tenantIdForParentApi = ref<number | null>(null)

const form = reactive({
  type: 'partner' as OrganizationType,
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
  onboarding_status: 'draft' as 'draft' | 'pending_review' | 'approved' | 'active' | 'suspended' | 'rejected',
  status: 'active' as 'active' | 'inactive',
  credit_limit: '',
  metadata_tier: '',
})

const organizationId = Number(route.params.id)

const isGlobalAdmin = () => authStore.user?.role === 'global_admin'

async function loadParentOptions() {
  if (form.type === 'company') {
    parentPickerItems.value = []
    return
  }

  parentsLoading.value = true
  parentPickerItems.value = []
  try {
    const params: { child_type: OrganizationType; tenant_id?: number } = {
      child_type: form.type,
    }
    if (isGlobalAdmin() && tenantIdForParentApi.value != null && tenantIdForParentApi.value > 0) {
      params.tenant_id = tenantIdForParentApi.value
    }
    const { data } = await organizationsApi.parentOptions(params)
    parentPickerItems.value = data.data.items
  } catch (error) {
    parentPickerItems.value = []
    const normalized = toApiError(error)
    toast.error(normalized.message || 'Could not load parent options.')
  } finally {
    parentsLoading.value = false
  }
}

onMounted(async () => {
  try {
    if (!organizationStore.items.length) await organizationStore.fetchOrganizations(1, 100)
    const item = await organizationStore.fetchOrganization(organizationId)
    tenantIdForParentApi.value = item.tenant_id ?? null
    form.type = item.type
    form.parent_organization_id = item.parent_organization_id ? String(item.parent_organization_id) : ''
    form.legal_name = item.legal_name || ''
    form.display_name = item.display_name || ''
    form.registration_number = item.registration_number || ''
    form.tax_number = item.tax_number || ''
    form.email = item.email || ''
    form.phone = item.phone || ''
    form.website = item.website || ''
    form.address_line_1 = item.address_line_1 || ''
    form.address_line_2 = item.address_line_2 || ''
    form.city = item.city || ''
    form.state = item.state || ''
    form.country = item.country || ''
    form.postal_code = item.postal_code || ''
    form.onboarding_status = item.onboarding_status
    form.status = item.status
    form.credit_limit = item.credit_limit ? String(item.credit_limit) : ''
    form.metadata_tier = String(item.metadata?.tier || '')

    await loadParentOptions()

    const selectedId = Number(form.parent_organization_id)
    if (selectedId > 0 && !parentPickerItems.value.some((row) => row.id === selectedId)) {
      form.parent_organization_id = ''
    }
  } catch {
    toast.error(organizationStore.message || 'Failed to load this record.')
  }
})

async function submit() {
  const basePayload = {
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

  if (form.type === 'company') {
    try {
      await organizationStore.updateOrganization(organizationId, basePayload)
      toast.success('Changes saved successfully.')
      await router.push(`/app/organizations/${organizationId}`)
    } catch {
      toast.error(organizationStore.message || 'Failed to save changes.')
    }
    return
  }

  const parentId = Number(form.parent_organization_id)
  if (!Number.isFinite(parentId) || parentId <= 0) {
    toast.error('Select a parent partner.')
    return
  }

  try {
    await organizationStore.updateOrganization(organizationId, {
      ...basePayload,
      parent_organization_id: parentId,
    })
    toast.success('Changes saved successfully.')
    await router.push(`/app/organizations/${organizationId}`)
  } catch {
    toast.error(organizationStore.message || 'Failed to save changes.')
  }
}
</script>

<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-slate-900">Edit network record</h2>
      <p class="text-sm text-slate-500">Update company, partner, or reseller profile and settings.</p>
    </header>
    <div class="rounded-xl border border-[var(--rc-border-soft)] bg-white p-4">
      <OrganizationForm
        v-model="form"
        :parent-picker-items="parentPickerItems"
        :parents-loading="parentsLoading"
        :parent-picker-waiting-for-tenant="false"
        :disabled="organizationStore.submitting || organizationStore.detailLoading"
        :allow-type-change="false"
        mode="edit"
        :can-create-partner="true"
        :can-create-reseller="true"
      />
      <div class="mt-4 flex justify-end gap-2">
        <button class="rounded border px-3 py-2 text-sm" @click="router.push(`/app/organizations/${organizationId}`)">Cancel</button>
        <button class="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" :disabled="organizationStore.submitting" @click="submit">
          {{ organizationStore.submitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </section>
</template>
