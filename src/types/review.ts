export interface ReviewAssignmentDto {
  id: string
  reviewRoundId: string
  reviewerId: string
  reviewerName: string
  reviewerEmail?: string
  role: 'Member' | 'Chair' | 'Opponent'
  status: 'Pending' | 'Accepted' | 'Declined'
  assignedAt: string
  acceptedAt?: string
}

export interface ReviewRoundDto {
  id: string
  proposalId: string
  roundType: 'ProposalReview' | 'ProgressCheck' | 'Acceptance'
  roundNumber: number
  status: 'Pending' | 'InProgress' | 'Completed'
  outcome?: string
  notes?: string
  completedAt?: string
  createdAt: string
  assignments: ReviewAssignmentDto[]
}

export interface MyAssignmentDto {
  assignmentId: string
  roundId: string
  roundType: 'ProposalReview' | 'ProgressCheck' | 'Acceptance'
  roundStatus: 'Pending' | 'InProgress' | 'Completed'
  role: 'Member' | 'Chair' | 'Opponent'
  status: 'Pending' | 'Accepted' | 'Declined'
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
  roundType: 'ProposalReview' | 'ProgressCheck' | 'Acceptance'
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

export const ROUND_TYPE = { ProposalReview: 1, ProgressCheck: 2, Acceptance: 3 } as const
export const ASSIGNMENT_ROLE = { Member: 1, Chair: 2, Opponent: 3 } as const
export const VOTE_RESULT = { Pass: 1, Fail: 2, PassExcellent: 3 } as const

export const ROUND_TYPE_LABEL: Record<string, string> = {
  ProposalReview: 'Xét duyệt', ProgressCheck: 'Kiểm tra tiến độ', Acceptance: 'Nghiệm thu',
}
