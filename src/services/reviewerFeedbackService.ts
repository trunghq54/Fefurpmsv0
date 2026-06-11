import api from '../lib/api'
import type { ApiResponse } from '../types/auth'

export interface ReviewerFeedbackDto {
  id: number
  councilId: string
  reviewerMemberId: string
  reviewerName?: string
  urgencyScore?: number
  scientificContributionScore?: number
  practicalSignificanceScore?: number
  actualVsExpectedScore?: number
  otherComments?: string
  overallAssessment?: string
  submittedAt?: string
}

export interface SubmitReviewerFeedbackRequest {
  urgencyScore?: number
  scientificContributionScore?: number
  practicalSignificanceScore?: number
  actualVsExpectedScore?: number
  otherComments?: string
  overallAssessment?: string
}

export const reviewerFeedbackService = {
  getByCouncil: async (councilId: string) => {
    const res = await api.get<ApiResponse<ReviewerFeedbackDto[]>>(`/api/councils/${councilId}/feedback`)
    return res.data
  },

  submit: async (councilId: string, data: SubmitReviewerFeedbackRequest) => {
    const res = await api.post<ApiResponse<ReviewerFeedbackDto>>(`/api/councils/${councilId}/feedback`, data)
    return res.data
  },
}
