import { apiClient } from '@/core/http/apiClient'
import type {
  ApiEnvelope,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from '@/modules/auth/types/auth.types'

type RegisterResponse = ApiEnvelope<{ user: User }>
type LoginResponse = ApiEnvelope<{ token: string; user: User }>
type BasicResponse = ApiEnvelope<Record<string, never>>
type UserResponse = ApiEnvelope<{ user: User }>

export const authApi = {
  register(payload: RegisterPayload) {
    return apiClient.post<RegisterResponse>('/register', payload)
  },
  verifyEmail(verificationPathWithQuery: string) {
    return apiClient.get<UserResponse>(verificationPathWithQuery)
  },
  login(payload: LoginPayload) {
    return apiClient.post<LoginResponse>('/login', payload)
  },
  resendVerification() {
    return apiClient.post<BasicResponse>('/email/verification-notification')
  },
  forgotPassword(payload: ForgotPasswordPayload) {
    return apiClient.post<BasicResponse>('/forgot-password', payload)
  },
  resetPassword(payload: ResetPasswordPayload) {
    return apiClient.post<BasicResponse>('/reset-password', payload)
  },
  me() {
    return apiClient.get<UserResponse>('/user')
  },
  logout() {
    return apiClient.post<BasicResponse>('/logout')
  },
}
