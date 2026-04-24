import { apiClient } from '@/core/http/apiClient'
import type { Pagination } from '@/modules/users/services/users.api'

export type PipelineItem = {
  id: number
  tenant_id: number
  name: string
  status: number | 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export type PipelineStageItem = {
  id: number
  pipeline_id: number
  tenant_id?: number
  name: string
  stage_order: number
  status: number | 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

type PipelinesListResponse = {
  success: boolean
  message: string
  data: { items: PipelineItem[]; pagination: Pagination }
}

type PipelineResponse = {
  success: boolean
  message: string
  data: { pipeline: PipelineItem }
}

type PipelineStagesResponse = {
  success: boolean
  message: string
  data: { items: PipelineStageItem[] }
}

type PipelineStageResponse = {
  success: boolean
  message: string
  data: { stage: PipelineStageItem }
}

export const pipelinesApi = {
  list(params: { per_page?: number; page?: number; search?: string; status?: number | ''; tenant_id?: number }) {
    return apiClient.get<PipelinesListResponse>('/pipelines', { params })
  },
  create(payload: { name: string; status?: number; tenant_id?: number }) {
    return apiClient.post<PipelineResponse>('/pipelines', payload)
  },
  update(pipelineId: number, payload: { name?: string; status?: number }) {
    return apiClient.put<PipelineResponse>(`/pipelines/${pipelineId}`, payload)
  },
  remove(pipelineId: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/pipelines/${pipelineId}`)
  },
  listStages(pipelineId: number) {
    return apiClient.get<PipelineStagesResponse>(`/pipelines/${pipelineId}/stages`)
  },
  createStage(pipelineId: number, payload: { name: string; stage_order: number; status?: number }) {
    return apiClient.post<PipelineStageResponse>(`/pipelines/${pipelineId}/stages`, payload)
  },
  updateStage(pipelineId: number, stageId: number, payload: { name?: string; stage_order?: number; status?: number }) {
    return apiClient.put<PipelineStageResponse>(`/pipelines/${pipelineId}/stages/${stageId}`, payload)
  },
  removeStage(pipelineId: number, stageId: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/pipelines/${pipelineId}/stages/${stageId}`)
  },
}
