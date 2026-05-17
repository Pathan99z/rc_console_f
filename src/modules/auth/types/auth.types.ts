export interface User {
  id: number
  tenant_id: number
  team_id?: number | null
  data_scope?: 'self' | 'team'
  role:
    | 'global_admin'
    | 'company_admin'
    | 'user'
    | 'partner_admin'
    | 'partner_sales_manager'
    | 'partner_sales_consultant'
    | 'reseller_admin'
    | 'reseller_sales_consultant'
  organization_id?: number | null
  /** Backend maps DB ints to these strings */
  status?: 'active' | 'inactive' | 'suspended'
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  roles?: string[]
  permissions?: string[]
  tenant?: {
    id: number
    name?: string
  } | null
  tenant_name?: string | null
  organization?: {
    id: number
    type: string
    parent_id?: number | null
    display_name?: string | null
    legal_name?: string | null
    name?: string | null
  } | null
  organization_name?: string | null
  last_login_at?: string | null
  last_login?: string | null
  organization_role?: string | null
  navigation_profile?: string | null
  feature_flags?: Record<string, boolean>
}

export interface CapabilityProfile {
  role: string
  roles: string[]
  permissions: string[]
  navigation_profile: string | null
  feature_flags: Record<string, boolean>
}

export interface NavigationMenuItem {
  key?: string
  label: string
  route: string
  icon?: string
  permission?: string
  feature_flag?: string
  children?: NavigationMenuItem[]
}

export interface NavigationState {
  menus: {
    crm: NavigationMenuItem[]
    prm: NavigationMenuItem[]
  }
  feature_flags: Record<string, boolean>
  navigation_profile: string | null
}

export interface SessionContext {
  user: User | null
  capabilityProfile: CapabilityProfile
  navigation: NavigationState | null
}

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  company_name: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  email: string
  password: string
  device_name: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface UpdateProfilePayload {
  name: string
}

export interface ChangePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}
