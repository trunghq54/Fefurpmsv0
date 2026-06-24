export interface TrackDto {
  id: string
  cycleId: string
  name: string
  description?: string
  ownerId?: string
  ownerName?: string
  isActive: boolean
  createdAt: string
}

export interface ResearchTypeOption {
  id: number
  code: string
  name: string
  maxBudgetCap: number
}

export interface CycleDto {
  id: string
  name: string
  academicYear: string
  status: string
  researchTypeId: number
  researchTypeName: string
  submissionStartDate: string
  submissionDeadline: string
  fundingCap: number
  description?: string
  createdAt: string
  trackCount: number
  tracks: TrackDto[]
}

export interface CreateCycleRequest {
  name: string
  academicYear: string
  researchTypeId: number
  submissionStartDate: string
  submissionDeadline: string
  description?: string
}

export interface CreateTrackRequest {
  name: string
  description?: string
  ownerId?: string
}
