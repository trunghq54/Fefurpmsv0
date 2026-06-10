export interface CouncilResponse {
  id: string
  proposalId: string
  roundId: string | null
  councilType: string
  establishmentDecisionNo: string | null
  establishedAt: string | null
  meetingDeadline: string | null
  minMembersRequired: number
  maxMembersAllowed: number
  status: string
  createdAt: string
}

export interface CouncilMemberResponse {
  id: string
  councilId: string
  userId: string
  memberRole: string
  isExternal: boolean
  status: string
  invitationSentAt: string | null
}

export interface CreateCouncilRequest {
  proposalId: string
  roundId: string
  councilType: string
  establishmentDecisionNo?: string
  establishedAt?: string
  meetingDeadline?: string
  minMembersRequired?: number
  maxMembersAllowed?: number
}

export interface AddCouncilMemberRequest {
  userId: string
  memberRole: string
  isExternal: boolean
}
