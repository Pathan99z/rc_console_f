import { findProvider } from '@/modules/settings/email/utils/emailSettingsFormat'
import type { EmailProviderPreset } from '@/modules/settings/email/types/emailSettings.types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export type EmailFormValidationInput = {
  provider: string
  driver: string
  username: string
  from_address: string
  reply_to_address: string
  host: string
  port: string
  encryption: string
}

export function validateEmailForm(
  form: EmailFormValidationInput,
  providers: EmailProviderPreset[],
): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!form.provider.trim()) errors.provider = 'Provider is required.'
  if (!form.driver.trim()) errors.driver = 'Mail driver is required.'
  if (!form.username.trim()) errors.username = 'Username is required.'
  if (!form.from_address.trim()) errors.from_address = 'From address is required.'
  else if (!isValidEmail(form.from_address)) errors.from_address = 'Enter a valid email address.'

  if (form.reply_to_address.trim() && !isValidEmail(form.reply_to_address)) {
    errors.reply_to_address = 'Enter a valid reply-to address.'
  }

  const preset = findProvider(providers, form.provider)
  const manualOnly = preset?.manual_only === true

  if (manualOnly) {
    if (!form.host.trim()) errors.host = 'Host is required for this provider.'
    if (!form.port.trim()) errors.port = 'Port is required for this provider.'
    else if (!Number.isFinite(Number(form.port)) || Number(form.port) < 1) {
      errors.port = 'Port must be a positive number.'
    }
    if (!form.encryption.trim()) errors.encryption = 'Encryption is required for this provider.'
  }

  return errors
}

export function validateTestRecipient(recipient: string): string | null {
  if (!recipient.trim()) return 'Recipient email is required.'
  if (!isValidEmail(recipient)) return 'Enter a valid recipient email.'
  return null
}
