import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import ApproverDashboard from './pages/ApproverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

// Automatic routing based on role
const RoleBasedRedirect = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;

  if (user.role === 'Event Coordinator') return <Navigate to="/coordinator" />;
  if (user.role === 'Admin/ITC') return <Navigate to="/admin" />;

  // HOD, Dean, Institutional Head use ApproverDashboard
  return <Navigate to="/approver" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<RoleBasedRedirect />} />

        {/* Dashboard Routes wrapped in Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/coordinator" element={
            <PrivateRoute allowedRoles={['Event Coordinator']}>
              <CoordinatorDashboard />
            </PrivateRoute>
          } />

          <Route path="/create-event" element={
            <PrivateRoute allowedRoles={['Event Coordinator']}>
              <CreateEvent />
            </PrivateRoute>
          } />

          <Route path="/approver" element={
            <PrivateRoute allowedRoles={['HOD', 'Dean', 'Institutional Head']}>
              <ApproverDashboard />
            </PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['Admin/ITC']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
