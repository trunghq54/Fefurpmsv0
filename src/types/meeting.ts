export interface MeetingDto {
  id: string
  councilId: string
  title?: string
  platform: string
  scheduledAt: string
  durationMinutes: number
  meetingLink?: string
  agenda?: string
  status: string
  createdAt: string
  // only on GET /api/meetings list
  proposalId?: string
  proposalTitle?: string
  roundType?: string
  roundNumber?: number
}

export interface CreateMeetingRequest {
  title?: string
  platform: string   // string: "GOOGLE_MEET" | "TEAMS" | "IN_PERSON"
  scheduledAt: string
  durationMinutes: number
  meetingLink?: string
  agenda?: string
}

export const MEETING_PLATFORM = {
  GoogleMeet: 'GOOGLE_MEET',
  Teams: 'TEAMS',
  InPerson: 'IN_PERSON',
} as const
