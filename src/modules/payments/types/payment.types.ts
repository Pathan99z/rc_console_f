export type PayfastMode = 'sandbox' | 'live'

export type PaymentSettingsData = {
  tenant_id: number
  payfast_mode: PayfastMode | string
  merchant_id: string | null
  merchant_key_masked: string | null
  passphrase_configured: boolean
  return_url: string | null
  cancel_url: string | null
  notify_url: string | null
}

export type PaymentSettingsGetResponse = {
  success: boolean
  message: string
  data: PaymentSettingsData
}

export type PaymentSettingsSavePayload = {
  tenant_id?: number
  payfast_mode: PayfastMode | string
  merchant_id: string
  merchant_key?: string
  passphrase?: string
  return_url?: string
  cancel_url?: string
  notify_url?: string
}

export type PaymentSettingsSaveResponse = {
  success: boolean
  message: string
  data: PaymentSettingsData
}

export type PayFastPaymentSession = {
  action_url: string
  method: string
  payment_record_id: number
  fields: Record<string, string>
}

export type QuotePaymentLinkResponse = {
  success: boolean
  message: string
  data: PayFastPaymentSession
}

export type PaymentLinkRecord = {
  id: number
  quote_id?: number
  token?: string
  status?: string
  url?: string
  expires_at?: string | null
  sent_at?: string | null
}

export type PaymentLinkCreateResponse = {
  success: boolean
  message: string
  data: {
    payment_link?: PaymentLinkRecord
    link?: PaymentLinkRecord
  }
}

export type PaymentLinkSendResponse = {
  success: boolean
  message: string
  data?: {
    payment_link?: PaymentLinkRecord
    link?: PaymentLinkRecord
  }
}
