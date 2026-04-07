import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { getAllUsers, manageUserStrikes } from "../services/adminServices";

export default function AdminStrikes() {
  const [strikeHistory, setStrikeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState("all");
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchStrikeReality();
  }, []);

  const fetchStrikeReality = async () => {
    try {
      setLoading(true);
      const users = await getAllUsers();

      // Filter only students who have at least one strike record
      // Map them into a flat "History" format for the table
      const history = [];
      users
        .filter((u) => u.userType !== "admin")
        .forEach((user) => {
          if (user.strikeReasons && user.strikeReasons.length > 0) {
            user.strikeReasons.forEach((strike, index) => {
              history.push({
                id: `${user._id}-${index}`, // Unique key
                userId: user._id,
                userName: user.username,
                userEmail: user.useremail,
                reason: strike.reason,
                strikeCount: 1, // Each reason entry represents 1 strike event
                addedBy: strike.addedBy || "System",
                date: strike.createdAt || user.updatedAt,
                status: user.strikes > 0 ? "active" : "removed",
              });
            });
          }
        });

      // Sort by latest date first
      setStrikeHistory(
        history.sort((a, b) => new Date(b.date) - new Date(a.date)),
      );
    } catch (error) {
      showError(error || "Failed to fetch strike history");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStrike = async (userId, userName) => {
    if (window.confirm(`Remove one strike from ${userName}?`)) {
      try {
        await manageUserStrikes(userId, { action: "remove" });
        showSuccess("Strike removed successfully");
        fetchStrikeReality();
      } catch (error) {
        showError(error || "Failed to remove strike");
      }
    }
  };

  const filteredHistory =
    filterUser === "all"
      ? strikeHistory
      : strikeHistory.filter((s) => s.userId === filterUser);

  const uniqueUsers = Array.from(
    new Set(strikeHistory.map((s) => s.userId)),
  ).map((id) => strikeHistory.find((s) => s.userId === id));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">User Strikes ⚠️</div>
        <div className="page-subtitle">
          Monitor and manage user penalties from reality
        </div>
      </div>

      {/* Real Stats */}
      <div className="grid-3 mb-20">
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#e74c3c" }}>
            {strikeHistory.filter((s) => s.status === "active").length}
          </div>
          <div className="stat-label">Total Active Strikes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#f39c12" }}>
            {
              new Set(
                strikeHistory
                  .filter((s) => s.status === "active")
                  .map((s) => s.userId),
              ).size
            }
          </div>
          <div className="stat-label">Users Warned/Suspended</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#3498db" }}>
            {strikeHistory.filter((s) => s.status === "removed").length}
          </div>
          <div className="stat-label">Resolved Penalties</div>
        </div>
      </div>

      {/* Filter */}
      <div className="card mb-20">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Filter by User</label>
          <select
            className="form-select"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <option value="all">All Users</option>
            {uniqueUsers.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.userName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Strike History Table */}
      <div className="card">
        <div className="card-header">Live Penalty Log</div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Reason</th>
                <th>Count</th>
                <th>Logged By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    Fetching history...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No strike history found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((strike) => (
                  <tr key={strike.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{strike.userName}</div>
                      <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                        {strike.userEmail}
                      </div>
                    </td>
                    <td style={{ maxWidth: "250px" }}>{strike.reason}</td>
                    <td>
                      <span className="strike-badge">
                        <span className="strike-count">
                          {strike.strikeCount}
                        </span>
                        {strike.strikeCount === 1 ? "Strike" : "Strikes"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          strike.addedBy === "System"
                            ? "badge badge-info"
                            : "badge badge-warning"
                        }
                      >
                        {strike.addedBy}
                      </span>
                    </td>
                    <td>{new Date(strike.date).toLocaleDateString()}</td>
                    <td>
                      {strike.status === "active" && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() =>
                            handleRemoveStrike(strike.userId, strike.userName)
                          }
                        >
                          ➖ Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Information Guides */}
      <div className="grid-2 mt-20">
        <div
          className="card"
          style={{ background: "#fadbd8", borderLeft: "4px solid #e74c3c" }}
        >
          <h3
            style={{ marginBottom: "10px", color: "#2c3e50", fontSize: "16px" }}
          >
            ⚠️ Strike Reasons
          </h3>
          <ul
            style={{ paddingLeft: "20px", color: "#34495e", fontSize: "14px" }}
          >
            <li>
              <strong>1 Strike:</strong> Book returned after due date
            </li>
            <li>
              <strong>2 Strikes:</strong> Book returned damaged
            </li>
            <li>
              <strong>Manual:</strong> Admin discretion for policy violations
            </li>
          </ul>
        </div>
        <div
          className="card"
          style={{ background: "#d6eaf8", borderLeft: "4px solid #3498db" }}
        >
          <h3
            style={{ marginBottom: "10px", color: "#2c3e50", fontSize: "16px" }}
          >
            📋 Suspension Policy
          </h3>
          <ul
            style={{ paddingLeft: "20px", color: "#34495e", fontSize: "14px" }}
          >
            <li>Users reaching 3 active strikes are suspended</li>
            <li>Suspended accounts cannot borrow new items</li>
            <li>Admin must manually remove strikes to restore access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
