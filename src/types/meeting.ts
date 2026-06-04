export interface MeetingDto {
  id: string
  reviewRoundId: string
  title: string
  platform: 'GoogleMeet' | 'Teams'
  scheduledAt: string
  durationMinutes: number
  meetingLink?: string
  agenda?: string
  notes?: string
  createdAt: string
}

export interface CreateMeetingRequest {
  title: string
  platform: number // 1 = GoogleMeet, 2 = Teams
  scheduledAt: string
  durationMinutes: number
  meetingLink?: string
  agenda?: string
  notes?: string
}

export const MEETING_PLATFORM = { GoogleMeet: 1, Teams: 2 } as const
