import type { Pagination } from '@/modules/users/services/users.api'

export type AuditLogModule =
  | 'auth'
  | 'users'
  | 'contacts'
  | 'companies'
  | 'deals'
  | 'quotes'
  | 'payments'
  | 'licenses'
  | 'partners'
  | 'resellers'
  | 'smtp'

export type AuditLogSource = 'application' | 'http' | 'deal_histories' | 'deal_history' | ''

export type AuditLogListParams = {
  page?: number
  per_page?: number
  tenant_id?: number | string
  date_from?: string
  date_to?: string
  module?: AuditLogModule | string
  actor_user_id?: number | string
  event_key?: string
  entity_type?: string
  entity_id?: number | string
  organization_id?: number | string
  source?: AuditLogSource
  include_archived?: boolean | 0 | 1
  include_deal_histories?: boolean | 0 | 1
}

export type AuditLogActor = {
  id?: number
  name?: string
  email?: string
}

export type AuditLogOrganization = {
  id?: number
  display_name?: string
  legal_name?: string
}

export type AuditLogEntity = {
  type?: string
  id?: number | string
  label?: string
  summary?: string
}

export type AuditLogListItem = {
  public_id: string
  stream?: string
  occurred_at: string
  event_key: string
  module: string
  action?: string
  actor?: AuditLogActor | null
  organization?: AuditLogOrganization | null
  entity?: AuditLogEntity | null
  source?: string
  correlation_id?: string | null
  is_archived?: boolean
}

export type AuditLogDetail = AuditLogListItem & {
  tenant?: { id?: number; name?: string } | null
  ip_address?: string | null
  user_agent?: string | null
  immutable_at?: string | null
  archived_at?: string | null
  payload_before?: unknown
  payload_after?: unknown
  metadata?: unknown
}

export type AuditLogListResponse = {
  success: boolean
  message: string
  data: {
    items: AuditLogListItem[]
    pagination: Pagination
  }
}

export type AuditLogDetailResponse = {
  success: boolean
  message: string
  data: AuditLogDetail
}

export type AuditLogFiltersState = {
  date_from: string
  date_to: string
  module: AuditLogModule | ''
  event_key: string
  actor_user_id: string
  organization_id: string
  entity_type: string
  entity_id: string
  source: AuditLogSource | ''
  tenant_id: string
  include_archived: boolean
  include_deal_histories: boolean
}
