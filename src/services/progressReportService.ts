import api from '../lib/api'
import type { ApiResponse } from '../types/auth'

export interface ProgressReportItemDto {
  id: number
  activityId: number
  activityName: string
  completionRate: number
  completionStatus: string
  evidenceDescription?: string
  notes?: string
}

export interface ProgressReportSummaryDto {
  id: string
  contractId: string
  reportRound: number
  reportingPeriodStart: string
  reportingPeriodEnd: string
  overallCompletionPct: number
  expenditureToDate: number
  status: string
  submittedAt?: string
  createdAt: string
}

export interface ProgressReportDto extends ProgressReportSummaryDto {
  completedContent: string
  pendingContent?: string
  nextPeriodPlan?: string
  piRecommendations?: string
  evaluationResult?: string
  evaluationComments?: string
  evaluatedAt?: string
  items: ProgressReportItemDto[]
}

export interface CreateProgressReportItemRequest {
  activityId: number
  completionRate: number
  completionStatus: string
  evidenceDescription?: string
  notes?: string
}

export interface CreateProgressReportRequest {
  reportingPeriodStart: string
  reportingPeriodEnd: string
  completedContent: string
  pendingContent?: string
  overallCompletionPct: number
  expenditureToDate: number
  nextPeriodPlan?: string
  piRecommendations?: string
  items: CreateProgressReportItemRequest[]
}

export interface EvaluateProgressReportRequest {
  evaluationResult: 'SATISFACTORY' | 'UNSATISFACTORY' | 'NEEDS_IMPROVEMENT'
  evaluationComments?: string
}

export const progressReportService = {
  getByContract: async (contractId: string) => {
    const res = await api.get<ApiResponse<ProgressReportSummaryDto[]>>('/api/progress-reports', {
      params: { contractId },
    })
    return res.data
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<ProgressReportDto>>(`/api/progress-reports/${id}`)
    return res.data
  },

  create: async (contractId: string, data: CreateProgressReportRequest) => {
    const res = await api.post<ApiResponse<ProgressReportDto>>('/api/progress-reports', data, {
      params: { contractId },
    })
    return res.data
  },

  submit: async (id: string) => {
    const res = await api.post<ApiResponse<ProgressReportDto>>(`/api/progress-reports/${id}/submit`)
    return res.data
  },

  evaluate: async (id: string, data: EvaluateProgressReportRequest) => {
    const res = await api.post<ApiResponse<ProgressReportDto>>(`/api/progress-reports/${id}/evaluate`, data)
    return res.data
  },
}
