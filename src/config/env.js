/**
 * Typed access to Vite env. Only VITE_* keys are available on the client.
 */
function trimTrailingSlash(url) {
  if (!url || typeof url !== 'string') return ''
  return url.replace(/\/+$/, '')
}

export const env = {
  apiBaseUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? ''),
  apiTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 30000),
  /** Base URL for PRM invite accept screen (no trailing slash). Email links append `?token=`. */
  prmInviteAcceptUrl: trimTrailingSlash(import.meta.env.VITE_PRM_INVITE_ACCEPT_URL ?? ''),
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
