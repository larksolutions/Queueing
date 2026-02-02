import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import FacultyLogin from './pages/FacultyLogin';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import StudentQueue from './pages/StudentQueue';
import QueueManagement from './pages/QueueManagement';
import MyQueue from './pages/MyQueue';
import AdminPortal from './pages/AdminPortal';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
                <Dashboard />
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
