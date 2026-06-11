import api from '../lib/api'
import type { ApiResponse } from '../types/auth'

export interface OrgUnitDto {
  id: number
  code: string
  name: string
  unitType: string
  parentId?: number
  headUserId?: string
  isActive: boolean
  sortOrder?: number
}

export interface OrgUnitRequest {
  code: string
  name: string
  unitType: string
  parentId?: number
  headUserId?: string
  sortOrder?: number
}

export const organizationalUnitService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<OrgUnitDto[]>>('/api/organizational-units')
    return res.data
  },

  create: async (data: OrgUnitRequest) => {
    const res = await api.post<ApiResponse<OrgUnitDto>>('/api/organizational-units', data)
    return res.data
  },

  update: async (id: number, data: OrgUnitRequest) => {
    const res = await api.put<ApiResponse<OrgUnitDto>>(`/api/organizational-units/${id}`, data)
    return res.data
  },
}
