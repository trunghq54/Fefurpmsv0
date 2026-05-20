import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import ProposalSubmission from './components/ProposalSubmission';
import ReviewerInterface from './components/ReviewerInterface';
import MeetingScheduler from './components/MeetingScheduler';
import Login from './components/Login';

export default function App() {
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);

  const handleLogout = () => setUser(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login onLogin={setUser} />} />
        <Route
          path="/admin"
          element={user?.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
        />
        <Route
          path="/staff"
          element={user?.role === 'staff' ? <StaffDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
        />
        <Route
          path="/faculty"
          element={user?.role === 'faculty' ? <ProposalSubmission user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
        />
        <Route
          path="/reviewer"
          element={user?.role === 'reviewer' ? <ReviewerInterface user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
        />
        <Route
          path="/meetings"
          element={user?.role === 'admin' ? <MeetingScheduler user={user} /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
