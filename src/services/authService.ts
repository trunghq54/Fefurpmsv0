import api from '../lib/api'
import type { ApiResponse, LoginResponse, UserInfo } from '../types/auth'

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>('/api/auth/login', { email, password })
    return res.data
  },

  me: async () => {
    const res = await api.get<ApiResponse<UserInfo>>('/api/auth/me')
    return res.data
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmNewPassword: string) => {
    await api.post('/api/auth/change-password', { currentPassword, newPassword, confirmNewPassword })
  },
}
