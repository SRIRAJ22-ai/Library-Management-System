import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { updateProfile as updateProfileApi } from "../services/authServices";

export default function UserProfile() {
  const { user, login } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.useremail || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedData = await updateProfileApi({
        username: formData.name,
        useremail: formData.email,
      });

      // Update the local AuthContext with new user details
      login(updatedData);
      showSuccess("Profile updated successfully!");
    } catch (error) {
      showError(error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      showError("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await updateProfileApi({
        userPassword: formData.newPassword,
      });

      showSuccess("Password changed successfully!");
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      showError(error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Profile 👤</div>
        <div className="page-subtitle">Manage your account settings</div>
      </div>

      {/* Profile Info Card */}
      <div className="card mb-20">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            padding: "20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "8px",
            color: "white",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
              color: "#667eea",
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: "24px", marginBottom: "5px" }}>
              {user?.username}
            </h2>
            <p style={{ opacity: 0.9, marginBottom: "5px" }}>
              {user?.useremail}
            </p>
            <span
              className="badge"
              style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
            >
              {user?.userType === "admin" ? "Administrator" : "Student"}
            </span>
          </div>
        </div>

        {/* Real Stats */}
        <div className="grid-3">
          <div style={{ textAlign: "center", padding: "15px" }}>
            <div
              style={{ fontSize: "28px", fontWeight: 700, color: "#3498db" }}
            >
              {user?.booksRead || 0}
            </div>
            <div
              style={{ fontSize: "13px", color: "#7f8c8d", marginTop: "5px" }}
            >
              Books Read
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "15px" }}>
            <div
              style={{ fontSize: "28px", fontWeight: 700, color: "#27ae60" }}
            >
              {user?.currentlyBorrowed || 0}
            </div>
            <div
              style={{ fontSize: "13px", color: "#7f8c8d", marginTop: "5px" }}
            >
              Currently Borrowed
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "15px" }}>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: user?.strikes > 0 ? "#e74c3c" : "#27ae60",
              }}
            >
              {user?.strikes || 0}
            </div>
            <div
              style={{ fontSize: "13px", color: "#7f8c8d", marginTop: "5px" }}
            >
              Strikes
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Update Profile */}
        <div className="card">
          <div className="card-header">Update Profile Information</div>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header">Change Password</div>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                className="form-input"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
