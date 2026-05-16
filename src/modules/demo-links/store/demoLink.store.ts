import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toApiError } from '@/core/http/apiClient'
import { demoLinkApi } from '@/modules/demo-links/services/demoLink.api'
import type {
  DemoLinkItem,
  DemoLinkListParams,
  DemoLinkPayload,
  DemoLinkUpdatePayload,
  ShareableOrganization,
} from '@/modules/demo-links/types/demoLink.types'
import type { Pagination } from '@/modules/users/services/users.api'

const emptyPagination = (): Pagination => ({
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
})

function unwrapDemoLink(data: { demo_link?: DemoLinkItem } & Record<string, unknown>): DemoLinkItem {
  if (data.demo_link) return data.demo_link
  return data as unknown as DemoLinkItem
}

function unwrapShareableOrgs(payload: unknown): ShareableOrganization[] {
  if (!payload || typeof payload !== 'object') return []
  const data = payload as Record<string, unknown>
  if (Array.isArray(data.organizations)) return data.organizations as ShareableOrganization[]
  if (Array.isArray(data.items)) return data.items as ShareableOrganization[]
  return []
}

export const useDemoLinkStore = defineStore('demoLink', () => {
  const message = ref('')
  const loading = ref(false)
  const detailLoading = ref(false)
  const saving = ref(false)
  const statusCheckingId = ref<number | null>(null)
  const demoLinks = ref<DemoLinkItem[]>([])
  const pagination = ref<Pagination>(emptyPagination())
  const currentDemoLink = ref<DemoLinkItem | null>(null)
  const shareableOrganizations = ref<ShareableOrganization[]>([])
  const fieldErrors = ref<Record<string, string[]>>({})

  async function fetchDemoLinks(params?: DemoLinkListParams) {
    loading.value = true
    fieldErrors.value = {}
    try {
      const { data } = await demoLinkApi.list(params)
      demoLinks.value = data.data.items
      pagination.value = data.data.pagination
      message.value = data.message
    } catch (error) {
      message.value = toApiError(error).message
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchDemoLink(id: number, revealCredentials = false) {
    detailLoading.value = true
    try {
      const { data } = await demoLinkApi.get(id, { reveal_credentials: revealCredentials })
      const link = unwrapDemoLink(data.data)
      currentDemoLink.value = link
      message.value = data.message
      return link
    } catch (error) {
      message.value = toApiError(error).message
      throw error
    } finally {
      detailLoading.value = false
    }
  }

  async function fetchShareableOrganizations() {
    const { data } = await demoLinkApi.shareableOrganizations()
    shareableOrganizations.value = unwrapShareableOrgs(data.data)
    return shareableOrganizations.value
  }

  async function createDemoLink(payload: DemoLinkPayload) {
    saving.value = true
    fieldErrors.value = {}
    try {
      const { data } = await demoLinkApi.create(payload)
      const link = unwrapDemoLink(data.data)
      currentDemoLink.value = link
      message.value = data.message
      return link
    } catch (error) {
      const err = toApiError(error)
      message.value = err.message
      fieldErrors.value = err.fieldErrors
      throw error
    } finally {
      saving.value = false
    }
  }

  async function updateDemoLink(id: number, payload: DemoLinkUpdatePayload) {
    saving.value = true
    fieldErrors.value = {}
    try {
      const { data } = await demoLinkApi.update(id, payload)
      const link = unwrapDemoLink(data.data)
      currentDemoLink.value = link
      message.value = data.message
      const index = demoLinks.value.findIndex((item) => item.id === id)
      if (index >= 0) demoLinks.value[index] = link
      return link
    } catch (error) {
      const err = toApiError(error)
      message.value = err.message
      fieldErrors.value = err.fieldErrors
      throw error
    } finally {
      saving.value = false
    }
  }

  async function deleteDemoLink(id: number) {
    const { data } = await demoLinkApi.remove(id)
    message.value = data.message
    demoLinks.value = demoLinks.value.filter((item) => item.id !== id)
  }

  async function checkDemoLinkStatus(id: number) {
    statusCheckingId.value = id
    try {
      const { data } = await demoLinkApi.checkStatus(id)
      const link = unwrapDemoLink(data.data)
      const index = demoLinks.value.findIndex((item) => item.id === id)
      if (index >= 0) demoLinks.value[index] = { ...demoLinks.value[index], ...link }
      if (currentDemoLink.value?.id === id) currentDemoLink.value = { ...currentDemoLink.value, ...link }
      message.value = data.message
      return link
    } catch (error) {
      message.value = toApiError(error).message
      throw error
    } finally {
      statusCheckingId.value = null
    }
  }

  return {
    message,
    loading,
    detailLoading,
    saving,
    statusCheckingId,
    demoLinks,
    pagination,
    currentDemoLink,
    shareableOrganizations,
    fieldErrors,
    fetchDemoLinks,
    fetchDemoLink,
    fetchShareableOrganizations,
    createDemoLink,
    updateDemoLink,
    deleteDemoLink,
    checkDemoLinkStatus,
  }
})
