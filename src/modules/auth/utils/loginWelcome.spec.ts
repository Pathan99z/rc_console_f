import { describe, expect, it, beforeEach } from 'vitest'
import { useToast } from '@/shared/utils/useToast'
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

  it('shows welcome toast when showing pending welcome', () => {
    const toast = useToast()
    queueLoginWelcome('Naceer Khanz')
    tryShowPendingLoginWelcome()
    expect(toast.items.value.at(-1)).toMatchObject({
      type: 'success',
      message: 'Login Successful! Welcome back Naceer! 👋',
    })
  })
})
