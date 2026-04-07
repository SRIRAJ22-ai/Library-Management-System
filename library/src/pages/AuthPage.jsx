import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
// Import the specific service functions
import { login as loginApi, register as registerApi } from "../services/authServices";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // 1. Map frontend fields to match our Node.js Backend Model
      const payload = isLogin
        ? { useremail: formData.email, userPassword: formData.password }
        : {
            username: formData.name,
            useremail: formData.email,
            userPassword: formData.password,
            userType: "student", // Changed to student for standard registration
          };

      // 2. Use the specialized services from auth.js
      let data;
      if (isLogin) {
        data = await loginApi(payload);

        // Handle successful login
        login(data); // data contains token, username, userType, etc.
        showSuccess(`Welcome back, ${data.username}!`);

        if (data.userType === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        await registerApi(payload);

        // Handle successful registration
        showSuccess("Registration successful! Please login.");
        setIsLogin(true);
        setFormData({ email: "", password: "", name: "", confirmPassword: "" });
      }
    } catch (err) {
      // The error message comes from our try/catch in auth.js
      setError(err || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>📚</div>
          <div className="auth-title">LibraryMS</div>
          <div className="auth-subtitle">College Library Management System</div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "25px",
            background: "#ecf0f1",
            padding: "5px",
            borderRadius: "8px",
          }}
        >
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
              setFormData({
                email: "",
                password: "",
                name: "",
                confirmPassword: "",
              });
            }}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              background: isLogin ? "#3498db" : "transparent",
              color: isLogin ? "white" : "#7f8c8d",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
              setFormData({
                email: "",
                password: "",
                name: "",
                confirmPassword: "",
              });
            }}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              background: !isLogin ? "#3498db" : "transparent",
              color: !isLogin ? "white" : "#7f8c8d",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Confirm your password"
              />
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px" }}
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "13px",
            color: "#7f8c8d",
          }}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFormData({
                email: "",
                password: "",
                name: "",
                confirmPassword: "",
              });
            }}
            style={{ color: "#3498db", cursor: "pointer", fontWeight: 600 }}
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
