import type { Pagination } from '@/modules/users/services/users.api'

export type InvoiceStatus = 'paid' | 'unpaid' | 'void' | string

export type InvoiceModel = {
  id: number
  invoice_number: string
  status: InvoiceStatus
  quote_id: number
  payment_record_id?: number | null
  customer_name?: string | null
  customer_email?: string | null
  subtotal: string | number
  tax_total: string | number
  discount_total: string | number
  total: string | number
  currency_code?: string | null
  issued_at?: string | null
  paid_at?: string | null
}

export type InvoicesListResponse = {
  success: boolean
  message: string
  data: {
    items: InvoiceModel[]
    pagination: Pagination
  }
}

export type InvoiceResponse = {
  success: boolean
  message: string
  data: {
    invoice: InvoiceModel
  }
}
