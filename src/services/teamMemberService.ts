import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { TeamMemberResponse, CreateTeamMemberRequest } from '../types/budget'

export const teamMemberService = {
  getTeamMembers: async (proposalId: string) => {
    const res = await api.get<ApiResponse<TeamMemberResponse[]>>(`/api/proposals/${proposalId}/team-members`)
    return res.data
  },

  addTeamMember: async (proposalId: string, data: CreateTeamMemberRequest) => {
    const res = await api.post<ApiResponse<TeamMemberResponse>>(`/api/proposals/${proposalId}/team-members`, data)
    return res.data
  },
}
