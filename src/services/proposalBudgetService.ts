import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type {
  BudgetResponse,
  UpdateBudgetRequest,
  LaborDetailResponse,
  UpdateLaborDetailRequest,
} from '../types/budget'

export const proposalBudgetService = {
  getBudget: async (proposalId: string) => {
    const res = await api.get<ApiResponse<BudgetResponse>>(`/api/proposals/${proposalId}/budget`)
    return res.data
  },

  updateBudget: async (proposalId: string, data: UpdateBudgetRequest) => {
    const res = await api.put<ApiResponse<BudgetResponse>>(`/api/proposals/${proposalId}/budget`, data)
    return res.data
  },

  getLaborDetails: async (proposalId: string) => {
    const res = await api.get<ApiResponse<LaborDetailResponse[]>>(`/api/proposals/${proposalId}/budget/labor`)
    return res.data
  },

  updateLaborDetail: async (proposalId: string, detailId: number, data: UpdateLaborDetailRequest) => {
    const res = await api.put<ApiResponse<LaborDetailResponse>>(
      `/api/proposals/${proposalId}/budget/labor/${detailId}`,
      data
    )
    return res.data
  },
}
