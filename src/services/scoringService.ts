import api from '../lib/api'
import type { ApiResponse } from '../types/auth'

export interface RubricCriterionDto {
  id: number
  criterionName: string
  maxScore: number
  sequence: number
}

export interface RubricTemplateDto {
  id: number
  templateType: string
  name: string
  maxTotalScore: number
  isActive: boolean
  criteria: RubricCriterionDto[]
}

export interface ScoreDetailRequest {
  criterionId: number
  givenScore: number
  comments?: string
}

export interface SubmitScoreRequest {
  templateId: number
  generalComments?: string
  otherRecommendations?: string
  scoreDetails: ScoreDetailRequest[]
}

export interface ReviewScoreDetailDto {
  id: number
  criterionId: number
  criterionName: string
  maxScore: number
  givenScore: number
  comments?: string
}

export interface ReviewScoreDto {
  id: number
  councilId: string
  evaluatorMemberId: string
  evaluatorName: string
  templateId: number
  totalScore: number
  maxPossibleScore: number
  isValidBallot: boolean
  generalComments?: string
  otherRecommendations?: string
  submittedAt?: string
  scoreDetails: ReviewScoreDetailDto[]
}

export interface FinalizeDecisionRequest {
  result: 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED'
  councilComments?: string
  recommendations?: string
  chairUserId?: string
  secretaryUserId?: string
}

export interface CouncilDecisionDto {
  id: number
  councilId: string
  totalMembers: number
  attendingMembers: number
  validBallots: number
  invalidBallots: number
  averageScore?: number
  result: string
  councilComments?: string
  recommendations?: string
  finalizedAt?: string
}

export const scoringService = {
  getRubricTemplates: async () => {
    const res = await api.get<ApiResponse<RubricTemplateDto[]>>('/api/review-scoring/rubrics')
    return res.data
  },

  getRubricTemplate: async (id: number) => {
    const res = await api.get<ApiResponse<RubricTemplateDto>>(`/api/review-scoring/rubrics/${id}`)
    return res.data
  },

  submitScore: async (councilId: string, data: SubmitScoreRequest) => {
    const res = await api.post<ApiResponse<ReviewScoreDto>>(`/api/review-scoring/councils/${councilId}/scores`, data)
    return res.data
  },

  getMyScore: async (councilId: string) => {
    const res = await api.get<ApiResponse<ReviewScoreDto | null>>(`/api/review-scoring/councils/${councilId}/scores/my`)
    return res.data
  },

  getCouncilScores: async (councilId: string) => {
    const res = await api.get<ApiResponse<ReviewScoreDto[]>>(`/api/review-scoring/councils/${councilId}/scores`)
    return res.data
  },

  finalizeDecision: async (councilId: string, data: FinalizeDecisionRequest) => {
    const res = await api.post<ApiResponse<CouncilDecisionDto>>(`/api/review-scoring/councils/${councilId}/decision`, data)
    return res.data
  },

  getDecision: async (councilId: string) => {
    const res = await api.get<ApiResponse<CouncilDecisionDto | null>>(`/api/review-scoring/councils/${councilId}/decision`)
    return res.data
  },
}
