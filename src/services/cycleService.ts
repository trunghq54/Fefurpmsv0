import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { CycleDto, TrackDto, CreateCycleRequest, CreateTrackRequest } from '../types/cycle'

export const cycleService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<CycleDto[]>>('/api/cycles')
    return res.data
  },

  getActive: async () => {
    const res = await api.get<ApiResponse<CycleDto>>('/api/cycles/active')
    return res.data
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<CycleDto>>(`/api/cycles/${id}`)
    return res.data
  },

  create: async (data: CreateCycleRequest) => {
    const res = await api.post<ApiResponse<CycleDto>>('/api/cycles', data)
    return res.data
  },

  update: async (id: string, data: CreateCycleRequest) => {
    const res = await api.put<ApiResponse<CycleDto>>(`/api/cycles/${id}`, data)
    return res.data
  },

  toggleStatus: async (id: string) => {
    const res = await api.patch<ApiResponse<CycleDto>>(`/api/cycles/${id}/toggle-status`)
    return res.data
  },

  // Tracks
  getTracks: async (cycleId: string) => {
    const res = await api.get<ApiResponse<TrackDto[]>>(`/api/cycles/${cycleId}/tracks`)
    return res.data
  },

  createTrack: async (cycleId: string, data: CreateTrackRequest) => {
    const res = await api.post<ApiResponse<TrackDto>>(`/api/cycles/${cycleId}/tracks`, data)
    return res.data
  },

  updateTrack: async (cycleId: string, trackId: string, data: CreateTrackRequest) => {
    const res = await api.put<ApiResponse<TrackDto>>(`/api/cycles/${cycleId}/tracks/${trackId}`, data)
    return res.data
  },

  assignOwner: async (cycleId: string, trackId: string, ownerId: string | null) => {
    const res = await api.patch<ApiResponse<TrackDto>>(`/api/cycles/${cycleId}/tracks/${trackId}/assign-owner`, { ownerId })
    return res.data
  },

  deactivateTrack: async (cycleId: string, trackId: string) => {
    await api.delete(`/api/cycles/${cycleId}/tracks/${trackId}`)
  },
}
