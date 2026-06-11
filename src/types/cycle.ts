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

export interface CycleDto {
  id: string
  name: string
  academicYear: string
  status: string
  submissionStartDate: string
  submissionEndDateApplied: string
  submissionEndDateBasic: string
  fundingCapApplied: number
  fundingCapBasic: number
  description?: string
  createdAt: string
  trackCount: number
  tracks: TrackDto[]
}

export interface CreateCycleRequest {
  name: string
  academicYear: string
  submissionStartDate: string
  submissionEndDateApplied: string
  submissionEndDateBasic: string
  fundingCapApplied: number
  fundingCapBasic: number
  description?: string
}

export interface CreateTrackRequest {
  name: string
  description?: string
  ownerId?: string
}
