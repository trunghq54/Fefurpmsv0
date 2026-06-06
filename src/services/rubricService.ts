import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { RubricCriterionDto } from '../types/review'

export interface SaveRubricCriterionRequest {
  roundType: number // 1=ProposalReview, 2=ProgressCheck, 3=Acceptance
  orderIndex: number
  name: string
  maxScore: number
  isActive: boolean
}

export const rubricService = {
  // roundType optional: bỏ trống = lấy tất cả (cho trang cấu hình)
  getCriteria: async (roundType?: string) => {
    const res = await api.get<ApiResponse<RubricCriterionDto[]>>('/api/rubric-criteria', {
      params: roundType ? { roundType } : undefined,
    })
    return res.data
  },
  create: async (data: SaveRubricCriterionRequest) => {
    const res = await api.post<ApiResponse<RubricCriterionDto>>('/api/rubric-criteria', data)
    return res.data
  },
  update: async (id: string, data: SaveRubricCriterionRequest) => {
    const res = await api.put<ApiResponse<RubricCriterionDto>>(`/api/rubric-criteria/${id}`, data)
    return res.data
  },
  remove: async (id: string) => {
    await api.delete(`/api/rubric-criteria/${id}`)
  },
}
