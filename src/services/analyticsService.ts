import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { AnalyticsOverview, TrackStats, FunnelStage } from '../types/analytics'

export const analyticsService = {
  getOverview: async () => {
    const res = await api.get<ApiResponse<AnalyticsOverview>>('/api/analytics/overview')
    return res.data
  },
  getByTrack: async (cycleId?: string) => {
    const res = await api.get<ApiResponse<TrackStats[]>>('/api/analytics/by-track', { params: { cycleId } })
    return res.data
  },
  getFunnel: async (cycleId?: string) => {
    const res = await api.get<ApiResponse<FunnelStage[]>>('/api/analytics/funnel', { params: { cycleId } })
    return res.data
  },
}
