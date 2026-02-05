import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import FacultyLogin from './pages/FacultyLogin';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import NonEnrolledDashboard from './pages/NonEnrolledDashboard';
import StudentQueue from './pages/StudentQueue';
import QueueManagement from './pages/QueueManagement';
import MyQueue from './pages/MyQueue';
import AdminPortal from './pages/AdminPortal';
import QueueView from './pages/QueueView';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl text-indigo-600">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/student-login" />;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl text-indigo-600">Loading...</div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// Enrollment Route Component (redirect non-enrolled students to limited dashboard)
const EnrollmentRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl text-indigo-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/student-login" />;
  
  // If user is a student and not enrolled, redirect to non-enrolled dashboard
  if (user?.role === 'student' && !user?.isEnrolled) {
    return <Navigate to="/non-enrolled-dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Public Queue View Route - No authentication needed */}
          <Route path="/queue/view/:queueNumber" element={<QueueView />} />
          
          <Route 
            path="/student-login" 
            element={
              <PublicRoute>
                <StudentLogin />
              </PublicRoute>
            } 
          />
          <Route 
            path="/faculty-login" 
            element={
              <PublicRoute>
                <FacultyLogin />
              </PublicRoute>
            } 
          />
          <Route 
            path="/admin-login" 
            element={
              <PublicRoute>
                <AdminLogin />
              </PublicRoute>
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <EnrollmentRoute>
                  <Dashboard />
                </EnrollmentRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/non-enrolled-dashboard"
            element={
              <ProtectedRoute>
                <NonEnrolledDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/queue/join"
            element={
              <ProtectedRoute>
                <StudentQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/queue/my-queue"
            element={
              <ProtectedRoute>
                <MyQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/queue/manage"
            element={
              <ProtectedRoute>
                <QueueManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/portal"
            element={
              <ProtectedRoute>
                <AdminPortal />
              </ProtectedRoute>
            }
          />
          {/* Redirect old login route to student login */}
          <Route path="/login" element={<Navigate to="/student-login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
