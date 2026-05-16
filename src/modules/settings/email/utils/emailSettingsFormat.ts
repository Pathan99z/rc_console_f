import type {
  EffectiveMailConfig,
  EmailConfigStatus,
  EmailOrgRef,
  EmailProviderPreset,
  EmailSettingsRecord,
} from '@/modules/settings/email/types/emailSettings.types'

export function isValidOrgId(id: number | null | undefined): id is number {
  return typeof id === 'number' && Number.isFinite(id) && id > 0
}

export function orgLabel(org?: EmailOrgRef | null): string {
  if (!org) return 'parent organization'
  return (org.display_name || org.legal_name || `Organization #${org.id}`).trim()
}

export function deriveEmailConfigStatus(email: EmailSettingsRecord | null): EmailConfigStatus {
  if (!email) return 'platform_default'
  if (email.configured === true) return 'configured'
  if (email.inherited === true || email.source_organization_id) return 'inherited'
  if (email.using_platform_default === true) return 'platform_default'
  if (email.host && email.password_configured) return 'configured'
  if (email.effective_mail?.host && email.source_organization_id) return 'inherited'
  if (email.effective_mail?.host) return 'platform_default'
  return 'platform_default'
}

export function statusBadgeClass(status: EmailConfigStatus): string {
  if (status === 'configured') return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
  if (status === 'inherited') return 'bg-sky-50 text-sky-800 ring-sky-200'
  return 'bg-slate-100 text-slate-700 ring-slate-200'
}

export function statusBadgeLabel(status: EmailConfigStatus): string {
  if (status === 'configured') return 'Configured'
  if (status === 'inherited') return 'Inherited'
  return 'Platform default'
}

export function inheritanceBannerText(email: EmailSettingsRecord): string | null {
  const status = deriveEmailConfigStatus(email)
  if (status === 'configured') return null
  if (status === 'inherited') {
    const src = email.source_organization
    const type = src?.type ? ` (${src.type})` : ''
    return `Email delivery is currently inherited from ${orgLabel(src)}${type}.`
  }
  return 'Using platform default email configuration.'
}

export function formatTestedAt(value?: string | null): string {
  if (!value) return 'Never tested'
  try {
    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return value
  }
}

/** Normalize provider objects from API (supports legacy flat shape). */
export function normalizeProvider(raw: unknown): EmailProviderPreset | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const code = String(o.code ?? o.key ?? '').trim()
  if (!code) return null

  const label = String(o.label ?? code)
  const manual_only = Boolean(o.manual_only)

  if (o.defaults && typeof o.defaults === 'object') {
    const d = o.defaults as Record<string, unknown>
    return {
      code,
      label,
      manual_only,
      defaults: {
        driver: d.driver != null ? String(d.driver) : null,
        host: d.host != null ? String(d.host) : null,
        port: d.port != null ? d.port : null,
        encryption: d.encryption != null ? String(d.encryption) : null,
      },
    }
  }

  if (o.driver != null || o.host != null || o.port != null || o.encryption != null) {
    return {
      code,
      label,
      manual_only,
      defaults: {
        driver: o.driver != null ? String(o.driver) : null,
        host: o.host != null ? String(o.host) : null,
        port: o.port != null ? o.port : null,
        encryption: o.encryption != null ? String(o.encryption) : null,
      },
    }
  }

  return { code, label, manual_only, defaults: null }
}

export function unwrapProviders(payload: unknown): EmailProviderPreset[] {
  if (!payload || typeof payload !== 'object') return []
  const data = payload as Record<string, unknown>
  const list = Array.isArray(data.providers) ? data.providers : Array.isArray(data.items) ? data.items : []
  return list.map(normalizeProvider).filter((p): p is EmailProviderPreset => p !== null)
}

export function findProvider(providers: EmailProviderPreset[], code: string): EmailProviderPreset | undefined {
  const key = code.trim().toLowerCase()
  if (!key) return undefined
  return providers.find((p) => p.code.trim().toLowerCase() === key)
}

function pickField(raw: Record<string, unknown>, settings: Record<string, unknown> | null, key: string): unknown {
  if (settings && settings[key] !== undefined && settings[key] !== null) return settings[key]
  return raw[key]
}

/** Flatten GET/PATCH email payload: merges `email.settings` with envelope metadata. */
export function normalizeEmailSettingsRecord(payload: unknown): EmailSettingsRecord | null {
  if (!payload || typeof payload !== 'object') return null
  const raw = payload as Record<string, unknown>
  const settings =
    raw.settings && typeof raw.settings === 'object' ? (raw.settings as Record<string, unknown>) : null

  const effectiveRaw = raw.effective_mail ?? settings?.effective_mail
  const effective_mail =
    effectiveRaw && typeof effectiveRaw === 'object' ? (effectiveRaw as EffectiveMailConfig) : null

  const portVal = pickField(raw, settings, 'port')
  const failureVal = pickField(raw, settings, 'failure_count')

  return {
    organization_id: Number(pickField(raw, settings, 'organization_id') ?? raw.organization_id) || undefined,
    provider: (pickField(raw, settings, 'provider') as string | null) ?? null,
    driver: (pickField(raw, settings, 'driver') as string | null) ?? null,
    host: (pickField(raw, settings, 'host') as string | null) ?? null,
    port: portVal != null && portVal !== '' ? portVal : null,
    username: (pickField(raw, settings, 'username') as string | null) ?? null,
    password_configured: Boolean(pickField(raw, settings, 'password_configured') ?? raw.password_configured),
    from_address: (pickField(raw, settings, 'from_address') as string | null) ?? null,
    from_name: (pickField(raw, settings, 'from_name') as string | null) ?? null,
    reply_to_address: (pickField(raw, settings, 'reply_to_address') as string | null) ?? null,
    encryption: (pickField(raw, settings, 'encryption') as string | null) ?? null,
    is_active:
      pickField(raw, settings, 'is_active') !== undefined
        ? Boolean(pickField(raw, settings, 'is_active'))
        : raw.is_active !== undefined
          ? Boolean(raw.is_active)
          : undefined,
    configured: raw.configured as boolean | undefined,
    inherited: raw.inherited as boolean | undefined,
    using_platform_default: raw.using_platform_default as boolean | undefined,
    source_organization_id: (raw.source_organization_id as number | null) ?? null,
    source_organization: (raw.source_organization as EmailOrgRef | null) ?? null,
    effective_mail,
    last_tested_at: (pickField(raw, settings, 'last_tested_at') as string | null) ?? null,
    verification_status: (pickField(raw, settings, 'verification_status') as string | null) ?? null,
    failure_count: failureVal != null && failureVal !== '' ? Number(failureVal) : null,
    last_error: (pickField(raw, settings, 'last_error') as string | null) ?? null,
  }
}

export function unwrapProvidersPayload(envelopeData: unknown): EmailProviderPreset[] {
  if (!envelopeData || typeof envelopeData !== 'object') return []
  const layer = envelopeData as Record<string, unknown>
  if (layer.data && typeof layer.data === 'object' && !Array.isArray(layer.data)) {
    return unwrapProviders(layer.data)
  }
  return unwrapProviders(layer)
}
