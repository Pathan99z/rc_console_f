const LOGIN_WELCOME_KEY = 'rc_login_welcome'

export function queueLoginWelcome(userName?: string | null) {
  const trimmed = (userName || '').trim()
  const firstName = trimmed.split(/\s+/)[0] || 'there'
  sessionStorage.setItem(LOGIN_WELCOME_KEY, firstName)
}

export function consumeLoginWelcome(): string | null {
  const name = sessionStorage.getItem(LOGIN_WELCOME_KEY)
  if (!name) return null
  sessionStorage.removeItem(LOGIN_WELCOME_KEY)
  return name
}

export function buildLoginWelcomeMessage(firstName: string): string {
  return `Login Successful! Welcome back ${firstName}! 👋`
}

export function showLoginWelcomeToast(firstName: string) {
  const message = buildLoginWelcomeMessage(firstName)
  globalThis.dispatchEvent(
    new CustomEvent('rc:toast', {
      detail: { type: 'success', message, duration: 5500 },
    }),
  )
}

/** Call after navigating into /app — shows welcome toast once per login. */
export function tryShowPendingLoginWelcome() {
  const name = consumeLoginWelcome()
  if (!name) return
  showLoginWelcomeToast(name)
}
