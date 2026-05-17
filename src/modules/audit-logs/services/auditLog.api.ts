import { apiClient } from '@/core/http/apiClient'
import type {
  AuditLogDetailResponse,
  AuditLogListParams,
  AuditLogListResponse,
} from '@/modules/audit-logs/types/auditLog.types'
import { sanitizeAuditLogParams } from '@/modules/audit-logs/utils/auditLogParams'

export const auditLogApi = {
  list(params?: AuditLogListParams) {
    return apiClient.get<AuditLogListResponse>('/audit-logs', {
      params: sanitizeAuditLogParams(params ?? {}),
    })
  },

  detail(publicId: string) {
    return apiClient.get<AuditLogDetailResponse>(`/audit-logs/${encodeURIComponent(publicId)}`)
  },

  export(params?: AuditLogListParams) {
    return apiClient.get<Blob>('/audit-logs/export', {
      params: sanitizeAuditLogParams(params ?? {}),
      responseType: 'blob',
    })
  },
}
