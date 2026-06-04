import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { NotificationDto } from '../types/notification'

export const notificationService = {
  getMine: async () => {
    const res = await api.get<ApiResponse<NotificationDto[]>>('/api/notifications')
    return res.data
  },

  getCount: async () => {
    const res = await api.get<ApiResponse<{ unread: number }>>('/api/notifications/count')
    return res.data
  },

  markRead: async (id: string) => {
    const res = await api.patch<ApiResponse<unknown>>(`/api/notifications/${id}/read`)
    return res.data
  },

  markAllRead: async () => {
    const res = await api.patch<ApiResponse<unknown>>('/api/notifications/read-all')
    return res.data
  },
}
