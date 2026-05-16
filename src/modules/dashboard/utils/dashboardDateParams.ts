import type { DashboardApiQueryParams, DashboardDatePreset, DashboardDateRange } from '@/modules/dashboard/types/dashboard.types'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function formatDateYmd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Map UI preset to API `from` / `to` (YYYY-MM-DD). Omits both for all_time. */
export function resolveDashboardDateRange(range: DashboardDateRange): { from?: string; to?: string } {
  if (range.preset === 'custom') {
    const from = range.from?.trim() || undefined
    const to = range.to?.trim() || undefined
    return from || to ? { from, to } : {}
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const to = formatDateYmd(today)

  if (!range.preset || range.preset === 'all_time') return {}

  const fromDate = new Date(today)
  switch (range.preset as DashboardDatePreset) {
    case 'last_7_days':
      fromDate.setDate(fromDate.getDate() - 6)
      break
    case 'last_30_days':
      fromDate.setDate(fromDate.getDate() - 29)
      break
    case 'last_90_days':
      fromDate.setDate(fromDate.getDate() - 89)
      break
    case 'this_year':
      fromDate.setMonth(0, 1)
      break
    default:
      fromDate.setDate(fromDate.getDate() - 29)
  }

  return { from: formatDateYmd(fromDate), to }
}

/** Query string for dashboard APIs — only `from` and `to`, never `preset` or `includes_children`. */
export function buildDashboardApiParams(range: DashboardDateRange): DashboardApiQueryParams {
  const { from, to } = resolveDashboardDateRange(range)
  const params: DashboardApiQueryParams = {}
  if (from) params.from = from
  if (to) params.to = to
  return params
}

export function dashboardRangeCacheKey(range: DashboardDateRange): string {
  const { from, to } = resolveDashboardDateRange(range)
  return `${from || ''}:${to || ''}`
}
