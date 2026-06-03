import api from '../lib/api'
import type { UserDto, CreateUserRequest, UpdateUserRequest } from '../types/user'
import type { ApiResponse } from '../types/auth'

export const userService = {
  getAll: async (params?: { search?: string; accountType?: number; isActive?: boolean }) => {
    const res = await api.get<ApiResponse<UserDto[]>>('/api/users', { params })
    return res.data
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<UserDto>>(`/api/users/${id}`)
    return res.data
  },

  create: async (data: CreateUserRequest) => {
    const res = await api.post<ApiResponse<UserDto>>('/api/users', data)
    return res.data
  },

  update: async (id: string, data: UpdateUserRequest) => {
    const res = await api.put<ApiResponse<UserDto>>(`/api/users/${id}`, data)
    return res.data
  },

  toggleActive: async (id: string) => {
    const res = await api.patch<ApiResponse<UserDto>>(`/api/users/${id}/toggle-active`)
    return res.data
  },

  resetPassword: async (id: string) => {
    await api.post(`/api/users/${id}/reset-password`)
  },
}
