<script setup lang="ts">
import { computed } from 'vue'
import type { OrganizationItem, OrganizationOnboardingStatus, OrganizationStatus, OrganizationType } from '@/modules/organizations/types/organization.types'

type FormModel = {
  type: OrganizationType
  parent_organization_id: string
  legal_name: string
  display_name: string
  registration_number: string
  tax_number: string
  email: string
  phone: string
  website: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  country: string
  postal_code: string
  onboarding_status: OrganizationOnboardingStatus
  status: OrganizationStatus
  credit_limit: string
  metadata_tier: string
}

const model = defineModel<FormModel>({ required: true })

const props = defineProps<{
  /** Legacy fallback; prefer parentPickerItems from GET /organizations/parent-options. */
  parentOptions?: OrganizationItem[]
  /** Rows from GET /organizations/parent-options?child_type=<current type>. */
  parentPickerItems?: OrganizationItem[]
  parentsLoading?: boolean
  /** When true (e.g. global admin before tenant is chosen), parent list is not loaded yet. */
  parentPickerWaitingForTenant?: boolean
  /**
   * Create flow: set false when the API assigns the parent implicitly (omit parent_organization_id).
   * Edit flow: omit prop (default) to keep parent visible for partner/reseller when applicable.
   */
  showParentOrganization?: boolean
  /** Shown when parent field is hidden but the backend resolves parent automatically. */
  implicitParentNote?: string
  disabled?: boolean
  allowTypeChange?: boolean
  mode?: 'create' | 'edit'
  canCreatePartner?: boolean
  canCreateReseller?: boolean
}>()

const showParentField = computed(() => {
  if (props.showParentOrganization === false) return false
  if (model.value.type === 'company') return false
  return model.value.type === 'partner' || model.value.type === 'reseller'
})

const eligibleParents = computed(() => {
  if (model.value.type === 'company') return []
  const fromApi = props.parentPickerItems ?? []
  if (fromApi.length) return fromApi
  if (model.value.type === 'partner') {
    return (props.parentOptions ?? []).filter((item) => item.type === 'company')
  }
  if (model.value.type === 'reseller') {
    return (props.parentOptions ?? []).filter((item) => item.type === 'partner')
  }
  return []
})

const emptyParentHint = computed(() => {
  if (model.value.type === 'partner') {
    return 'Create a tenant company record first (not the CRM Companies module).'
  }
  if (model.value.type === 'reseller') {
    return 'Create a partner record first, or confirm your account can see partners in this tenant.'
  }
  return ''
})

const parentSelectPlaceholder = computed(() => {
  if (props.parentPickerWaitingForTenant) return 'Select tenant ID first (global admin)'
  if (props.parentsLoading) return 'Loading parents…'
  return 'Select parent'
})
</script>

<template>
  <div class="grid gap-3 md:grid-cols-2">
    <div class="md:col-span-2">
      <template v-if="!allowTypeChange">
        <p class="text-sm text-slate-700">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</span>
          <span class="ml-2 font-medium capitalize">{{ model.type }}</span>
        </p>
      </template>
      <template v-else>
        <label for="org-form-type" class="mb-1 block text-xs font-semibold text-slate-600">Type</label>
        <select id="org-form-type" v-model="model.type" class="rc-input" :disabled="disabled">
          <option v-if="canCreatePartner" value="partner">partner</option>
          <option v-if="canCreateReseller" value="reseller">reseller</option>
          <option v-if="!canCreatePartner && !canCreateReseller" value="reseller">reseller</option>
        </select>
      </template>
    </div>
    <p v-if="implicitParentNote" class="text-xs text-slate-600 md:col-span-2">{{ implicitParentNote }}</p>
    <div v-if="showParentField" class="md:col-span-2">
      <label for="org-form-parent" class="mb-1 block text-xs font-semibold text-slate-600">Parent company or partner</label>
      <select
        id="org-form-parent"
        v-model="model.parent_organization_id"
        class="rc-input"
        :disabled="disabled || parentsLoading || parentPickerWaitingForTenant"
      >
        <option value="">{{ parentSelectPlaceholder }}</option>
        <option v-for="parent in eligibleParents" :key="parent.id" :value="String(parent.id)">
          {{ parent.display_name || parent.legal_name }} ({{ parent.type }})
        </option>
      </select>
      <template v-if="showParentField">
        <p v-if="parentPickerWaitingForTenant" class="mt-1 text-xs text-slate-600">
          Enter the target tenant ID so valid parents can be loaded.
        </p>
        <p v-else-if="!parentsLoading && !eligibleParents.length" class="mt-1 text-xs text-amber-800">
          {{ emptyParentHint }}
        </p>
        <p v-else-if="!parentsLoading" class="mt-1 text-xs text-slate-500">
          Choose the partner this reseller belongs to. Company and global admins must pick a parent when multiple partners exist.
        </p>
      </template>
    </div>
    <input v-model.trim="model.legal_name" class="rc-input" :disabled="disabled" placeholder="Legal name" />
    <input v-model.trim="model.display_name" class="rc-input" :disabled="disabled" placeholder="Display name" />
    <input v-model.trim="model.registration_number" class="rc-input" :disabled="disabled" placeholder="Registration number" />
    <input v-model.trim="model.tax_number" class="rc-input" :disabled="disabled" placeholder="Tax number" />
    <input v-model.trim="model.email" class="rc-input" :disabled="disabled" placeholder="Email" />
    <input v-model.trim="model.phone" class="rc-input" :disabled="disabled" placeholder="Phone" />
    <input v-model.trim="model.website" class="rc-input md:col-span-2" :disabled="disabled" placeholder="Website" />
    <input v-model.trim="model.address_line_1" class="rc-input md:col-span-2" :disabled="disabled" placeholder="Address line 1" />
    <input v-model.trim="model.address_line_2" class="rc-input md:col-span-2" :disabled="disabled" placeholder="Address line 2" />
    <input v-model.trim="model.city" class="rc-input" :disabled="disabled" placeholder="City" />
    <input v-model.trim="model.state" class="rc-input" :disabled="disabled" placeholder="State" />
    <input v-model.trim="model.country" class="rc-input" :disabled="disabled" placeholder="Country" />
    <input v-model.trim="model.postal_code" class="rc-input" :disabled="disabled" placeholder="Postal code" />
    <select v-model="model.onboarding_status" class="rc-input" :disabled="disabled">
      <option value="draft">draft</option>
      <option value="pending_review">pending_review</option>
      <option value="approved">approved</option>
      <option value="active">active</option>
      <option value="suspended">suspended</option>
      <option value="rejected">rejected</option>
    </select>
    <select v-model="model.status" class="rc-input" :disabled="disabled">
      <option value="active">active</option>
      <option value="inactive">inactive</option>
    </select>
    <input v-model.trim="model.credit_limit" type="number" class="rc-input" :disabled="disabled" placeholder="Credit limit" />
    <input v-model.trim="model.metadata_tier" class="rc-input" :disabled="disabled" placeholder="Metadata tier (e.g. gold)" />
  </div>
</template>
