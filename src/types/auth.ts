export interface LoginRequest {
  email: string
  password: string
}

export type RoleName = 'Administrator' | 'Staff' | 'Faculty' | 'ReviewCommittee'

export interface UserInfo {
  id: string
  email: string
  fullName: string
  accountType: RoleName // primary/default role
  roles: RoleName[]
  mustChangePassword: boolean
}

export interface LoginResponse {
  accessToken: string
  expiresAt: string
  user: UserInfo
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string | null
}
