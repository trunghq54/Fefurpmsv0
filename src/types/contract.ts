// Contracts

export interface ContractListResponse {
  id: string
  contractNumber: string
  proposalId: string
  proposalCode: string | null
  proposalTitle: string | null
  status: string
  totalAmount: number
  startDate: string
  endDate: string
  signedAt: string | null
  createdAt: string
}

export interface ContractDetailResponse extends ContractListResponse {
  fundingMethod: string | null
  originalEndDate: string
  maxExtensionMonths: number
  sideARepresentative: string | null
  econtractUrl: string | null
  terminatedAt: string | null
  terminatedReason: string | null
  updatedAt: string
}

export interface CreateContractRequest {
  proposalId: string
  contractNumber: string
  startDate: string
  endDate: string
  maxExtensionMonths?: number
  sideARepresentative?: string
  econtractUrl?: string
}

// Disbursements

export interface DisbursementResponse {
  id: number
  contractId: string
  roundNumber: number
  percentage: number
  plannedAmount: number
  actualAmount: number | null
  conditionDescription: string
  conditionMetAt: string | null
  disbursedAt: string | null
  bankReference: string | null
  status: string
  notes: string | null
  deliverableId: number | null
}

export interface ConfirmDisbursementRequest {
  actualAmount: number
  bankReference: string
  notes?: string
}

// Deliverables

export interface DeliverableResponse {
  id: number
  contractId: string
  expectedProductId: number | null
  categoryId: number
  categoryName: string | null
  productName: string
  description: string | null
  dueDate: string | null
  acceptanceStatus: string | null
  isCompleted: boolean
  submittedAt: string | null
  fileUrl: string | null
  qualityAssessment: string | null
}

export interface SubmitDeliverableRequest {
  fileUrl: string
  description?: string
}

export interface EvaluateDeliverableRequest {
  acceptanceStatus: 'PASSED' | 'FAILED'
  qualityAssessment?: string
}

// Amendments

export interface AmendmentListResponse {
  id: string
  contractId: string
  categoryId: number
  categoryName: string | null
  changeDescription: string
  justification: string
  status: string
  requestedAt: string
  oldValue: string | null
  newValue: string | null
}

export interface AmendmentDetailResponse extends AmendmentListResponse {
  changePercentage: number | null
  requiresRectorApproval: boolean
  reviewerComments: string | null
  reviewedAt: string | null
}

export interface CreateAmendmentRequest {
  categoryId: number
  changeDescription: string
  justification: string
  changePercentage?: number
  oldValue?: string
  newValue?: string
  requiresRectorApproval: boolean
}

export interface ReviewAmendmentRequest {
  reviewerComments?: string
}
