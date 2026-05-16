import { apiClient } from '@/core/http/apiClient'
import type {
  DemoLinkDetailResponse,
  DemoLinkListParams,
  DemoLinkListResponse,
  DemoLinkPayload,
  DemoLinkStatusResponse,
  DemoLinkUpdatePayload,
  DemoLinkVisibilityPayload,
  ShareableOrganizationsResponse,
} from '@/modules/demo-links/types/demoLink.types'

function appendVisibility(form: FormData, visibility?: DemoLinkVisibilityPayload[]) {
  if (!visibility?.length) return
  visibility.forEach((entry, index) => {
    form.append(`visibility[${index}][organization_id]`, String(entry.organization_id))
    form.append(
      `visibility[${index}][include_child_organizations]`,
      entry.include_child_organizations ? '1' : '0',
    )
  })
}

function appendProductIds(form: FormData, productIds?: number[]) {
  if (!productIds?.length) return
  for (const id of productIds) {
    form.append('product_ids[]', String(id))
  }
}

function buildDemoLinkFormData(payload: DemoLinkPayload | DemoLinkUpdatePayload, includeScreenshot: boolean) {
  const form = new FormData()
  if ('owner_organization_id' in payload && payload.owner_organization_id != null) {
    form.append('owner_organization_id', String(payload.owner_organization_id))
  }
  if (payload.title != null) form.append('title', payload.title)
  if (payload.demo_url != null) form.append('demo_url', payload.demo_url)
  if (payload.demo_username != null) form.append('demo_username', payload.demo_username)
  if (payload.demo_password) form.append('demo_password', payload.demo_password)
  if (payload.description != null) form.append('description', payload.description)
  if (payload.is_active != null) form.append('is_active', payload.is_active ? '1' : '0')
  if (payload.check_live_status != null) form.append('check_live_status', payload.check_live_status ? '1' : '0')
  appendProductIds(form, payload.product_ids)
  appendVisibility(form, payload.visibility)
  if (includeScreenshot && payload.screenshot) form.append('screenshot', payload.screenshot)
  if ('remove_screenshot' in payload && payload.remove_screenshot) {
    form.append('remove_screenshot', '1')
  }
  return form
}

function buildJsonBody(payload: DemoLinkPayload | DemoLinkUpdatePayload) {
  const body: Record<string, unknown> = {}
  if ('owner_organization_id' in payload && payload.owner_organization_id != null) {
    body.owner_organization_id = payload.owner_organization_id
  }
  if (payload.title != null) body.title = payload.title
  if (payload.demo_url != null) body.demo_url = payload.demo_url
  if (payload.demo_username != null) body.demo_username = payload.demo_username
  if (payload.demo_password) body.demo_password = payload.demo_password
  if (payload.description != null) body.description = payload.description
  if (payload.is_active != null) body.is_active = payload.is_active
  if (payload.check_live_status != null) body.check_live_status = payload.check_live_status
  if (payload.product_ids) body.product_ids = payload.product_ids
  if (payload.visibility) body.visibility = payload.visibility
  if ('remove_screenshot' in payload && payload.remove_screenshot) body.remove_screenshot = true
  return body
}

export const demoLinkApi = {
  list(params?: DemoLinkListParams) {
    const query: Record<string, unknown> = { ...params }
    if (query.is_active === '') delete query.is_active
    else if (query.is_active === true || query.is_active === 1) query.is_active = 1
    else if (query.is_active === false || query.is_active === 0) query.is_active = 0
    return apiClient.get<DemoLinkListResponse>('/demo-links', { params: query })
  },

  get(id: number, options?: { reveal_credentials?: boolean }) {
    return apiClient.get<DemoLinkDetailResponse>(`/demo-links/${id}`, {
      params: options?.reveal_credentials ? { reveal_credentials: 1 } : undefined,
    })
  },

  shareableOrganizations() {
    return apiClient.get<ShareableOrganizationsResponse>('/demo-links/shareable-organizations')
  },

  create(payload: DemoLinkPayload) {
    if (payload.screenshot) {
      const form = buildDemoLinkFormData(payload, true)
      return apiClient.post<DemoLinkDetailResponse>('/demo-links', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return apiClient.post<DemoLinkDetailResponse>('/demo-links', buildJsonBody(payload))
  },

  update(id: number, payload: DemoLinkUpdatePayload) {
    if (payload.screenshot) {
      const form = buildDemoLinkFormData(payload, true)
      return apiClient.patch<DemoLinkDetailResponse>(`/demo-links/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return apiClient.patch<DemoLinkDetailResponse>(`/demo-links/${id}`, buildJsonBody(payload))
  },

  remove(id: number) {
    return apiClient.delete<{ success: boolean; message: string }>(`/demo-links/${id}`)
  },

  checkStatus(id: number) {
    return apiClient.post<DemoLinkStatusResponse>(`/demo-links/${id}/check-status`)
  },
}
