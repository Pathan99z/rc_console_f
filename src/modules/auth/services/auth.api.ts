import { apiClient } from '@/core/http/apiClient'
import type {
  ApiEnvelope,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  NavigationState,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  User,
} from '@/modules/auth/types/auth.types'

type RegisterResponse = ApiEnvelope<{ user: User }>
type LoginResponse = ApiEnvelope<{ token: string; user: User }>
type BasicResponse = ApiEnvelope<Record<string, never>>
type UserResponse = ApiEnvelope<{ user: User }>
type NavigationResponse = ApiEnvelope<NavigationState>

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
  updateProfile(payload: UpdateProfilePayload) {
    return apiClient.patch<UserResponse>('/user/profile', payload)
  },
  changePassword(payload: ChangePasswordPayload) {
    return apiClient.patch<BasicResponse>('/user/password', payload)
  },
  navigation() {
    return apiClient.get<NavigationResponse>('/navigation')
  },
  logout() {
    return apiClient.post<BasicResponse>('/logout')
  },
}
