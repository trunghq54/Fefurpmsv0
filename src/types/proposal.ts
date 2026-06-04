export interface ProposalMemberDto {
  id: string
  fullName: string
  email?: string
  department?: string
  role: string
  workMonths: number
}

export interface BudgetItemDto {
  id: string
  category: string
  amount: number
  note?: string
}

export interface ProposalDocumentDto {
  id: string
  fileName: string
  documentType: string
  fileSizeBytes: number
  uploadedAt: string
}

export interface ProposalDto {
  id: string
  cycleId: string
  cycleName: string
  trackId: string
  trackName: string
  principalInvestigatorName: string
  titleVI: string
  titleEN: string
  researchType: 'Applied' | 'Basic'
  status: string
  durationMonths: number
  objectives: string
  methodology: string
  expectedOutput: string
  totalBudget: number
  rejectionReason?: string
  submittedAt?: string
  createdAt: string
  members: ProposalMemberDto[]
  budgetItems: BudgetItemDto[]
  documents: ProposalDocumentDto[]
}

export interface ProposalSummaryDto {
  id: string
  titleVI: string
  researchType: 'Applied' | 'Basic'
  status: string
  trackName: string
  principalInvestigatorName: string
  totalBudget: number
  createdAt: string
  submittedAt?: string
}

export interface CreateMemberRequest {
  fullName: string
  email?: string
  department?: string
  role: string
  workMonths: number
}

export interface CreateBudgetItemRequest {
  category: string
  amount: number
  note?: string
}

export interface CreateProposalRequest {
  trackId: string
  titleVI: string
  titleEN: string
  researchType: number // 1 = Applied, 2 = Basic
  durationMonths: number
  objectives: string
  methodology: string
  expectedOutput: string
  members: CreateMemberRequest[]
  budgetItems: CreateBudgetItemRequest[]
}

export const RESEARCH_TYPE = { Applied: 1, Basic: 2 } as const
