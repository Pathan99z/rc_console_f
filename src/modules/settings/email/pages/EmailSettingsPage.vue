<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from '@/shared/utils/useToast'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import type { OrganizationItem } from '@/modules/organizations/types/organization.types'
import EmailSettingsForm from '@/modules/settings/email/components/EmailSettingsForm.vue'
import EmailSettingsStatusBadge from '@/modules/settings/email/components/EmailSettingsStatusBadge.vue'
import { useEmailSettingsAccess } from '@/modules/settings/email/composables/useEmailSettingsAccess'
import { useEmailSettingsStore } from '@/modules/settings/email/store/emailSettings.store'
import {
  deriveEmailConfigStatus,
  inheritanceBannerText,
  isValidOrgId,
} from '@/modules/settings/email/utils/emailSettingsFormat'
import type { EmailSettingsUpdatePayload } from '@/modules/settings/email/types/emailSettings.types'

const store = useEmailSettingsStore()
const toast = useToast()
const { canViewEmailSettings, canManageEmailSettings, canPickOrganization, defaultOrganizationId } =
  useEmailSettingsAccess()

const orgOptions = ref<OrganizationItem[]>([])
const pageReady = ref(false)

const configStatus = computed(() => deriveEmailConfigStatus(store.email))
const inheritanceMessage = computed(() => (store.email ? inheritanceBannerText(store.email) : null))
const activeOrgId = computed(() => {
  if (isValidOrgId(store.selectedOrganizationId)) return store.selectedOrganizationId
  if (isValidOrgId(defaultOrganizationId.value)) return defaultOrganizationId.value
  return null
})

const showOrgPicker = computed(() => canPickOrganization.value && orgOptions.value.length > 1)

const selectedOrgDisplayName = computed(() => {
  const id = activeOrgId.value
  if (!id) return ''
  const org = orgOptions.value.find((o) => o.id === id)
  return org?.display_name || org?.legal_name || ''
})

const isInitialLoading = computed(
  () => !pageReady.value || ((store.loading || store.providersLoading) && !store.email && !store.providers.length),
)

async function loadOrganizations() {
  try {
    const [companyRes, partnerRes, resellerRes] = await Promise.all([
      organizationsApi.list({ page: 1, per_page: 100, type: 'company', status: 'active' }),
      organizationsApi.list({ page: 1, per_page: 100, type: 'partner', status: 'active' }),
      organizationsApi.list({ page: 1, per_page: 100, type: 'reseller', status: 'active' }),
    ])
    const map = new Map<number, OrganizationItem>()
    for (const o of companyRes.data.data.items) map.set(o.id, o)
    if (canPickOrganization.value) {
      for (const o of partnerRes.data.data.items) map.set(o.id, o)
      for (const o of resellerRes.data.data.items) map.set(o.id, o)
    }
    orgOptions.value = [...map.values()]
  } catch {
    orgOptions.value = []
  }
}

async function resolveInitialOrgId(): Promise<number | null> {
  if (isValidOrgId(defaultOrganizationId.value)) return defaultOrganizationId.value
  if (orgOptions.value.length === 1) return orgOptions.value[0].id
  const company = orgOptions.value.find((o) => o.type === 'company')
  const id = company?.id ?? orgOptions.value[0]?.id ?? null
  return isValidOrgId(id) ? id : null
}

async function loadSettings() {
  let orgId = store.selectedOrganizationId
  if (!isValidOrgId(orgId)) orgId = await resolveInitialOrgId()
  if (!isValidOrgId(orgId)) return false

  store.setSelectedOrganizationId(orgId)
  await store.fetchEmailSettings(orgId)
  return true
}

async function reloadSettings() {
  try {
    const ok = await loadSettings()
    if (!ok) return
  } catch {
    toast.error(store.message || 'Unable to load email settings.')
  }
}

async function reloadAll() {
  let providersFailed = false
  try {
    await store.fetchProviders()
  } catch {
    providersFailed = true
  }

  try {
    const ok = await loadSettings()
    if (!ok) {
      toast.error('Unable to determine organization context.')
      return
    }
  } catch {
    toast.error(store.message || 'Unable to load email settings.')
    return
  }

  if (providersFailed) {
    toast.error(store.message || 'Unable to load email providers.')
  }
}

async function onOrgChange(organizationId: number) {
  if (!isValidOrgId(organizationId)) return
  store.setSelectedOrganizationId(organizationId)
  await reloadSettings()
}

async function onSave(payload: Record<string, unknown>) {
  try {
    await store.updateEmailSettings(payload as EmailSettingsUpdatePayload)
    toast.success(store.message || 'Email settings saved.')
    await reloadSettings()
  } catch {
    toast.error(store.message || 'Unable to save email settings.')
  }
}

async function onTest(payload: { organization_id: number; recipient_email: string }) {
  try {
    await store.sendTestEmail(payload)
    toast.success(store.message || 'Test email sent.')
    await reloadSettings()
  } catch {
    toast.error(store.message || 'Test email failed.')
  }
}

onMounted(async () => {
  if (!canViewEmailSettings.value) return
  pageReady.value = false
  await loadOrganizations()
  const orgId = await resolveInitialOrgId()
  if (isValidOrgId(orgId)) store.setSelectedOrganizationId(orgId)
  await reloadAll()
  pageReady.value = true
})
</script>

<template>
  <section v-if="!canViewEmailSettings" class="rounded-xl border bg-white p-8 text-center text-sm text-slate-600">
    You do not have permission to view email settings.
  </section>

  <section v-else class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div class="flex gap-4">
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200/50"
          aria-hidden="true"
        >
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-indigo-600">Settings</p>
          <h2 class="mt-0.5 text-xl font-bold tracking-tight text-slate-900">Email Settings</h2>
          <p class="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
            Configure outbound email delivery for your organization.
          </p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <EmailSettingsStatusBadge :status="configStatus" />
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          :disabled="store.loading || store.providersLoading"
          @click="reloadAll"
        >
          {{ store.loading || store.providersLoading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>
    </header>

    <div
      v-if="isInitialLoading"
      class="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200/90 bg-white py-16 text-sm text-slate-600 shadow-sm"
    >
      <span class="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      <span>Loading email settings…</span>
    </div>

    <template v-else>
      <div
        v-if="inheritanceMessage"
        class="rounded-lg border px-4 py-3 text-sm ring-1"
        :class="
          configStatus === 'inherited'
            ? 'border-sky-200 bg-sky-50 text-sky-900 ring-sky-100'
            : 'border-slate-200 bg-slate-50 text-slate-700 ring-slate-100'
        "
      >
        {{ inheritanceMessage }}
      </div>

      <div
        v-if="pageReady && !store.providers.length"
        class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        Email providers could not be loaded. Use Refresh or check your connection.
      </div>

      <EmailSettingsForm
        :email="store.email"
        :providers="store.providers"
        :org-options="orgOptions"
        :show-org-picker="showOrgPicker"
        :org-display-name="selectedOrgDisplayName"
        :can-manage="canManageEmailSettings"
        :saving="store.saving"
        :testing="store.testing"
        :field-errors="store.fieldErrors"
        :organization-id="activeOrgId"
        @save="onSave"
        @org-change="onOrgChange"
        @test="onTest"
      />
    </template>
  </section>
</template>
