import { createContext, useContext, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router'
import type { UserInfo, RoleName } from '../types/auth'
import { authService } from '../services/authService'

interface AuthContextType {
  user: UserInfo | null
  token: string | null
  roles: RoleName[]
  activeRole: RoleName | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  switchRole: (role: RoleName) => void
  markPasswordChanged: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const roleToPath: Record<RoleName, string> = {
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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('furpms_token'))
  const [activeRole, setActiveRoleState] = useState<RoleName | null>(
    () => (localStorage.getItem('furpms_active_role') as RoleName) || null,
  )

  const roles: RoleName[] = user?.roles?.length ? user.roles : user ? [user.accountType] : []

  const setActiveRole = (role: RoleName) => {
    localStorage.setItem('furpms_active_role', role)
    setActiveRoleState(role)
  }

  // Decide where to send the user after auth is established.
  const routeAfterAuth = (u: UserInfo) => {
    if (u.mustChangePassword) {
      navigate('/change-password')
      return
    }
    const userRoles = u.roles?.length ? u.roles : [u.accountType]
    if (userRoles.length > 1) {
      navigate('/select-role')
    } else {
      setActiveRole(userRoles[0])
      navigate(roleToPath[userRoles[0]] || '/admin')
    }
  }

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password)
    if (!res.success || !res.data) throw new Error(res.message || 'Đăng nhập thất bại')
    const { accessToken, user: userInfo } = res.data
    localStorage.setItem('furpms_token', accessToken)
    localStorage.setItem('furpms_user', JSON.stringify(userInfo))
    localStorage.removeItem('furpms_active_role')
    setActiveRoleState(null)
    setToken(accessToken)
    setUser(userInfo)
    routeAfterAuth(userInfo)
  }

  const switchRole = (role: RoleName) => {
    if (!roles.includes(role)) return
    setActiveRole(role)
    navigate(roleToPath[role])
  }

  const markPasswordChanged = () => {
    if (!user) return
    const updated = { ...user, mustChangePassword: false }
    localStorage.setItem('furpms_user', JSON.stringify(updated))
    setUser(updated)
    routeAfterAuth(updated)
  }

  const logout = () => {
    localStorage.removeItem('furpms_token')
    localStorage.removeItem('furpms_user')
    localStorage.removeItem('furpms_active_role')
    setToken(null)
    setUser(null)
    setActiveRoleState(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{ user, token, roles, activeRole, login, logout, switchRole, markPasswordChanged, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
