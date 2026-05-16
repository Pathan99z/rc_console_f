import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { emailSettingsApi } from '@/modules/settings/email/services/emailSettings.api'
import type {
  EmailProviderPreset,
  EmailSettingsRecord,
  EmailSettingsUpdatePayload,
  EmailTestPayload,
} from '@/modules/settings/email/types/emailSettings.types'
import {
  isValidOrgId,
  normalizeEmailSettingsRecord,
  unwrapProvidersPayload,
} from '@/modules/settings/email/utils/emailSettingsFormat'

export const useEmailSettingsStore = defineStore('emailSettings', () => {
  const message = ref('')
  const loading = ref(false)
  const saving = ref(false)
  const testing = ref(false)
  const providersLoading = ref(false)
  const email = ref<EmailSettingsRecord | null>(null)
  const providers = ref<EmailProviderPreset[]>([])
  const selectedOrganizationId = ref<number | null>(null)
  const fieldErrors = ref<Record<string, string[]>>({})

  function setSelectedOrganizationId(id: number | null) {
    selectedOrganizationId.value = id
  }

  async function fetchProviders() {
    providersLoading.value = true
    try {
      const { data } = await emailSettingsApi.providers()
      providers.value = unwrapProvidersPayload(data)
      return providers.value
    } catch (error) {
      providers.value = []
      message.value = toApiError(error).message
      throw error
    } finally {
      providersLoading.value = false
    }
  }

  async function fetchEmailSettings(organizationId?: number) {
    loading.value = true
    fieldErrors.value = {}
    try {
      const orgId = organizationId ?? selectedOrganizationId.value ?? undefined
      const params = isValidOrgId(orgId) ? { organization_id: orgId } : undefined
      const { data } = await emailSettingsApi.get(params)
      const inner = (data.data ?? data) as Record<string, unknown>
      const emailPayload = inner.email ?? inner
      email.value = normalizeEmailSettingsRecord(emailPayload)
      if (email.value?.organization_id && isValidOrgId(email.value.organization_id)) {
        selectedOrganizationId.value = email.value.organization_id
      }
      message.value = data.message
      return email.value
    } catch (error) {
      email.value = null
      message.value = toApiError(error).message
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateEmailSettings(payload: EmailSettingsUpdatePayload) {
    saving.value = true
    fieldErrors.value = {}
    try {
      const { data } = await emailSettingsApi.update(payload)
      const inner = (data.data ?? data) as Record<string, unknown>
      const settingsPayload = inner.settings ?? inner.email ?? inner
      email.value = normalizeEmailSettingsRecord(settingsPayload)
      message.value = data.message
      return email.value
    } catch (error) {
      const err = toApiError(error)
      message.value = err.message
      fieldErrors.value = err.fieldErrors
      throw error
    } finally {
      saving.value = false
    }
  }

  async function sendTestEmail(payload: EmailTestPayload) {
    testing.value = true
    fieldErrors.value = {}
    try {
      const { data } = await emailSettingsApi.test(payload)
      message.value = data.message
      return data.data
    } catch (error) {
      const err = toApiError(error)
      message.value = err.message
      fieldErrors.value = err.fieldErrors
      throw error
    } finally {
      testing.value = false
    }
  }

  return {
    message,
    loading,
    saving,
    testing,
    providersLoading,
    email,
    providers,
    selectedOrganizationId,
    fieldErrors,
    setSelectedOrganizationId,
    fetchProviders,
    fetchEmailSettings,
    updateEmailSettings,
    sendTestEmail,
  }
})
