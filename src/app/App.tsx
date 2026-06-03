import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import AdminDashboard from './components/AdminDashboard'
import StaffDashboard from './components/StaffDashboard'
import ProposalSubmission from './components/ProposalSubmission'
import ReviewerInterface from './components/ReviewerInterface'
import MeetingScheduler from './components/MeetingScheduler'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'

const accountTypeToRole: Record<string, string> = {
  Administrator: 'admin',
  Staff: 'staff',
  Faculty: 'faculty',
  ReviewCommittee: 'reviewer',
}

function AppRoutes() {
  const { user, logout, isAuthenticated } = useAuth()
  const legacyUser = user
    ? { role: accountTypeToRole[user.accountType] || 'admin', name: user.fullName }
    : null

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={`/${accountTypeToRole[user?.accountType || ''] || 'admin'}`} replace /> : <Login />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['Administrator']}>
            <AdminDashboard user={legacyUser} onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={['Staff']}>
            <StaffDashboard user={legacyUser} onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty"
        element={
          <ProtectedRoute roles={['Faculty']}>
            <ProposalSubmission user={legacyUser} onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviewer"
        element={
          <ProtectedRoute roles={['ReviewCommittee']}>
            <ReviewerInterface user={legacyUser} onLogout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meetings"
        element={
          <ProtectedRoute roles={['Administrator']}>
            <MeetingScheduler user={legacyUser} />
          </ProtectedRoute>
        }
      />
      <Route path="/change-password" element={<ProtectedRoute><div className="p-8 text-center text-gray-600">Trang đổi mật khẩu (coming soon)</div></ProtectedRoute>} />
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
