import api from '../lib/api'
import type { ApiResponse } from '../types/auth'

export interface SystemClockDto {
  offsetDays: number
  effectiveNow: string
  realNow: string
}

export const systemClockService = {
  get: async () => {
    const res = await api.get<ApiResponse<SystemClockDto>>('/api/admin/system-clock')
    return res.data
  },

  set: async (offsetDays: number) => {
    const res = await api.post<ApiResponse<SystemClockDto>>('/api/admin/system-clock', { offsetDays })
    return res.data
  },

  runDeadlineScan: async () => {
    const res = await api.post<ApiResponse<null>>('/api/admin/run-deadline-scan')
    return res.data
  },
}
