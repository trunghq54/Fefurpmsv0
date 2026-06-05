export interface UserDto {
  id: string
  email: string
  fullName: string
  phoneNumber?: string
  department?: string
  academicDegree?: string
  accountType: string // primary role
  roles: string[]
  isActive: boolean
  mustChangePassword: boolean
  createdAt: string
  lastLoginAt?: string
}

export interface CreateUserRequest {
  email: string
  fullName: string
  phoneNumber?: string
  department?: string
  academicDegree?: number
  roles: number[] // AccountType enum values: Administrator=1, Staff=2, Faculty=3, ReviewCommittee=4
  temporaryPassword: string
}

export interface UpdateUserRequest {
  fullName: string
  phoneNumber?: string
  department?: string
  academicDegree?: number
  roles: number[]
}

// Backend enum values (NOT zero-based) — must match FURPMS.Domain.Enums.AccountType
export const ROLE_VALUE = { Administrator: 1, Staff: 2, Faculty: 3, ReviewCommittee: 4 } as const
export const ROLE_LABEL: Record<string, string> = {
  Administrator: 'Quản trị', Staff: 'Phòng QLKH', Faculty: 'Giảng viên', ReviewCommittee: 'Hội đồng',
}
