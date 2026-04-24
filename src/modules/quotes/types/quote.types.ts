import type { Pagination } from '@/modules/users/services/users.api'

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected'

export type QuoteTypeCode = 0 | 1

export type QuoteContactRef = {
  id: number
  first_name: string
  last_name: string
  email?: string | null
}

export type QuoteDealRef = {
  id: number
  name: string
  status?: string
}

export type QuoteItem = {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: string | number
  tax_rate: string | number
  line_subtotal: string | number
  line_tax_total: string | number
  line_total: string | number
}

export type QuoteAttachment = {
  id: number
  name: string
  file_type: string
  file_size: number
  signed_url?: string
}

export type QuoteModel = {
  id: number
  quote_number: string
  public_uuid?: string | null
  status: QuoteStatus
  quote_type?: QuoteTypeCode
  notes?: string | null
  valid_until?: string | null
  discount_total: string | number
  subtotal: string | number
  tax_total: string | number
  total: string | number
  currency_code?: string | null
  contact?: QuoteContactRef | null
  deal?: QuoteDealRef | null
  items: QuoteItem[]
  attachments?: QuoteAttachment[]
  created_at?: string
  updated_at?: string
}

export type QuoteProductPayload = {
  product_id: number
  quantity: number
  unit_price?: number
  tax_rate?: number
}

export type QuotePayload = {
  contact_id: number
  deal_id?: number | null
  quote_type?: QuoteTypeCode
  notes?: string
  valid_until?: string
  discount_total?: number
  currency_code?: string
  products: QuoteProductPayload[]
}

export type QuoteUpdatePayload = Partial<Omit<QuotePayload, 'products'>> & {
  products?: QuoteProductPayload[]
}

export type QuoteListQuery = {
  page?: number
  per_page?: number
  status?: number | ''
  deal_id?: number | ''
  contact_id?: number | ''
  from_date?: string
  to_date?: string
}

export type QuotesListResponse = {
  success: boolean
  message: string
  data: { items: QuoteModel[]; pagination: Pagination }
}

export type QuoteResponse = {
  success: boolean
  message: string
  data: { quote: QuoteModel }
}
