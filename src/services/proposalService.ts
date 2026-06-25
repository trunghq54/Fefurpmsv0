import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type {
  ProposalDto,
  ProposalSummaryDto,
  CreateProposalRequest,
  ProposalDocumentDto,
  ExtractedProposalDto,
} from '../types/proposal'

export interface ProposalQuery {
  cycleId?: string
  trackId?: string
  status?: string
  type?: string
  search?: string
}

export const proposalService = {
  getAll: async (params?: ProposalQuery) => {
    const res = await api.get<ApiResponse<ProposalSummaryDto[]>>('/api/proposals', { params })
    return res.data
  },

  getMy: async () => {
    const res = await api.get<ApiResponse<ProposalSummaryDto[]>>('/api/proposals/my')
    return res.data
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<ProposalDto>>(`/api/proposals/${id}`)
    return res.data
  },

  create: async (data: CreateProposalRequest) => {
    const res = await api.post<ApiResponse<ProposalDto>>('/api/proposals', data)
    return res.data
  },

  // Đường B: upload Word/PDF → AI trích xuất field để prefill form (nhập tay vẫn là fallback).
  extract: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await api.post<ApiResponse<ExtractedProposalDto>>('/api/proposals/extract', form)
    return res.data
  },

  update: async (id: string, data: CreateProposalRequest) => {
    const res = await api.put<ApiResponse<ProposalDto>>(`/api/proposals/${id}`, data)
    return res.data
  },

  submit: async (id: string, confirmCv = false) => {
    const url = `/api/proposals/${id}/submit${confirmCv ? '?confirmCv=true' : ''}`
    const res = await api.post<ApiResponse<ProposalDto>>(url)
    return res.data
  },

  withdraw: async (id: string) => {
    const res = await api.patch<ApiResponse<ProposalDto>>(`/api/proposals/${id}/withdraw`)
    return res.data
  },

  // Documents
  getDocuments: async (proposalId: string) => {
    const res = await api.get<ApiResponse<ProposalDocumentDto[]>>(`/api/proposals/${proposalId}/documents`)
    return res.data
  },

  // Kho tài liệu toàn cục (Admin/Staff) — kèm context đề tài/PI
  getAllDocuments: async () => {
    const res = await api.get<ApiResponse<ProposalDocumentDto[]>>(`/api/documents`)
    return res.data
  },

  uploadDocument: async (proposalId: string, file: File, documentType: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('documentType', documentType)
    // Do NOT set Content-Type — axios/browser must add the multipart boundary itself.
    const res = await api.post<ApiResponse<ProposalDocumentDto>>(`/api/proposals/${proposalId}/documents`, form)
    return res.data
  },

  deleteDocument: async (proposalId: string, documentId: string) => {
    await api.delete(`/api/proposals/${proposalId}/documents/${documentId}`)
  },

  downloadDocument: async (proposalId: string, documentId: string, fileName: string) => {
    const res = await api.get(`/api/proposals/${proposalId}/documents/${documentId}/download`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(res.data as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  },
}
