import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { taskApi } from '@/modules/tasks/services/task.api'
import type {
  AssignableUser,
  CreateTaskPayload,
  TaskItem,
  TaskListParams,
  UpdateTaskPayload,
} from '@/modules/tasks/types/task.types'
import type { Pagination } from '@/modules/users/services/users.api'

const emptyPagination = (): Pagination => ({
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
})

export const useTaskStore = defineStore('task', () => {
  const message = ref('')
  const loading = ref(false)
  const detailLoading = ref(false)
  const tasks = ref<TaskItem[]>([])
  const pagination = ref<Pagination>(emptyPagination())
  const currentTask = ref<TaskItem | null>(null)
  const assignableUsers = ref<AssignableUser[]>([])
  const fieldErrors = ref<Record<string, string[]>>({})

  async function fetchTasks(params?: TaskListParams) {
    loading.value = true
    fieldErrors.value = {}
    try {
      const { data } = await taskApi.list(params)
      tasks.value = data.data.items
      pagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      message.value = toApiError(error).message
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchTask(id: number) {
    detailLoading.value = true
    try {
      const { data } = await taskApi.get(id)
      currentTask.value = data.data.task
      message.value = data.message
      return data.data.task
    } catch (error) {
      message.value = toApiError(error).message
      throw error
    } finally {
      detailLoading.value = false
    }
  }

  async function createTask(payload: CreateTaskPayload) {
    fieldErrors.value = {}
    try {
      const { data } = await taskApi.create(payload)
      currentTask.value = data.data.task
      message.value = data.message
      return data.data.task
    } catch (error) {
      const err = toApiError(error)
      message.value = err.message
      fieldErrors.value = err.fieldErrors
      throw error
    }
  }

  async function updateTask(id: number, payload: UpdateTaskPayload) {
    fieldErrors.value = {}
    try {
      const { data } = await taskApi.update(id, payload)
      currentTask.value = data.data.task
      message.value = data.message
      return data.data.task
    } catch (error) {
      const err = toApiError(error)
      message.value = err.message
      fieldErrors.value = err.fieldErrors
      throw error
    }
  }

  async function deleteTask(id: number) {
    const { data } = await taskApi.delete(id)
    message.value = data.message
  }

  async function assignTask(id: number, assigneeUserId: number) {
    const { data } = await taskApi.assign(id, assigneeUserId)
    currentTask.value = data.data.task
    message.value = data.message
    return data.data.task
  }

  async function workflow(id: number, action: 'start' | 'complete' | 'cancel' | 'reopen') {
    let response
    switch (action) {
      case 'start':
        response = await taskApi.start(id)
        break
      case 'complete':
        response = await taskApi.complete(id)
        break
      case 'cancel':
        response = await taskApi.cancel(id)
        break
      case 'reopen':
        response = await taskApi.reopen(id)
        break
    }
    currentTask.value = response.data.data.task
    message.value = response.data.message
    return currentTask.value
  }

  function unwrapAssignableUsers(payload: unknown): AssignableUser[] {
    if (!payload || typeof payload !== 'object') return []
    const data = payload as Record<string, unknown>
    if (Array.isArray(data.users)) return data.users as AssignableUser[]
    if (Array.isArray(data.items)) return data.items as AssignableUser[]
    if (Array.isArray(payload)) return payload as AssignableUser[]
    return []
  }

  async function fetchAssignableUsers(search?: string) {
    try {
      const { data } = await taskApi.assignableUsers(search ? { search } : undefined)
      assignableUsers.value = unwrapAssignableUsers(data.data)
      return assignableUsers.value
    } catch (error) {
      assignableUsers.value = []
      message.value = toApiError(error).message
      throw error
    }
  }

  return {
    message,
    loading,
    detailLoading,
    tasks,
    pagination,
    currentTask,
    assignableUsers,
    fieldErrors,
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    workflow,
    fetchAssignableUsers,
  }
})
