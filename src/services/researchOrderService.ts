import api from '../lib/api'
import type { ApiResponse } from '../types/auth'

export interface ResearchOrderDto {
  id: number
  cycleId: number
  orderingUnitId: number
  orderingUnitName?: string
  researchArea: string
  problemDescription: string
  expectedProducts?: string
  status: string
  matchedProposalId?: string
  registeredCount?: number // số PI đã đăng ký (cạnh tranh)
  createdBy: string
  createdAt: string
}

export interface CreateResearchOrderRequest {
  cycleId: number
  orderingUnitId: number
  researchArea: string
  problemDescription: string
  expectedProducts?: string
}

export interface ResearchOrderQuery {
  cycleId?: number
  status?: string
}

export const researchOrderService = {
  getAll: async (params?: ResearchOrderQuery) => {
    const res = await api.get<ApiResponse<ResearchOrderDto[]>>('/api/research-orders', { params })
    return res.data
  },

  getById: async (id: number) => {
    const res = await api.get<ApiResponse<ResearchOrderDto>>(`/api/research-orders/${id}`)
    return res.data
  },

  create: async (data: CreateResearchOrderRequest) => {
    const res = await api.post<ApiResponse<ResearchOrderDto>>('/api/research-orders', data)
    return res.data
  },

  matchProposal: async (id: number, proposalId: string) => {
    const res = await api.post<ApiResponse<void>>(`/api/research-orders/${id}/match`, { proposalId })
    return res.data
  },
}
