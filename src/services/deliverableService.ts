import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type {
  DeliverableResponse,
  SubmitDeliverableRequest,
  EvaluateDeliverableRequest,
} from '../types/contract'

export const deliverableService = {
  submit: async (id: number, data: SubmitDeliverableRequest) => {
    const res = await api.post<ApiResponse<DeliverableResponse>>(
      `/api/deliverables/${id}/submit`,
      data
    )
    return res.data
  },

  evaluate: async (id: number, data: EvaluateDeliverableRequest) => {
    const res = await api.post<ApiResponse<DeliverableResponse>>(
      `/api/deliverables/${id}/evaluate`,
      data
    )
    return res.data
  },
}
