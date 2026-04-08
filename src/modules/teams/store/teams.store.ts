import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { teamsApi, type TeamItem } from '@/modules/teams/services/teams.api'
import type { Pagination } from '@/modules/users/services/users.api'

const defaultPagination: Pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

export const useTeamsStore = defineStore('teams', () => {
  const items = ref<TeamItem[]>([])
  const pagination = ref<Pagination>(defaultPagination)
  const loading = ref(false)
  const message = ref('')
  const errors = ref<Record<string, string[]>>({})
  const search = ref('')
  const status = ref<number | ''>('')

  async function fetchTeams(page = 1, perPage = 15) {
    loading.value = true
    try {
      const { data } = await teamsApi.list({ page, per_page: perPage, search: search.value || undefined, status: status.value })
      items.value = data.data.items
      pagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function createTeam(payload: { name: string; status: number }) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await teamsApi.create(payload)
      message.value = data.message
      await fetchTeams(pagination.value.current_page, pagination.value.per_page)
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function updateTeam(teamId: number, payload: { name: string; status: number }) {
    loading.value = true
    errors.value = {}
    try {
      const { data } = await teamsApi.update(teamId, payload)
      message.value = data.message
      const index = items.value.findIndex((item) => item.id === teamId)
      if (index >= 0) items.value[index] = data.data.team
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      errors.value = normalized.fieldErrors
      throw normalized
    } finally {
      loading.value = false
    }
  }

  async function deleteTeam(teamId: number) {
    loading.value = true
    try {
      const { data } = await teamsApi.remove(teamId)
      message.value = data.message
      items.value = items.value.filter((item) => item.id !== teamId)
    } catch (error) {
      const normalized = toApiError(error)
      message.value = normalized.message
      throw normalized
    } finally {
      loading.value = false
    }
  }

  return { items, pagination, loading, message, errors, search, status, fetchTeams, createTeam, updateTeam, deleteTeam }
})
