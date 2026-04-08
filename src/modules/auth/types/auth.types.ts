export interface User {
  id: number
  tenant_id: number
  team_id?: number | null
  data_scope?: 'self' | 'team'
  role: 'global_admin' | 'company_admin' | 'user'
  /** Backend maps DB ints to these strings */
  status?: 'active' | 'inactive' | 'suspended'
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
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
