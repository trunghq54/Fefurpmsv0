import api from '../lib/api'
import type { ApiResponse } from '../types/auth'

export interface SettlementDto {
  id: number
  contractId: string
  totalContractedAmount: number
  totalDisbursedAmount: number
  totalReturnedAmount: number
  productsSubmittedSummary?: string
  accountingClearedAt?: string
  assetsClearedAt?: string
  settlementSignedAt?: string
  sideASigneeId?: string
  sideASigneeName?: string
  settlementDeadline?: string
  notes?: string
  createdAt: string
}

export interface CreateSettlementRequest {
  totalContractedAmount: number
  totalDisbursedAmount: number
  totalReturnedAmount: number
  productsSubmittedSummary?: string
  settlementDeadline?: string
  notes?: string
}

export interface SignSettlementRequest {
  sideASigneeId: string
}

export interface MarkClearedRequest {
  clearedDate: string
}

export const settlementService = {
  getByContract: async (contractId: string) => {
    const res = await api.get<ApiResponse<SettlementDto | null>>(`/api/contracts/${contractId}/settlement`)
    return res.data
  },

  create: async (contractId: string, data: CreateSettlementRequest) => {
    const res = await api.post<ApiResponse<SettlementDto>>(`/api/contracts/${contractId}/settlement`, data)
    return res.data
  },

  sign: async (id: number, data: SignSettlementRequest) => {
    const res = await api.post<ApiResponse<SettlementDto>>(`/api/settlements/${id}/sign`, data)
    return res.data
  },

  markAccountingCleared: async (id: number, data: MarkClearedRequest) => {
    const res = await api.post<ApiResponse<SettlementDto>>(`/api/settlements/${id}/accounting-cleared`, data)
    return res.data
  },

  markAssetsCleared: async (id: number, data: MarkClearedRequest) => {
    const res = await api.post<ApiResponse<SettlementDto>>(`/api/settlements/${id}/assets-cleared`, data)
    return res.data
  },
}
