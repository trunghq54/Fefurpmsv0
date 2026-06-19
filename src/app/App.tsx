import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider, useAuth, roleToPath } from '../contexts/AuthContext'
import Login from './components/Login'
import SelectRole from './components/SelectRole'
import ChangePassword from './components/ChangePassword'
import ProtectedRoute from './components/ProtectedRoute'

// Route nặng → lazy-load để tách khỏi bundle chính (AdminDashboard kéo theo recharts).
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const StaffDashboard = lazy(() => import('./components/StaffDashboard'))
const ProposalSubmission = lazy(() => import('./components/ProposalSubmission'))
const ReviewerInterface = lazy(() => import('./components/ReviewerInterface'))
const MeetingsOverview = lazy(() => import('./components/MeetingsOverview'))
const UserGuide = lazy(() => import('./components/UserGuide'))
const ContractManagement = lazy(() => import('./components/ContractManagement'))

function AppRoutes() {
  const { user, logout, isAuthenticated, activeRole, roles } = useAuth()
  const legacyUser = user ? { role: activeRole || user.accountType, name: user.fullName } : { role: '', name: '' }

  const loggedInTarget = () => {
    if (!user) return '/login'
    if (user.mustChangePassword) return '/change-password'
    if (activeRole) return roleToPath[activeRole]
    if (roles.length > 1) return '/select-role'
    return roleToPath[roles[0]] || '/admin'
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải…</div>}>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={loggedInTarget()} replace /> : <Login />}
      />
      <Route path="/select-role" element={<ProtectedRoute><SelectRole /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route
        path="/admin"
        element={<ProtectedRoute roles={['Admin']}><AdminDashboard user={legacyUser} onLogout={logout} /></ProtectedRoute>}
      />
      <Route
        path="/staff"
        element={<ProtectedRoute roles={['Staff']}><StaffDashboard user={legacyUser} onLogout={logout} /></ProtectedRoute>}
      />
      <Route
        path="/faculty"
        element={<ProtectedRoute roles={['Faculty']}><ProposalSubmission user={legacyUser} onLogout={logout} /></ProtectedRoute>}
      />
      <Route
        path="/reviewer"
        element={<ProtectedRoute roles={['ReviewCommittee']}><ReviewerInterface user={legacyUser} onLogout={logout} /></ProtectedRoute>}
      />
      <Route
        path="/meetings"
        element={<ProtectedRoute roles={['Admin']}><MeetingsOverview /></ProtectedRoute>}
      />
      <Route path="/guide" element={<ProtectedRoute><UserGuide /></ProtectedRoute>} />
      <Route
        path="/contracts"
        element={<ProtectedRoute roles={['Staff', 'Admin', 'Faculty']}><ContractManagement /></ProtectedRoute>}
      />
    </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
