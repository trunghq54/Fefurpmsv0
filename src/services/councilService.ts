import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type {
  CouncilResponse,
  CouncilMemberResponse,
  CreateCouncilRequest,
  AddCouncilMemberRequest,
} from '../types/council'

export const councilService = {
  createCouncil: async (data: CreateCouncilRequest) => {
    const res = await api.post<ApiResponse<CouncilResponse>>('/api/councils', data)
    return res.data
  },

  addMember: async (councilId: string, data: AddCouncilMemberRequest) => {
    const res = await api.post<ApiResponse<CouncilMemberResponse>>(`/api/councils/${councilId}/members`, data)
    return res.data
  },
}
