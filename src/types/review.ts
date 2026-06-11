// ---- Assignment/Member view (FE-side, mapped from BE MyMembershipDto) ----

export interface ReviewAssignmentDto {
  id: string           // CouncilMember.Id
  councilId: string    // CouncilMember.CouncilId
  reviewRoundId: string
  reviewerId: string
  reviewerName: string
  reviewerEmail?: string
  role: 'Member' | 'Chair' | 'Opponent'
  status: 'Pending' | 'Accepted' | 'Declined'
  assignedAt?: string
  acceptedAt?: string
}

// Returned by GET /api/proposals/{id}/rounds (includes council members)
export interface ReviewRoundDto {
  id: string
  proposalId?: string
  roundType: string    // BE values: SCREENING | REVIEW | ACCEPTANCE
  roundNumber: number
  dimension?: string   // SCIENCE | FINANCE
  status: string       // BE values: PENDING | OPEN | PASSED | FAILED
  result?: string      // APPROVED | REJECTED | REVISION_REQUIRED
  councilId?: string
  openedAt?: string
  closedAt?: string
  assignments: ReviewAssignmentDto[]  // mapped from Members
}

// Returned by GET /api/councils/my-memberships (mapped to FE shape in service)
export interface MyAssignmentDto {
  assignmentId: string   // maps to CouncilMember.Id (memberId)
  councilId: string      // CouncilMember.CouncilId
  roundId?: string
  roundType: string      // REVIEW | ACCEPTANCE | SCREENING (BE values)
  roundStatus: string    // PENDING | OPEN | PASSED | FAILED (BE values)
  role: string           // Member | Chair | Opponent
  status: string         // Pending | Accepted | Declined (mapped from INVITED/CONFIRMED/DECLINED)
  proposalId: string
  proposalTitleVI: string
  proposalStatus: string
}

export interface RubricScoreItemDto {
  criterionId: string
  name: string
  maxScore: number
  score: number
}

export interface RubricScoreDto {
  id: string
  assignmentId: string
  items: RubricScoreItemDto[]
  totalScore: number
  comments?: string
  aiFeedbackDraft?: string
  submittedAt: string
}

export interface RubricCriterionDto {
  id: string
  roundType: string
  orderIndex: number
  name: string
  maxScore: number
  isActive: boolean
}

export interface AcceptanceVoteDto {
  id: string
  assignmentId: string
  vote: 'Pass' | 'Fail' | 'PassExcellent'
  writtenReview?: string
  necessityScore?: number
  contributionScore?: number
  practicalScore?: number
  resultScore?: number
  submittedAt: string
}

export interface RoundResultRowDto {
  assignmentId: string
  reviewerName: string
  role: string
  status: string
  rubric?: RubricScoreDto
  vote?: AcceptanceVoteDto
}

export interface RoundResultsDto {
  roundId: string
  roundType: string
  roundNumber: number
  status: string
  outcome?: string
  rows: RoundResultRowDto[]
  averageTotal?: number
}

// BE round type values → display labels
export const ROUND_TYPE_LABEL: Record<string, string> = {
  SCREENING: 'Sàng lọc',
  REVIEW: 'Xét duyệt',
  ACCEPTANCE: 'Nghiệm thu',
}

// BE status values → display labels
export const ROUND_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ mở',
  OPEN: 'Đang mở',
  PASSED: 'Đã duyệt',
  FAILED: 'Từ chối',
}

// Legacy constants kept for backwards compat with components
export const ROUND_TYPE = { ProposalReview: 'REVIEW', ProgressCheck: 'SCREENING', Acceptance: 'ACCEPTANCE' } as const
export const ASSIGNMENT_ROLE = { Member: 'Member', Chair: 'Chair', Opponent: 'Opponent' } as const
export const VOTE_RESULT = { Pass: 1, Fail: 2, PassExcellent: 3 } as const
