import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { RubricScoreDto, AcceptanceVoteDto, ReviewRoundDto, RoundResultsDto } from '../types/review'

export interface SubmitRubricRequest {
  criterion1: number
  criterion2: number
  criterion3: number
  criterion4: number
  criterion5: number
  comments?: string
}

export interface SubmitVoteRequest {
  vote: number
  writtenReview?: string
  necessityScore?: number
  contributionScore?: number
  practicalScore?: number
  resultScore?: number
}

export const scoringService = {
  getRubric: async (assignmentId: string) => {
    const res = await api.get<ApiResponse<RubricScoreDto | null>>(`/api/assignments/${assignmentId}/rubric-score`)
    return res.data
  },
  submitRubric: async (assignmentId: string, data: SubmitRubricRequest) => {
    const res = await api.post<ApiResponse<RubricScoreDto>>(`/api/assignments/${assignmentId}/rubric-score`, data)
    return res.data
  },
  getVote: async (assignmentId: string) => {
    const res = await api.get<ApiResponse<AcceptanceVoteDto | null>>(`/api/assignments/${assignmentId}/acceptance-vote`)
    return res.data
  },
  submitVote: async (assignmentId: string, data: SubmitVoteRequest) => {
    const res = await api.post<ApiResponse<AcceptanceVoteDto>>(`/api/assignments/${assignmentId}/acceptance-vote`, data)
    return res.data
  },
  finalize: async (roundId: string, data: { outcome: string; notes?: string }) => {
    const res = await api.post<ApiResponse<ReviewRoundDto>>(`/api/rounds/${roundId}/finalize`, data)
    return res.data
  },
  getResults: async (roundId: string) => {
    const res = await api.get<ApiResponse<RoundResultsDto>>(`/api/rounds/${roundId}/results`)
    return res.data
  },
}
