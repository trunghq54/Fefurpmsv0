import { createContext, useContext, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router'
import type { UserInfo } from '../types/auth'
import { authService } from '../services/authService'

interface AuthContextType {
  user: UserInfo | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const accountTypeToPath: Record<string, string> = {
  Administrator: '/admin',
  Staff: '/staff',
  Faculty: '/faculty',
  ReviewCommittee: '/reviewer',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  const [user, setUser] = useState<UserInfo | null>(() => {
    const stored = localStorage.getItem('furpms_user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('furpms_token')
  )

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password)
    if (!res.success || !res.data) throw new Error(res.message || 'Đăng nhập thất bại')
    const { accessToken, user: userInfo } = res.data
    localStorage.setItem('furpms_token', accessToken)
    localStorage.setItem('furpms_user', JSON.stringify(userInfo))
    setToken(accessToken)
    setUser(userInfo)
    if (userInfo.mustChangePassword) {
      navigate('/change-password')
    } else {
      navigate(accountTypeToPath[userInfo.accountType] || '/admin')
    }
  }

  const logout = () => {
    localStorage.removeItem('furpms_token')
    localStorage.removeItem('furpms_user')
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
