import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorSearchPage from './pages/DonorSearchPage';
import BloodRequestsPage from './pages/BloodRequestsPage';
import BloodRequestDetailPage from './pages/BloodRequestDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Authenticated Pages
import UserDashboardPage from './pages/UserDashboardPage';
import DonorProfilePage from './pages/DonorProfilePage';
import CreateBloodRequestPage from './pages/CreateBloodRequestPage';
import MyRequestsPage from './pages/MyRequestsPage';
import ContactInboxPage from './pages/ContactInboxPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              {/* Public Routes */}
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="donors" element={<DonorSearchPage />} />
              <Route path="requests" element={<BloodRequestsPage />} />
              <Route path="requests/:id" element={<BloodRequestDetailPage />} />

              {/* Protected User Routes */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="donor-profile"
                element={
                  <ProtectedRoute>
                    <DonorProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="create-request"
                element={
                  <ProtectedRoute>
                    <CreateBloodRequestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="my-requests"
                element={
                  <ProtectedRoute>
                    <MyRequestsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="inbox"
                element={
                  <ProtectedRoute>
                    <ContactInboxPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/verifications"
                element={
                  <AdminRoute>
                    <AdminVerificationsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <AdminRoute>
                    <AdminUsersPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/requests"
                element={
                  <AdminRoute>
                    <AdminRequestsPage />
                  </AdminRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
