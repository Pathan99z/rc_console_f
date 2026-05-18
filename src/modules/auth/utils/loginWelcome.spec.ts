import { describe, expect, it, beforeEach } from 'vitest'
import {
  buildLoginWelcomeMessage,
  consumeLoginWelcome,
  queueLoginWelcome,
  tryShowPendingLoginWelcome,
} from '@/modules/auth/utils/loginWelcome'

describe('loginWelcome', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('queues and consumes first name', () => {
    queueLoginWelcome('Naceer Khanz')
    expect(consumeLoginWelcome()).toBe('Naceer')
    expect(consumeLoginWelcome()).toBeNull()
  })

  it('builds welcome message', () => {
    expect(buildLoginWelcomeMessage('Naceer')).toBe('Login Successful! Welcome back Naceer! 👋')
  })

  it('dispatches toast event when showing pending welcome', () => {
    const events: CustomEvent[] = []
    const handler = (e: Event) => events.push(e as CustomEvent)
    globalThis.addEventListener('rc:toast', handler)
    queueLoginWelcome('Naceer Khanz')
    tryShowPendingLoginWelcome()
    globalThis.removeEventListener('rc:toast', handler)
    expect(events[0]?.detail).toMatchObject({
      type: 'success',
      message: 'Login Successful! Welcome back Naceer! 👋',
    })
  })
})
