import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type {
  ContractListResponse,
  ContractDetailResponse,
  CreateContractRequest,
  DisbursementResponse,
  DeliverableResponse,
  AmendmentListResponse,
  AmendmentDetailResponse,
  CreateAmendmentRequest,
} from '../types/contract'

export const contractService = {
  getContracts: async () => {
    const res = await api.get<ApiResponse<ContractListResponse[]>>('/api/contracts')
    return res.data
  },

  getContract: async (id: string) => {
    const res = await api.get<ApiResponse<ContractDetailResponse>>(`/api/contracts/${id}`)
    return res.data
  },

  createContract: async (data: CreateContractRequest) => {
    const res = await api.post<ApiResponse<ContractDetailResponse>>('/api/contracts', data)
    return res.data
  },

  signContract: async (id: string) => {
    const res = await api.post<ApiResponse<ContractDetailResponse>>(`/api/contracts/${id}/sign`)
    return res.data
  },

  getDisbursements: async (contractId: string) => {
    const res = await api.get<ApiResponse<DisbursementResponse[]>>(`/api/contracts/${contractId}/disbursements`)
    return res.data
  },

  generateDisbursements: async (contractId: string) => {
    const res = await api.post<ApiResponse<DisbursementResponse[]>>(
      `/api/contracts/${contractId}/disbursements/generate`,
    )
    return res.data
  },

  getDeliverables: async (contractId: string) => {
    const res = await api.get<ApiResponse<DeliverableResponse[]>>(`/api/contracts/${contractId}/deliverables`)
    return res.data
  },

  getAmendments: async (contractId: string) => {
    const res = await api.get<ApiResponse<AmendmentListResponse[]>>(`/api/contracts/${contractId}/amendments`)
    return res.data
  },

  createAmendment: async (contractId: string, data: CreateAmendmentRequest) => {
    const res = await api.post<ApiResponse<AmendmentDetailResponse>>(`/api/contracts/${contractId}/amendments`, data)
    return res.data
  },
}
