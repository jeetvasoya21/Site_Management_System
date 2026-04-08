/**
 * App Component
 * Main application with routing setup
 * Integrates AuthProvider, AppProvider, ToastProvider, and Router configuration
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/ToastSystem';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import { AppLayout } from './components/layout';
import Dashboard from './pages/dashboard/Dashboard';
import Projects from './pages/projects/Projects';
import ProjectDetails from './pages/projects/ProjectDetails';
import Tasks from './pages/tasks/Tasks';
import Workforce from './pages/workforce/Workforce';
import Inventory from './pages/inventory/Inventory';
import Finance from './pages/finance/Finance';
import VendorManagement from './pages/vendors/VendorManagement';
import Procurement from './pages/procurement/Procurement';
import MaterialIssue from './pages/inventory/MaterialIssue';
import Assignments from './pages/tasks/Assignments';
import Attendance from './pages/workforce/Attendance';
import ProjectTeam from './pages/vendors/ProjectTeam';
import WorkerPortal from './pages/worker/WorkerPortal';
import Notifications from './pages/Notifications';
import Reports from './pages/finance/Reports';
import LeaveApplication from './pages/worker/LeaveApplication';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerAttendance from './pages/worker/WorkerAttendance';
import WorkerSalary from './pages/worker/WorkerSalary';
import SignUp from './pages/auth/SignUp';
import AuthLogin from './pages/auth/AuthLogin';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  // Redirect authenticated users to correct dashboard based on role
  const defaultHome = () => {
    if (!user) return '/login';
    if (user.role === 'Worker') return '/worker';
    return '/';
  };

  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to={defaultHome()} replace /> : <SignUp />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultHome()} replace /> : <AuthLogin />}
      />
      <Route
        path="/verify-email"
        element={isAuthenticated ? <Navigate to={defaultHome()} replace /> : <VerifyEmail />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to={defaultHome()} replace /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={isAuthenticated ? <Navigate to={defaultHome()} replace /> : <ResetPassword />}
      />

      {/* Worker Routes */}
      <Route
        path="/worker"
        element={
          <ProtectedRoute allowedRoles={['Worker']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WorkerDashboard />} />
        <Route path="attendance" element={<WorkerAttendance />} />
        <Route path="salary" element={<WorkerSalary />} />
        <Route path="leave" element={<LeaveApplication />} />
      </Route>

      {/* Protected Routes — Admin, Project_Manager, Site_Engineer */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Project_Manager', 'Site_Engineer']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="workforce" element={<Workforce />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="inventory" element={<Inventory />} />
        <Route
          path="vendors"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Project_Manager']}>
              <VendorManagement />
            </ProtectedRoute>
          }
        />
        <Route path="procurement" element={<Procurement />} />
        <Route path="material-issue" element={<MaterialIssue />} />
        <Route
          path="project-team"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Project_Manager']}>
              <ProjectTeam />
            </ProtectedRoute>
          }
        />
        <Route
          path="finance"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Project_Manager']}>
              <Finance />
            </ProtectedRoute>
          }
        />
        <Route path="leaves" element={<LeaveApplication />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
        {/* Legacy worker-portal path for admin overview */}
        <Route
          path="worker-portal"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Project_Manager', 'Site_Engineer']}>
              <WorkerPortal />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? defaultHome() : '/login'} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
