import { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth, roleToPath } from '../../contexts/AuthContext'
import type { RoleName } from '../../types/auth'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: RoleName[]
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user, activeRole } = useAuth()

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />

  const userRoles: RoleName[] = user.roles?.length ? user.roles : [user.accountType]

  if (roles && !roles.some((r) => userRoles.includes(r))) {
    // Not allowed for this section → send to the user's active/default dashboard.
    const fallback = activeRole
      ? roleToPath[activeRole]
      : userRoles.length > 1
        ? '/select-role'
        : roleToPath[userRoles[0]] || '/login'
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
