import { apiClient } from '@/core/http/apiClient'
import type {
  PaymentSettingsGetResponse,
  PaymentSettingsSavePayload,
  PaymentSettingsSaveResponse,
} from '@/modules/payments/types/payment.types'

export const paymentSettingsApi = {
  get(params?: { tenant_id?: number }) {
    return apiClient.get<PaymentSettingsGetResponse>('/settings/payment', { params })
  },
  create(payload: PaymentSettingsSavePayload) {
    return apiClient.post<PaymentSettingsSaveResponse>('/settings/payment', payload)
  },
  update(payload: PaymentSettingsSavePayload) {
    return apiClient.put<PaymentSettingsSaveResponse>('/settings/payment', payload)
  },
}
