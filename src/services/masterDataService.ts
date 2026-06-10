import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type {
  PersonnelRoleTypeResponse,
  UpsertPersonnelRoleTypeRequest,
  BudgetExpenseCategoryResponse,
  UpsertBudgetExpenseCategoryRequest,
  SystemFinancialConfigResponse,
  UpsertSystemFinancialConfigRequest,
} from '../types/masterData'

// ── Personnel Role Types ────────────────────────────────────────────────────

export const personnelRoleTypeService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<PersonnelRoleTypeResponse[]>>('/api/personnel-role-types')
    return res.data
  },

  getById: async (id: number) => {
    const res = await api.get<ApiResponse<PersonnelRoleTypeResponse>>(`/api/personnel-role-types/${id}`)
    return res.data
  },

  create: async (data: UpsertPersonnelRoleTypeRequest) => {
    const res = await api.post<ApiResponse<PersonnelRoleTypeResponse>>('/api/personnel-role-types', data)
    return res.data
  },

  update: async (id: number, data: UpsertPersonnelRoleTypeRequest) => {
    const res = await api.put<ApiResponse<PersonnelRoleTypeResponse>>(`/api/personnel-role-types/${id}`, data)
    return res.data
  },
}

// ── Budget Expense Categories ───────────────────────────────────────────────

export const budgetExpenseCategoryService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<BudgetExpenseCategoryResponse[]>>('/api/budget-expense-categories')
    return res.data
  },

  getById: async (id: number) => {
    const res = await api.get<ApiResponse<BudgetExpenseCategoryResponse>>(`/api/budget-expense-categories/${id}`)
    return res.data
  },

  create: async (data: UpsertBudgetExpenseCategoryRequest) => {
    const res = await api.post<ApiResponse<BudgetExpenseCategoryResponse>>('/api/budget-expense-categories', data)
    return res.data
  },

  update: async (id: number, data: UpsertBudgetExpenseCategoryRequest) => {
    const res = await api.put<ApiResponse<BudgetExpenseCategoryResponse>>(`/api/budget-expense-categories/${id}`, data)
    return res.data
  },
}

// ── System Financial Configs ────────────────────────────────────────────────

export const financialConfigService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<SystemFinancialConfigResponse[]>>('/api/financial-configs')
    return res.data
  },

  getById: async (id: number) => {
    const res = await api.get<ApiResponse<SystemFinancialConfigResponse>>(`/api/financial-configs/${id}`)
    return res.data
  },

  create: async (data: UpsertSystemFinancialConfigRequest) => {
    const res = await api.post<ApiResponse<SystemFinancialConfigResponse>>('/api/financial-configs', data)
    return res.data
  },

  update: async (id: number, data: UpsertSystemFinancialConfigRequest) => {
    const res = await api.put<ApiResponse<SystemFinancialConfigResponse>>(`/api/financial-configs/${id}`, data)
    return res.data
  },
}
