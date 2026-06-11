import api from '../lib/api'
import type { ApiResponse } from '../types/auth'

export interface AcademicProfileDto {
  id: number
  userId: string
  academicTitle?: string
  scientificRank?: string
  degreeLevel?: string
  specialization?: string
  dateOfBirth?: string
  gender?: string
  hometown?: string
  nationality?: string
  gsPgsYear?: number
  gsPgsInstitution?: string
  isiScopusCount: number
  intlJournalCount: number
  domesticJournalCount: number
  intlConferenceCount: number
  domesticConferenceCount: number
  patentsCount: number
  phdSupervisedCount: number
  masterSupervisedCount: number
  institution?: string
  institutionAddress?: string
  specializationAreas?: string
  isEligiblePi: boolean
  createdAt: string
  updatedAt: string
}

export interface AcademicProfileRequest {
  academicTitle?: string
  scientificRank?: string
  degreeLevel?: string
  specialization?: string
  dateOfBirth?: string
  gender?: string
  hometown?: string
  nationality?: string
  gsPgsYear?: number
  gsPgsInstitution?: string
  isiScopusCount: number
  intlJournalCount: number
  domesticJournalCount: number
  intlConferenceCount: number
  domesticConferenceCount: number
  patentsCount: number
  phdSupervisedCount: number
  masterSupervisedCount: number
  institution?: string
  institutionAddress?: string
  specializationAreas?: string
}

export const academicProfileService = {
  get: async (userId: string) => {
    const res = await api.get<ApiResponse<AcademicProfileDto | null>>(`/api/users/${userId}/profile`)
    return res.data
  },

  upsert: async (userId: string, data: AcademicProfileRequest) => {
    const res = await api.put<ApiResponse<AcademicProfileDto>>(`/api/users/${userId}/profile`, data)
    return res.data
  },
}
