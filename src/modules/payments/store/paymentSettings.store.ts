import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { paymentSettingsApi } from '@/modules/payments/services/paymentSettings.api'
import type { PaymentSettingsData, PaymentSettingsSavePayload } from '@/modules/payments/types/payment.types'
import { withRetry } from '@/shared/utils/withRetry'

function hasConfiguredMerchantId(data: PaymentSettingsData | null): boolean {
  if (!data?.merchant_id) return false
  return String(data.merchant_id).trim().length > 0
}

export const usePaymentSettingsStore = defineStore('paymentSettings', () => {
  const settings = ref<PaymentSettingsData | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  /** For global_admin: which tenant's settings to load/save */
  const selectedTenantId = ref<number | null>(null)

  async function fetchPaymentSettings(tenantId?: number | null) {
    loading.value = true
    errors.value = {}
    message.value = ''
    try {
      const params = tenantId ? { tenant_id: tenantId } : undefined
      const { data } = await withRetry(() => paymentSettingsApi.get(params))
      settings.value = data.data
      message.value = data.message
      return settings.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      settings.value = null
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function savePaymentSettings(payload: PaymentSettingsSavePayload) {
    saving.value = true
    errors.value = {}
    message.value = ''
    const usePut = hasConfiguredMerchantId(settings.value)
    try {
      const { data } = await withRetry(() =>
        usePut ? paymentSettingsApi.update(payload) : paymentSettingsApi.create(payload)
      )
      settings.value = data.data
      message.value = data.message
      return settings.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      saving.value = false
    }
  }

  function setSelectedTenantId(id: number | null) {
    selectedTenantId.value = id
  }

  return {
    settings,
    loading,
    saving,
    message,
    errors,
    selectedTenantId,
    fetchPaymentSettings,
    savePaymentSettings,
    setSelectedTenantId,
    hasConfiguredMerchantId,
  }
})
