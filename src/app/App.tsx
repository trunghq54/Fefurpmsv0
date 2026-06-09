import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider, useAuth, roleToPath } from '../contexts/AuthContext'
import AdminDashboard from './components/AdminDashboard'
import StaffDashboard from './components/StaffDashboard'
import ProposalSubmission from './components/ProposalSubmission'
import ReviewerInterface from './components/ReviewerInterface'
import MeetingsOverview from './components/MeetingsOverview'
import UserGuide from './components/UserGuide'
import Login from './components/Login'
import SelectRole from './components/SelectRole'
import ChangePassword from './components/ChangePassword'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes() {
  const { user, logout, isAuthenticated, activeRole, roles } = useAuth()
  const legacyUser = user ? { role: activeRole || user.accountType, name: user.fullName } : null

  const loggedInTarget = () => {
    if (!user) return '/login'
    if (user.mustChangePassword) return '/change-password'
    if (activeRole) return roleToPath[activeRole]
    if (roles.length > 1) return '/select-role'
    return roleToPath[roles[0]] || '/admin'
  }

  return (
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
        element={<ProtectedRoute roles={['Administrator']}><AdminDashboard user={legacyUser} onLogout={logout} /></ProtectedRoute>}
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
        element={<ProtectedRoute roles={['Administrator']}><MeetingsOverview /></ProtectedRoute>}
      />
      <Route path="/guide" element={<ProtectedRoute><UserGuide /></ProtectedRoute>} />
    </Routes>
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
