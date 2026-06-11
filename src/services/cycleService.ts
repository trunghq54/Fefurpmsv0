import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { CycleDto, TrackDto, CreateCycleRequest, CreateTrackRequest } from '../types/cycle'

export const cycleService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<CycleDto[]>>('/api/cycles')
    return res.data
  },

  // Returns first OPEN cycle from the list (no dedicated BE endpoint for "active")
  getActive: async () => {
    const res = await api.get<ApiResponse<CycleDto[]>>('/api/cycles')
    const open = res.data.data?.find(c => c.status === 'Open' || c.status === 'OPEN')
    return { ...res.data, data: open ?? null }
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

  open: async (id: string) => {
    const res = await api.post<ApiResponse<CycleDto>>(`/api/cycles/${id}/open`)
    return res.data
  },

  close: async (id: string) => {
    const res = await api.post<ApiResponse<CycleDto>>(`/api/cycles/${id}/close`)
    return res.data
  },

  // Tracks — global, not per-cycle
  getTracks: async () => {
    const res = await api.get<ApiResponse<TrackDto[]>>('/api/cycles/tracks')
    return res.data
  },

  createTrack: async (data: CreateTrackRequest) => {
    const res = await api.post<ApiResponse<TrackDto>>('/api/cycles/tracks', data)
    return res.data
  },
}
