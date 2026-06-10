import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { ReviewRoundDto, ReviewAssignmentDto, MyAssignmentDto } from '../types/review'

export const roundService = {
  getMyAssignments: async () => {
    const res = await api.get<ApiResponse<MyAssignmentDto[]>>('/api/assignments/my')
    return res.data
  },

  getRounds: async (proposalId: string) => {
    const res = await api.get<ApiResponse<ReviewRoundDto[]>>(`/api/proposals/${proposalId}/rounds`)
    return res.data
  },

  createRound: async (proposalId: string, data: { roundType: number; roundNumber: number }) => {
    const res = await api.post<ApiResponse<ReviewRoundDto>>(`/api/proposals/${proposalId}/rounds`, data)
    return res.data
  },

  getAssignments: async (roundId: string) => {
    const res = await api.get<ApiResponse<ReviewAssignmentDto[]>>(`/api/rounds/${roundId}/assignments`)
    return res.data
  },

  assign: async (roundId: string, data: { reviewerId: string; role: number }) => {
    const res = await api.post<ApiResponse<ReviewAssignmentDto>>(`/api/rounds/${roundId}/assignments`, data)
    return res.data
  },

  removeAssignment: async (roundId: string, assignmentId: string) => {
    await api.delete(`/api/rounds/${roundId}/assignments/${assignmentId}`)
  },

  respond: async (assignmentId: string, accept: boolean) => {
    const res = await api.patch<ApiResponse<ReviewAssignmentDto>>(`/api/assignments/${assignmentId}/respond`, { accept })
    return res.data
  },

  openRound: async (roundId: string) => {
    const res = await api.post<ApiResponse<ReviewRoundDto>>(`/api/rounds/${roundId}/open`)
    return res.data
  },

  closeRound: async (roundId: string, result: string) => {
    const res = await api.post<ApiResponse<ReviewRoundDto>>(`/api/rounds/${roundId}/close`, { result })
    return res.data
  },
}
