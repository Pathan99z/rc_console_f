import { companiesApi } from '@/modules/companies/services/companies.api'
import { contactsApi } from '@/modules/contacts/services/contacts.api'
import { dealsApi } from '@/modules/deals/services/deals.api'
import { organizationsApi } from '@/modules/organizations/services/organization.api'
import { quotesApi } from '@/modules/quotes/services/quote.api'
import { usersApi } from '@/modules/users/services/users.api'

export type AuditLookupOption = {
  id: number | string
  label: string
  meta?: string
}

function matchQuery(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return haystack.toLowerCase().includes(q)
}

export async function searchOrganizations(
  query: string,
  options?: { tenantId?: number; globalAdmin?: boolean },
): Promise<AuditLookupOption[]> {
  try {
    const params: { page: number; per_page: number; search?: string; tenant_id?: number } = {
      page: 1,
      per_page: 50,
    }
    const q = query.trim()
    if (q) params.search = q
    if (options?.globalAdmin && options.tenantId) {
      params.tenant_id = options.tenantId
    }

    const { data } = await organizationsApi.list(params)
    return (data.data?.items ?? []).map((org) => ({
      id: org.id,
      label: org.display_name || org.legal_name || `Organization #${org.id}`,
      meta: org.type,
    }))
  } catch {
    return []
  }
}

export async function searchUsers(query: string): Promise<AuditLookupOption[]> {
  try {
    const { data } = await usersApi.list(100, 1)
    const items = data.data?.items ?? []
    return items
      .filter((user) => matchQuery(`${user.name} ${user.email} ${user.id}`, query))
      .slice(0, 30)
      .map((user) => ({
        id: user.id,
        label: user.name,
        meta: user.email,
      }))
  } catch {
    return []
  }
}

export async function searchContacts(query: string): Promise<AuditLookupOption[]> {
  try {
    const { data } = await contactsApi.list({
      page: 1,
      per_page: 25,
      search: query.trim() || undefined,
    })
    return (data.data?.items ?? []).map((c) => ({
      id: c.id,
      label: `${c.first_name} ${c.last_name}`.trim() || c.email || `Contact #${c.id}`,
      meta: c.email || undefined,
    }))
  } catch {
    return []
  }
}

export async function searchCompanies(query: string): Promise<AuditLookupOption[]> {
  try {
    const { data } = await companiesApi.list({
      page: 1,
      per_page: 25,
      search: query.trim() || undefined,
    })
    return (data.data?.items ?? []).map((c) => ({
      id: c.id,
      label: c.name,
      meta: c.email || undefined,
    }))
  } catch {
    return []
  }
}

export async function searchDeals(query: string): Promise<AuditLookupOption[]> {
  try {
    const { data } = await dealsApi.list({
      page: 1,
      per_page: 25,
      search: query.trim() || undefined,
    })
    return (data.data?.items ?? []).map((d) => ({
      id: d.id,
      label: d.name,
      meta: d.contact ? `${d.contact.first_name} ${d.contact.last_name}`.trim() : undefined,
    }))
  } catch {
    return []
  }
}

export async function searchQuotes(query: string): Promise<AuditLookupOption[]> {
  try {
    const { data } = await quotesApi.list({ page: 1, per_page: 50 })
    const q = query.trim().toLowerCase()
    return (data.data?.items ?? [])
      .filter((quote) => {
        if (!q) return true
        const hay = `${quote.id} ${quote.quote_number} ${quote.contact?.first_name ?? ''} ${quote.contact?.last_name ?? ''}`
        return hay.toLowerCase().includes(q)
      })
      .slice(0, 25)
      .map((quote) => ({
        id: quote.id,
        label: quote.quote_number || `Quote #${quote.id}`,
        meta: quote.contact
          ? `${quote.contact.first_name} ${quote.contact.last_name}`.trim()
          : undefined,
      }))
  } catch {
    return []
  }
}

export function entityLookupSearch(
  entityType: string,
  query: string,
  ctx: { tenantId?: number; globalAdmin?: boolean },
): Promise<AuditLookupOption[]> {
  switch (entityType) {
    case 'contact':
      return searchContacts(query)
    case 'company':
      return searchCompanies(query)
    case 'deal':
      return searchDeals(query)
    case 'quote':
      return searchQuotes(query)
    case 'user':
      return searchUsers(query)
    case 'organization':
      return searchOrganizations(query, ctx)
    default:
      return Promise.resolve([])
  }
}

export function entityTypeHasLookup(entityType: string): boolean {
  return ['contact', 'company', 'deal', 'quote', 'user', 'organization'].includes(entityType)
}
