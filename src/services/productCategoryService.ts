import api from '../lib/api'
import type { ApiResponse } from '../types/auth'

export interface ProductCategoryDto {
  id: number
  code: string
  name: string
  isActive: boolean
}

export interface ProductCategoryRequest {
  code: string
  name: string
  isActive?: boolean
}

export const productCategoryService = {
  getAll: async (activeOnly?: boolean) => {
    const res = await api.get<ApiResponse<ProductCategoryDto[]>>('/api/product-categories', {
      params: activeOnly ? { activeOnly: true } : undefined,
    })
    return res.data
  },

  getById: async (id: number) => {
    const res = await api.get<ApiResponse<ProductCategoryDto>>(`/api/product-categories/${id}`)
    return res.data
  },

  create: async (data: ProductCategoryRequest) => {
    const res = await api.post<ApiResponse<ProductCategoryDto>>('/api/product-categories', data)
    return res.data
  },

  update: async (id: number, data: ProductCategoryRequest) => {
    const res = await api.put<ApiResponse<ProductCategoryDto>>(`/api/product-categories/${id}`, data)
    return res.data
  },
}
