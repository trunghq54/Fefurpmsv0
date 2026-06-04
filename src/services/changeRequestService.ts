import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { ChangeRequestDto, CreateChangeRequestRequest } from '../types/changeRequest'

export const changeRequestService = {
  create: async (proposalId: string, data: CreateChangeRequestRequest) => {
    const res = await api.post<ApiResponse<ChangeRequestDto>>(`/api/proposals/${proposalId}/change-requests`, data)
    return res.data
  },
  getByProposal: async (proposalId: string) => {
    const res = await api.get<ApiResponse<ChangeRequestDto[]>>(`/api/proposals/${proposalId}/change-requests`)
    return res.data
  },
  getPending: async () => {
    const res = await api.get<ApiResponse<ChangeRequestDto[]>>('/api/change-requests/pending')
    return res.data
  },
  review: async (id: string, data: { approved: boolean; adminNote?: string }) => {
    const res = await api.patch<ApiResponse<ChangeRequestDto>>(`/api/change-requests/${id}/review`, data)
    return res.data
  },
}
