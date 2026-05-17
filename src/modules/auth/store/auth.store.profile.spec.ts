import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/modules/auth/store/auth.store'

vi.mock('@/modules/auth/services/auth.api', () => ({
  authApi: {
    me: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    logout: vi.fn(),
    navigation: vi.fn(),
  },
}))

vi.mock('@/modules/auth/store/navigation.store', () => ({
  useNavigationStore: () => ({
    fetchNavigation: vi.fn(),
    reset: vi.fn(),
    flatVisibleMenus: [],
  }),
}))

import { authApi } from '@/modules/auth/services/auth.api'

describe('auth store profile actions', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
    setActivePinia(createPinia())
    vi.mocked(authApi.updateProfile).mockReset()
    vi.mocked(authApi.changePassword).mockReset()
  })

  it('updates profile and user state', async () => {
    vi.mocked(authApi.updateProfile).mockResolvedValue({
      data: {
        success: true,
        message: 'Profile updated.',
        data: {
          user: {
            id: 1,
            tenant_id: 1,
            role: 'company_admin',
            name: 'Updated Name',
            email: 'test@example.com',
            email_verified_at: null,
            created_at: '',
          },
        },
      },
    } as never)

    const store = useAuthStore()
    await store.updateProfile({ name: 'Updated Name' })

    expect(store.user?.name).toBe('Updated Name')
  })

  it('maps change password 429 message', async () => {
    vi.mocked(authApi.changePassword).mockRejectedValue({
      response: { status: 429, data: { message: 'Too many attempts' } },
      isAxiosError: true,
    })

    const store = useAuthStore()
    await expect(
      store.changePassword({
        current_password: 'old',
        password: 'newpassword1',
        password_confirmation: 'newpassword1',
      }),
    ).rejects.toBeTruthy()

    expect(store.apiMessage).toContain('Too many attempts')
  })
})
