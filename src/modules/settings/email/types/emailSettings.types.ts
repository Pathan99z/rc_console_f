export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export type EmailConfigStatus = 'configured' | 'inherited' | 'platform_default'

export type EmailProviderDefaults = {
  driver?: string | null
  host?: string | null
  port?: number | string | null
  encryption?: string | null
}

export type EmailProviderPreset = {
  code: string
  label: string
  defaults?: EmailProviderDefaults | null
  manual_only?: boolean
}

export type EmailOrgRef = {
  id: number
  type?: string
  display_name?: string | null
  legal_name?: string | null
}

export type EffectiveMailConfig = {
  driver?: string | null
  host?: string | null
  port?: number | string | null
  encryption?: string | null
  username?: string | null
  from_address?: string | null
  from_name?: string | null
  reply_to_address?: string | null
  is_active?: boolean
}

export type EmailSettingsRecord = {
  organization_id?: number
  provider?: string | null
  driver?: string | null
  host?: string | null
  port?: number | string | null
  username?: string | null
  password_configured?: boolean
  from_address?: string | null
  from_name?: string | null
  reply_to_address?: string | null
  encryption?: string | null
  is_active?: boolean
  configured?: boolean
  inherited?: boolean
  using_platform_default?: boolean
  source_organization_id?: number | null
  source_organization?: EmailOrgRef | null
  effective_mail?: EffectiveMailConfig | null
  last_tested_at?: string | null
  verification_status?: string | null
  failure_count?: number | null
  last_error?: string | null
}

/** GET payload: org metadata on `email`, SMTP fields often under `email.settings`. */
export type EmailSettingsApiEmail = EmailSettingsRecord & {
  settings?: Partial<EmailSettingsRecord> | null
}

export type EmailSettingsGetResponse = ApiEnvelope<{ email: EmailSettingsApiEmail }>

export type EmailProvidersResponse = ApiEnvelope<{ providers: EmailProviderPreset[]; drivers?: string[] }>

export type EmailSettingsUpdatePayload = {
  organization_id: number
  provider: string
  driver?: string
  host?: string
  port?: number
  username?: string
  password?: string
  from_address?: string
  from_name?: string
  reply_to_address?: string
  encryption?: string
  is_active?: boolean
}

export type EmailSettingsUpdateResponse = ApiEnvelope<{ settings: EmailSettingsRecord }>

export type EmailTestPayload = {
  organization_id: number
  recipient_email: string
}

export type EmailTestResponse = ApiEnvelope<{
  sent?: boolean
  recipient?: string
  last_tested_at?: string
  verification_status?: string
}>
