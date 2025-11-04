import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ClaimsListPage from "./pages/ClaimsListPage";
import CreateClaimPage from "./pages/CreateClaimPage";
import ClaimDetailPage from "./pages/ClaimDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      {/* Home/Landing Page */}
      <Route path="/" element={<HomePage />} />

      {/* Guest Routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Public Routes */}
      <Route path="/claims" element={<ClaimsListPage />} />
      <Route path="/claims/:id" element={<ClaimDetailPage />} />

      {/* Protected Create Route */}
      <Route
        path="/claims/new"
        element={
          <ProtectedRoute>
            <CreateClaimPage />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
