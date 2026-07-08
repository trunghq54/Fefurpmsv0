import api from '../lib/api'
import type { ApiResponse } from '../types/auth'

export interface FinalReportDto {
  id: string
  projectId: string
  status: string
  reportFileUrl?: string
  summaryFileUrl?: string
  language: string
  deadline?: string
  submittedAt?: string
  revisionNotes?: string
  revisionRequestedAt?: string
  finalSubmittedAt?: string
  archivalDeadline?: string
  archivedAt?: string
}

export interface SubmitFinalReportRequest {
  reportFileUrl: string
  summaryFileUrl?: string
  language: string
}

export interface RequestRevisionRequest {
  revisionNotes: string
}

export const finalReportService = {
  getByContract: async (contractId: string) => {
    const res = await api.get<ApiResponse<FinalReportDto | null>>(`/api/final-reports/${contractId}`)
    return res.data
  },

  submit: async (contractId: string, data: SubmitFinalReportRequest) => {
    const res = await api.post<ApiResponse<FinalReportDto>>(`/api/final-reports/${contractId}/submit`, data)
    return res.data
  },

  requestRevision: async (id: string, data: RequestRevisionRequest) => {
    const res = await api.post<ApiResponse<FinalReportDto>>(`/api/final-reports/${id}/request-revision`, data)
    return res.data
  },

  accept: async (id: string) => {
    const res = await api.post<ApiResponse<FinalReportDto>>(`/api/final-reports/${id}/accept`)
    return res.data
  },

  archive: async (id: string) => {
    const res = await api.post<ApiResponse<FinalReportDto>>(`/api/final-reports/${id}/archive`)
    return res.data
  },
}
