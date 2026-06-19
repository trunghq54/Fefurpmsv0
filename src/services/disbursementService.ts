import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { DisbursementResponse, ConfirmDisbursementRequest } from '../types/contract'

export const disbursementService = {
  confirm: async (id: number, data: ConfirmDisbursementRequest) => {
    const res = await api.post<ApiResponse<DisbursementResponse>>(`/api/disbursements/${id}/confirm`, data)
    return res.data
  },
}
