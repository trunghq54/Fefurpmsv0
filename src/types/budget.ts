// Budget

export interface BudgetItemDto {
  id: number | null
  categoryId: number
  categoryCode: string | null
  categoryName: string | null
  amount: number
  sourceKhoan: number
  sourceNgoaiKhoan: number
  sourceNsnn: number
  sourceOther: number
  sequence: number
}

export interface BudgetResponse {
  budgetId: number
  totalAmount: number
  laborAmount: number
  equipmentAmount: number
  externalServiceAmount: number
  conferenceAmount: number
  officeSuppliesAmount: number
  incidentalIpAmount: number
  items: BudgetItemDto[]
}

export interface UpdateBudgetRequest {
  totalAmount: number
  items: BudgetItemDto[]
}

export interface LaborDetailResponse {
  id: number
  teamMemberId: number
  teamMemberName: string | null
  totalResearchHours: number
  hourlyRate: number
  totalAmount: number
  workDays: number | null
  coefficient: number | null
  dailyRate: number | null
  computedDailyTotal: number | null
  sequence: number
}

export interface UpdateLaborDetailRequest {
  totalResearchHours: number
  hourlyRate: number
  workDays?: number
  coefficient?: number
  dailyRate?: number
}

// Team Members

export interface TeamMemberResponse {
  id: number
  userId: string | null
  fullName: string
  academicTitle: string | null
  unitName: string | null
  workContent: string
  workMonths: number
  isPi: boolean
  isSecretary: boolean
  memberRoleCode: string | null
  salaryCoefficient: number | null
  sequence: number
}

export interface CreateTeamMemberRequest {
  userId?: string
  fullName: string
  academicTitle?: string
  unitName?: string
  workContent: string
  workMonths: number
  isPi: boolean
  isSecretary: boolean
  memberRoleCode?: string
  salaryCoefficient?: number
}
