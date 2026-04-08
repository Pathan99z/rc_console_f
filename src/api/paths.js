/**
 * Central place for API path segments (relative to VITE_API_BASE_URL).
 * Adjust to match your backend routes when integrating.
 */
export const API_PATHS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    me: '/auth/me',
  },
  contact: {
    submit: '/contact',
  },
  dashboard: {
    overview: '/dashboard/overview',
  },
}
