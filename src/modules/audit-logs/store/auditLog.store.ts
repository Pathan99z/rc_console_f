import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { auditLogApi } from '@/modules/audit-logs/services/auditLog.api'
import type { AuditLogDetail, AuditLogFiltersState, AuditLogListItem } from '@/modules/audit-logs/types/auditLog.types'
import { buildAuditLogListParams, defaultAuditFilters } from '@/modules/audit-logs/utils/auditLogParams'
import { normalizeAuditDetail } from '@/modules/audit-logs/utils/auditLogFormat'
import { unwrapAuditLogDetailBody, unwrapAuditLogListBody } from '@/modules/audit-logs/utils/auditLogResponse'
import type { Pagination } from '@/modules/users/services/users.api'

const emptyPagination = (): Pagination => ({
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1,
})

export const useAuditLogStore = defineStore('auditLogs', () => {
  const message = ref('')
  const accessDenied = ref(false)
  const listLoading = ref(false)
  const detailLoading = ref(false)
  const exporting = ref(false)
  const items = ref<AuditLogListItem[]>([])
  const currentDetail = ref<AuditLogDetail | null>(null)
  const pagination = ref<Pagination>(emptyPagination())
  const filters = reactive<AuditLogFiltersState>(defaultAuditFilters())

  function handleForbidden(error: unknown) {
    const err = toApiError(error)
    if (err.isForbidden) {
      accessDenied.value = true
      items.value = []
      currentDetail.value = null
      pagination.value = emptyPagination()
    }
    return err
  }

  async function fetchAuditLogs(page = 1, perPage = pagination.value.per_page) {
    if (accessDenied.value) return []
    listLoading.value = true
    message.value = ''
    try {
      const params = buildAuditLogListParams(filters, page, perPage)
      const { data: body } = await auditLogApi.list(params)

      if (body && typeof body === 'object' && 'success' in body && body.success === false) {
        message.value = body.message || 'Unable to load audit logs.'
        throw new Error(message.value)
      }

      const { items: parsedItems, pagination: pg } = unwrapAuditLogListBody(body, page, perPage)
      items.value = parsedItems
      pagination.value = pg
      if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
        message.value = body.message
      }
      return items.value
    } catch (error) {
      const err = handleForbidden(error)
      if (!err.isForbidden) {
        message.value = err.message || 'Unable to load audit logs.'
      }
      throw error
    } finally {
      listLoading.value = false
    }
  }

  async function fetchAuditLogDetail(publicId: string) {
    detailLoading.value = true
    message.value = ''
    try {
      const { data: body } = await auditLogApi.detail(publicId)
      if (body && typeof body === 'object' && 'success' in body && body.success === false) {
        message.value = body.message || 'Unable to load audit event.'
        throw new Error(message.value)
      }
      const raw = unwrapAuditLogDetailBody(body)
      currentDetail.value = normalizeAuditDetail(raw)
      return currentDetail.value
    } catch (error) {
      const err = handleForbidden(error)
      if (!err.isForbidden) message.value = err.message
      throw error
    } finally {
      detailLoading.value = false
    }
  }

  async function exportAuditLogs(page = 1, perPage = pagination.value.per_page) {
    exporting.value = true
    message.value = ''
    try {
      const params = buildAuditLogListParams(filters, page, perPage)
      const { data, headers } = await auditLogApi.export(params)
      return { blob: data, headers: headers as Record<string, string> }
    } catch (error) {
      const err = handleForbidden(error)
      if (!err.isForbidden) message.value = err.message
      throw error
    } finally {
      exporting.value = false
    }
  }

  function resetFilters() {
    Object.assign(filters, defaultAuditFilters())
  }

  function clearDetail() {
    currentDetail.value = null
  }

  return {
    message,
    accessDenied,
    listLoading,
    detailLoading,
    exporting,
    items,
    currentDetail,
    pagination,
    filters,
    fetchAuditLogs,
    fetchAuditLogDetail,
    exportAuditLogs,
    resetFilters,
    clearDetail,
  }
})
