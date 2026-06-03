export interface LoginRequest {
  email: string
  password: string
}

export interface UserInfo {
  id: string
  email: string
  fullName: string
  accountType: 'Administrator' | 'Staff' | 'Faculty' | 'ReviewCommittee'
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
