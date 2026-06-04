export interface AiSummaryDto {
  id: string
  proposalId: string
  summaryText: string
  isEditedByHuman: boolean
  editedText?: string
  generatedAt: string
}
