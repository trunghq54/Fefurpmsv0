import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { MeetingDto, CreateMeetingRequest } from '../types/meeting'

export const meetingService = {
  getByCouncil: async (councilId: string) => {
    const res = await api.get<ApiResponse<MeetingDto[]>>(`/api/councils/${councilId}/meetings`)
    return res.data
  },

  schedule: async (councilId: string, data: CreateMeetingRequest) => {
    const res = await api.post<ApiResponse<MeetingDto>>(`/api/councils/${councilId}/meetings`, data)
    return res.data
  },

  start: async (meetingId: string) => {
    const res = await api.post<ApiResponse<MeetingDto>>(`/api/meetings/${meetingId}/start`)
    return res.data
  },

  end: async (meetingId: string) => {
    const res = await api.post<ApiResponse<MeetingDto>>(`/api/meetings/${meetingId}/end`)
    return res.data
  },
}
