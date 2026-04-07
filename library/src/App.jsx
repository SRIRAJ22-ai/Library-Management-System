import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import AuthPage from './pages/AuthPage';

// User Pages
import UserDashboard from './pages/UserDashboard';
import BrowseBooks from './pages/BrowseBooks';
import MyBooks from './pages/MyBooks';
import UserProfile from './pages/UserProfile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminBooks from './pages/AdminBooks';
import AdminUsers from './pages/AdminUsers';
import AdminIssued from './pages/AdminIssued';
import AdminStrikes from './pages/AdminStrikes';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/books"
              element={
                <ProtectedRoute>
                  <BrowseBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-books"
              element={
                <ProtectedRoute>
                  <MyBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute adminOnly>
                  <AdminBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/issued"
              element={
                <ProtectedRoute adminOnly>
                  <AdminIssued />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/strikes"
              element={
                <ProtectedRoute adminOnly>
                  <AdminStrikes />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
