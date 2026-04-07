import { useState, useEffect } from "react";
import { getAdminStats } from "../services/adminServices"; // Adjust path if needed
import { useToast } from "../context/ToastContext";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    booksIssued: 0,
    overdueBooks: 0,
    totalStrikes: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();

      // Setting real data from backend
      setStats(data.stats);

      // Map backend activity to match UI structure
      // Backend provides: { book: {title}, student: {username}, status, createdAt }
      const formattedActivity = data.recentActivity.map((act) => ({
        id: act._id,
        type:
          act.status === "returned"
            ? "return"
            : act.status === "issued"
              ? "borrow"
              : act.status,
        user: act.student?.username || "Unknown User",
        book: act.book?.title || "Unknown Book",
        timestamp: new Date(act.createdAt).toLocaleString(),
      }));

      setRecentActivity(formattedActivity);
    } catch (err) {
      showError(err || "Failed to fetch reality data, dude!");
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "borrow":
        return "📤";
      case "return":
        return "📥";
      case "strike":
        return "⚠️";
      case "overdue":
        return "⏰";
      default:
        return "📋";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "borrow":
        return "#3498db";
      case "return":
        return "#27ae60";
      case "strike":
        return "#e74c3c";
      case "overdue":
        return "#f39c12";
      default:
        return "#95a5a6";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>Loading Reality... 📊</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Admin Dashboard 📊</div>
        <div className="page-subtitle">
          Overview of library management system
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalBooks}</div>
          <div className="stat-label">Total Books</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.booksIssued}</div>
          <div className="stat-label">Books Issued</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#e74c3c" }}>
            {stats.overdueBooks}
          </div>
          <div className="stat-label">Overdue Books</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#f39c12" }}>
            {stats.totalStrikes}
          </div>
          <div className="stat-label">Total Strikes</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">Recent Activity</div>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {recentActivity.length === 0 ? (
              <p style={{ padding: "20px", color: "#7f8c8d" }}>
                No recent activity found.
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    padding: "15px",
                    borderLeft: `4px solid ${getActivityColor(activity.type)}`,
                    marginBottom: "10px",
                    background: "#f8f9fa",
                    borderRadius: "5px",
                  }}
                >
                  <div className="flex items-center gap-10 mb-10">
                    <span style={{ fontSize: "24px" }}>
                      {getActivityIcon(activity.type)}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, color: "#2c3e50" }}>
                        {activity.user}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#7f8c8d",
                          marginTop: "3px",
                        }}
                      >
                        {activity.book && `Book: ${activity.book}`}
                        {activity.reason && `Reason: ${activity.reason}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#95a5a6" }}>
                    {activity.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">Quick Actions</div>
          <div
            className="flex"
            style={{ flexDirection: "column", gap: "10px" }}
          >
            <a
              href="/admin/books"
              className="btn btn-primary"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              📚 Manage Books
            </a>
            <a
              href="/admin/users"
              className="btn btn-success"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              👥 Manage Users
            </a>
            <a
              href="/admin/issued"
              className="btn btn-secondary"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              📤 View Issued Books
            </a>
            <a
              href="/admin/strikes"
              className="btn btn-danger"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              ⚠️ Manage Strikes
            </a>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.overdueBooks > 0 && (
        <div className="alert alert-warning mt-20">
          <strong>⚠️ Attention:</strong> There are {stats.overdueBooks} overdue
          books.
          <a
            href="/admin/issued"
            style={{
              marginLeft: "10px",
              color: "#2980b9",
              textDecoration: "underline",
            }}
          >
            View Details
          </a>
        </div>
      )}
    </div>
  );
}
