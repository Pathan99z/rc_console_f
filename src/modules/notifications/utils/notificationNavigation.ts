import type { Router } from 'vue-router'
import { normalizeActionUrl, resolveNotificationNavigation } from '@/modules/notifications/utils/notificationFormat'

export async function navigateToNotificationAction(router: Router, actionUrl?: string | null): Promise<boolean> {
  const url = normalizeActionUrl(actionUrl)
  if (!url) return false

  if (/^https?:\/\//i.test(url)) {
    globalThis.location.assign(url)
    return true
  }

  const target = resolveNotificationNavigation(url)
  if (!target) return false

  const result = await router.push({
    path: target.path,
    query: target.query,
  })

  if (result && typeof result === 'object' && 'name' in result) {
    const taskFallback = url.match(/\/app\/tasks\/(\d+)/i)
    if (taskFallback) {
      await router.push({ path: '/app/tasks', query: { task: taskFallback[1] } })
      return true
    }
    return false
  }

  return true
}
