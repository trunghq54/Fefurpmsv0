import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type {
  CycleDto,
  TrackDto,
  CreateCycleRequest,
  CreateTrackRequest,
  ResearchTypeOption,
  CreateResearchTypeRequest,
  UpdateResearchTypeRequest,
} from '../types/cycle'

interface UpdateTrackRequest {
  name?: string
  description?: string
}
interface AssignOwnerRequest {
  ownerId: string | null
}

export const cycleService = {
  getResearchTypes: async (includeInactive = false) => {
    const url = `/api/cycles/research-types${includeInactive ? '?includeInactive=true' : ''}`
    const res = await api.get<ApiResponse<ResearchTypeOption[]>>(url)
    return res.data
  },

  createResearchType: async (data: CreateResearchTypeRequest) => {
    const res = await api.post<ApiResponse<ResearchTypeOption>>('/api/cycles/research-types', data)
    return res.data
  },

  updateResearchType: async (id: number, data: UpdateResearchTypeRequest) => {
    const res = await api.put<ApiResponse<ResearchTypeOption>>(`/api/cycles/research-types/${id}`, data)
    return res.data
  },

  deactivateResearchType: async (id: number) => {
    const res = await api.patch<ApiResponse<ResearchTypeOption>>(`/api/cycles/research-types/${id}/deactivate`)
    return res.data
  },

  reactivateResearchType: async (id: number) => {
    const res = await api.patch<ApiResponse<ResearchTypeOption>>(`/api/cycles/research-types/${id}/reactivate`)
    return res.data
  },

  deleteResearchType: async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/api/cycles/research-types/${id}`)
    return res.data
  },

  getAll: async () => {
    const res = await api.get<ApiResponse<CycleDto[]>>('/api/cycles')
    return res.data
  },

  getActive: async () => {
    const res = await api.get<ApiResponse<CycleDto[]>>('/api/cycles')
    const open = res.data.data?.find((c) => c.status === 'Open' || c.status === 'OPEN') ?? null
    // Cycle DTO không kèm tracks → nạp danh sách track từ endpoint riêng để form có lựa chọn.
    if (open && (!open.tracks || open.tracks.length === 0)) {
      try {
        const tr = await api.get<ApiResponse<TrackDto[]>>('/api/cycles/tracks')
        if (tr.data.success && tr.data.data) open.tracks = tr.data.data
      } catch {
        /* để trống nếu lỗi */
      }
    }
    return { ...res.data, data: open }
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

  getTracks: async (_cycleId?: string) => {
    const res = await api.get<ApiResponse<TrackDto[]>>('/api/cycles/tracks')
    return res.data
  },

  createTrack: async (_cycleIdOrData: string | CreateTrackRequest, data?: CreateTrackRequest) => {
    const body = data ?? (_cycleIdOrData as CreateTrackRequest)
    const res = await api.post<ApiResponse<TrackDto>>('/api/cycles/tracks', body)
    return res.data
  },

  updateTrack: async (_cycleId: string, id: string, data: UpdateTrackRequest) => {
    const res = await api.put<ApiResponse<TrackDto>>(`/api/cycles/tracks/${id}`, data)
    return res.data
  },

  assignOwner: async (_cycleId: string, trackId: string, userId: string | null) => {
    const body: AssignOwnerRequest = { ownerId: userId }
    const res = await api.patch<ApiResponse<TrackDto>>(`/api/cycles/tracks/${trackId}/owner`, body)
    return res.data
  },

  deactivateTrack: async (_cycleId: string, id: string) => {
    const res = await api.patch<ApiResponse<TrackDto>>(`/api/cycles/tracks/${id}/deactivate`)
    return res.data
  },
}
