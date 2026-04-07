import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, user, loading } = useAuth();

  // 1. Show loading screen while checking Auth state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#ecf0f1",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>📚</div>
          <p style={{ color: "#7f8c8d" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // 2. If not logged in, kick back to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 3. ADMIN CHECK: Using 'userType' to match our MongoDB/Backend model
  // If the route requires admin but the user is a student, redirect to student dashboard
  if (adminOnly && user?.userType !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Authorized access: Show the Sidebar and the page content
  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}
