import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { AmendmentDetailResponse, ReviewAmendmentRequest } from '../types/contract'

export const amendmentService = {
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<AmendmentDetailResponse>>(`/api/amendments/${id}`)
    return res.data
  },

  approve: async (id: string, data: ReviewAmendmentRequest) => {
    const res = await api.post<ApiResponse<AmendmentDetailResponse>>(`/api/amendments/${id}/approve`, data)
    return res.data
  },

  reject: async (id: string, data: ReviewAmendmentRequest) => {
    const res = await api.post<ApiResponse<AmendmentDetailResponse>>(`/api/amendments/${id}/reject`, data)
    return res.data
  },
}
