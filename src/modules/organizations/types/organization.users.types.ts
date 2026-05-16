import type { Pagination } from '@/modules/users/services/users.api'

export type OrganizationUserRoleCode =
  | 'reseller_admin'
  | 'reseller_sales_manager'
  | 'reseller_sales_consultant'
  | 'partner_admin'

export type OrganizationUserStatus = 'active' | 'inactive' | 'suspended'

export type OrganizationUserItem = {
  id: number
  tenant_id?: number
  organization_id?: number
  role: string
  roles?: string[]
  permissions?: string[]
  organization?: { id: number; type: string; parent_id?: number | null }
  navigation_profile?: string
  status: OrganizationUserStatus | string
  name: string
  email: string
  invited_at?: string | null
  expires_at?: string | null
}

export type OrganizationUsersListResponse = {
  success: boolean
  message: string
  data: { items: OrganizationUserItem[]; pagination: Pagination }
}

export type OrganizationUserInvitePayload = {
  email: string
  role_code: OrganizationUserRoleCode
  expires_in_days?: number
}

export type OrganizationUserInviteResponse = {
  success: boolean
  message: string
  data: {
    invitation: {
      id: number
      email: string
      role_code: string
      status: string
      expires_at?: string
    }
    plain_token?: string
  }
}

export type OrganizationUserStatusPayload = {
  status: OrganizationUserStatus
}

export type OrganizationUserStatusResponse = {
  success: boolean
  message: string
  data: { user: OrganizationUserItem }
}
