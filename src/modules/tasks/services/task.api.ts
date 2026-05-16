import { apiClient } from '@/core/http/apiClient'
import type {
  ApiEnvelope,
  AssignableUser,
  CreateTaskPayload,
  TaskDetailResponse,
  TaskItem,
  TaskListParams,
  TaskListResponse,
  UpdateTaskPayload,
} from '@/modules/tasks/types/task.types'

export const taskApi = {
  list(params?: TaskListParams) {
    return apiClient.get<TaskListResponse>('/tasks', { params })
  },

  get(id: number) {
    return apiClient.get<TaskDetailResponse>(`/tasks/${id}`)
  },

  create(payload: CreateTaskPayload) {
    return apiClient.post<TaskDetailResponse>('/tasks', payload)
  },

  update(id: number, payload: UpdateTaskPayload) {
    return apiClient.patch<TaskDetailResponse>(`/tasks/${id}`, payload)
  },

  delete(id: number) {
    return apiClient.delete<ApiEnvelope<Record<string, never>>>(`/tasks/${id}`)
  },

  assign(id: number, assigneeUserId: number) {
    return apiClient.post<TaskDetailResponse>(`/tasks/${id}/assign`, { assignee_user_id: assigneeUserId })
  },

  start(id: number) {
    return apiClient.post<TaskDetailResponse>(`/tasks/${id}/start`)
  },

  complete(id: number) {
    return apiClient.post<TaskDetailResponse>(`/tasks/${id}/complete`)
  },

  cancel(id: number) {
    return apiClient.post<TaskDetailResponse>(`/tasks/${id}/cancel`)
  },

  reopen(id: number) {
    return apiClient.post<TaskDetailResponse>(`/tasks/${id}/reopen`)
  },

  assignableUsers(params?: { search?: string }) {
    return apiClient.get<ApiEnvelope<{ users: AssignableUser[] }>>('/tasks/assignable-users', { params })
  },
}

export type { TaskItem }
