import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { pipelinesApi, type PipelineItem, type PipelineStageItem } from '@/modules/pipelines/services/pipelines.api'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const usePipelinesStore = defineStore('pipelines', () => {
  const items = ref<PipelineItem[]>([])
  const stageMap = ref<Record<number, PipelineStageItem[]>>({})
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  const search = ref('')
  const status = ref<number | ''>('')

  async function fetchPipelines(page = 1, perPage = 100, tenantId?: number) {
    loading.value = true
    try {
      const { data } = await pipelinesApi.list({
        page,
        per_page: perPage,
        search: search.value || undefined,
        status: status.value,
        tenant_id: tenantId,
      })
      items.value = data.data.items
      pagination.value = data.data.pagination
      message.value = data.message
      return items.value
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function fetchStages(pipelineId: number) {
    try {
      const { data } = await pipelinesApi.listStages(pipelineId)
      stageMap.value[pipelineId] = [...data.data.items].sort((a, b) => a.stage_order - b.stage_order)
      return stageMap.value[pipelineId]
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    }
  }

  async function createPipeline(payload: { name: string; status?: number; tenant_id?: number }) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await pipelinesApi.create(payload)
      message.value = data.message
      await fetchPipelines(pagination.value.current_page, pagination.value.per_page, payload.tenant_id)
      return data.data.pipeline
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function createStage(pipelineId: number, payload: { name: string; stage_order: number; status?: number }) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await pipelinesApi.createStage(pipelineId, payload)
      message.value = data.message
      await fetchStages(pipelineId)
      return data.data.stage
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    stageMap,
    pagination,
    loading,
    message,
    errors,
    search,
    status,
    fetchPipelines,
    fetchStages,
    createPipeline,
    createStage,
  }
})
