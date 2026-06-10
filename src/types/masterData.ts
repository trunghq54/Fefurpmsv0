// Personnel Role Types
export interface PersonnelRoleTypeResponse {
  id: number
  code: string
  name: string
  defaultCoefficient: number | null
  isActive: boolean
}

export interface UpsertPersonnelRoleTypeRequest {
  code: string
  name: string
  defaultCoefficient?: number
  isActive: boolean
}

// Budget Expense Categories
export interface BudgetExpenseCategoryResponse {
  id: number
  code: string
  name: string
  sequence: number
  isActive: boolean
}

export interface UpsertBudgetExpenseCategoryRequest {
  code: string
  name: string
  sequence: number
  isActive: boolean
}

// System Financial Configs
export interface SystemFinancialConfigResponse {
  id: number
  code: string
  value: number
  description: string | null
  effectiveDate: string
  isActive: boolean
}

export interface UpsertSystemFinancialConfigRequest {
  code: string
  value: number
  description?: string
  effectiveDate: string
  isActive: boolean
}
