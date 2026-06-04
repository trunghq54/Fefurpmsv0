export interface ChangeRequestDto {
  id: string
  proposalId: string
  proposalTitleVI: string
  type: 'ExtendTime' | 'ContentChange' | 'PersonnelChange' | 'BudgetChange' | 'Suspend'
  description: string
  newValue?: string
  status: 'Pending' | 'Approved' | 'Rejected'
  adminNote?: string
  requestedAt: string
  reviewedAt?: string
}

export interface CreateChangeRequestRequest {
  type: number
  description: string
  newValue?: string
}

export const CHANGE_TYPE = { ExtendTime: 1, ContentChange: 2, PersonnelChange: 3, BudgetChange: 4, Suspend: 5 } as const

export const CHANGE_TYPE_LABEL: Record<string, string> = {
  ExtendTime: 'Gia hạn thời gian',
  ContentChange: 'Thay đổi nội dung',
  PersonnelChange: 'Thay đổi nhân sự',
  BudgetChange: 'Thay đổi kinh phí',
  Suspend: 'Tạm dừng',
}
