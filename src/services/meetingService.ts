import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { MeetingDto, CreateMeetingRequest } from '../types/meeting'

export const meetingService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<MeetingDto[]>>(`/api/meetings`)
    return res.data
  },
  getByRound: async (roundId: string) => {
    const res = await api.get<ApiResponse<MeetingDto[]>>(`/api/rounds/${roundId}/meetings`)
    return res.data
  },
  create: async (roundId: string, data: CreateMeetingRequest) => {
    const res = await api.post<ApiResponse<MeetingDto>>(`/api/rounds/${roundId}/meetings`, data)
    return res.data
  },
  update: async (meetingId: string, data: CreateMeetingRequest) => {
    const res = await api.put<ApiResponse<MeetingDto>>(`/api/meetings/${meetingId}`, data)
    return res.data
  },
}
