import { apiClient } from '@/core/http/apiClient'
import type {
  EmailProvidersResponse,
  EmailSettingsGetResponse,
  EmailSettingsUpdatePayload,
  EmailSettingsUpdateResponse,
  EmailTestPayload,
  EmailTestResponse,
} from '@/modules/settings/email/types/emailSettings.types'

export const emailSettingsApi = {
  get(params?: { organization_id?: number }) {
    return apiClient.get<EmailSettingsGetResponse>('/settings/email', { params })
  },

  providers() {
    return apiClient.get<EmailProvidersResponse>('/settings/email/providers')
  },

  update(payload: EmailSettingsUpdatePayload) {
    return apiClient.patch<EmailSettingsUpdateResponse>('/settings/email', payload)
  },

  test(payload: EmailTestPayload) {
    return apiClient.post<EmailTestResponse>('/settings/email/test', payload)
  },
}
