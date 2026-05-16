import type { DemoLinkItem, DemoLinkLiveStatus, DemoLinkOrgRef } from '@/modules/demo-links/types/demoLink.types'

export function orgDisplayName(org?: DemoLinkOrgRef | null): string {
  if (!org) return '—'
  return (org.display_name || org.legal_name || `Org #${org.id}`).trim()
}

export function hasDemoPassword(link: DemoLinkItem): boolean {
  return Boolean(link.demo_password_set ?? link.has_password)
}

export function formatLiveStatus(status?: DemoLinkLiveStatus | null): string {
  if (!status) return 'UNKNOWN'
  return String(status).toUpperCase()
}

export function liveStatusClass(status?: DemoLinkLiveStatus | null): string {
  const normalized = formatLiveStatus(status)
  if (normalized === 'UP') return 'bg-emerald-50 text-emerald-800'
  if (normalized === 'DOWN') return 'bg-rose-50 text-rose-800'
  return 'bg-slate-100 text-slate-600'
}

export function formatCheckedAt(value?: string | null): string {
  if (!value) return 'Never checked'
  try {
    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return value
  }
}

export function screenshotSrc(link: DemoLinkItem): string | null {
  return link.screenshot_url || link.screenshot_path || null
}

export function productTags(link: DemoLinkItem): string[] {
  if (link.products?.length) return link.products.map((p) => p.name || `Product #${p.id}`)
  if (link.product_ids?.length) return link.product_ids.map((id) => `Product #${id}`)
  return []
}
