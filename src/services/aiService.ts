import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { AiSummaryDto } from '../types/ai'
import type { ProposalSummaryDto } from '../types/proposal'

export const aiService = {
  getSummary: async (proposalId: string) => {
    const res = await api.get<ApiResponse<AiSummaryDto | null>>(`/api/proposals/${proposalId}/summary`)
    return res.data
  },
  generateSummary: async (proposalId: string) => {
    const res = await api.post<ApiResponse<AiSummaryDto>>(`/api/proposals/${proposalId}/generate-summary`)
    return res.data
  },
  updateSummary: async (proposalId: string, editedText: string) => {
    const res = await api.patch<ApiResponse<AiSummaryDto>>(`/api/proposals/${proposalId}/summary`, { editedText })
    return res.data
  },
  aiFeedback: async (assignmentId: string, criterionName: string, maxScore: number) => {
    const res = await api.post<ApiResponse<{ feedbackDraft: string }>>(`/api/assignments/${assignmentId}/ai-feedback`, { criterionName, maxScore })
    return res.data
  },
  aiRubricAssessment: async (assignmentId: string) => {
    const res = await api.post<ApiResponse<{ assessment: string }>>(`/api/assignments/${assignmentId}/ai-rubric-assessment`)
    return res.data
  },
  search: async (q: string) => {
    const res = await api.get<ApiResponse<ProposalSummaryDto[]>>('/api/search', { params: { q } })
    return res.data
  },
}
