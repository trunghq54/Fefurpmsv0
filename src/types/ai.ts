export interface AiSummaryDto {
  id: string
  proposalId: string
  summaryText: string
  isEditedByHuman: boolean
  editedText?: string
  generatedAt: string
  // "pdf" | "unreadableFile" | "textFields"
  source?: string
  sourceFileName?: string
}
