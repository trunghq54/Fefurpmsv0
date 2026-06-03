export interface UserDto {
  id: string
  email: string
  fullName: string
  phoneNumber?: string
  department?: string
  academicDegree?: string
  accountType: string
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
  accountType: number
  temporaryPassword: string
}

export interface UpdateUserRequest {
  fullName: string
  phoneNumber?: string
  department?: string
  academicDegree?: number
  accountType: number
}
