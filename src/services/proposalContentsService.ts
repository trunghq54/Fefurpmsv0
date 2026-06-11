import api from '../lib/api'
import type { ApiResponse } from '../types/auth'

export interface ActivityDto {
  id: number
  contentId: number
  proposalId: string
  activityName: string
  expectedResult: string
  startMonth: number
  endMonth: number
  responsiblePerson?: string
  estimatedCost: number
  sequence: number
  activityType: string
  requiresApproval: boolean
}

export interface ResearchContentDto {
  id: number
  proposalId: string
  contentNumber: number
  title: string
  description?: string
  sequence: number
  activities: ActivityDto[]
}

export interface ResearchContentRequest {
  contentNumber: number
  title: string
  description?: string
  sequence: number
}

export interface ActivityRequest {
  activityName: string
  expectedResult: string
  startMonth: number
  endMonth: number
  responsiblePerson?: string
  estimatedCost: number
  sequence: number
  activityType?: string
  requiresApproval: boolean
}

export interface ExpectedProductDto {
  id: number
  proposalId: string
  categoryId?: number
  productName: string
  scientificRequirements?: string
  notes?: string
  sequence: number
}

export interface ExpectedProductRequest {
  categoryId?: number
  productName: string
  scientificRequirements?: string
  notes?: string
  sequence: number
}

export const proposalContentsService = {
  // Research Contents
  getContents: async (proposalId: string) => {
    const res = await api.get<ApiResponse<ResearchContentDto[]>>(
      `/api/proposals/${proposalId}/research-contents`
    )
    return res.data
  },

  createContent: async (proposalId: string, data: ResearchContentRequest) => {
    const res = await api.post<ApiResponse<ResearchContentDto>>(
      `/api/proposals/${proposalId}/research-contents`,
      data
    )
    return res.data
  },

  updateContent: async (proposalId: string, contentId: number, data: ResearchContentRequest) => {
    const res = await api.put<ApiResponse<ResearchContentDto>>(
      `/api/proposals/${proposalId}/research-contents/${contentId}`,
      data
    )
    return res.data
  },

  deleteContent: async (proposalId: string, contentId: number) => {
    await api.delete(`/api/proposals/${proposalId}/research-contents/${contentId}`)
  },

  // Activities
  createActivity: async (proposalId: string, contentId: number, data: ActivityRequest) => {
    const res = await api.post<ApiResponse<ActivityDto>>(
      `/api/proposals/${proposalId}/research-contents/${contentId}/activities`,
      data
    )
    return res.data
  },

  updateActivity: async (proposalId: string, activityId: number, data: ActivityRequest) => {
    const res = await api.put<ApiResponse<ActivityDto>>(
      `/api/proposals/${proposalId}/activities/${activityId}`,
      data
    )
    return res.data
  },

  deleteActivity: async (proposalId: string, activityId: number) => {
    await api.delete(`/api/proposals/${proposalId}/activities/${activityId}`)
  },

  // Expected Products
  getExpectedProducts: async (proposalId: string) => {
    const res = await api.get<ApiResponse<ExpectedProductDto[]>>(
      `/api/proposals/${proposalId}/expected-products`
    )
    return res.data
  },

  createExpectedProduct: async (proposalId: string, data: ExpectedProductRequest) => {
    const res = await api.post<ApiResponse<ExpectedProductDto>>(
      `/api/proposals/${proposalId}/expected-products`,
      data
    )
    return res.data
  },

  updateExpectedProduct: async (proposalId: string, productId: number, data: ExpectedProductRequest) => {
    const res = await api.put<ApiResponse<ExpectedProductDto>>(
      `/api/proposals/${proposalId}/expected-products/${productId}`,
      data
    )
    return res.data
  },

  deleteExpectedProduct: async (proposalId: string, productId: number) => {
    await api.delete(`/api/proposals/${proposalId}/expected-products/${productId}`)
  },
}
