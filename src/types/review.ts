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

export interface RubricScoreDto {
  id: string
  assignmentId: string
  criterion1: number
  criterion2: number
  criterion3: number
  criterion4: number
  criterion5: number
  totalScore: number
  comments?: string
  aiFeedbackDraft?: string
  submittedAt: string
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

export const RUBRIC_CRITERIA = [
  { key: 'criterion1', name: 'Mục đích & ý nghĩa', max: 10 },
  { key: 'criterion2', name: 'Phương pháp nghiên cứu', max: 20 },
  { key: 'criterion3', name: 'Nội dung & kết quả', max: 40 },
  { key: 'criterion4', name: 'Năng lực nhóm', max: 20 },
  { key: 'criterion5', name: 'Hợp lý kinh phí', max: 10 },
] as const
