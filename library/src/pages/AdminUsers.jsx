import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import {
  getAllUsers,
  manageUserStrikes,
  deleteUser,
} from "../services/adminServices";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      showError(error || "Failed to fetch reality data");
    } finally {
      setLoading(false);
    }
  };

  const handleStrikeAction = async (userId, userName, action) => {
    const confirmMsg =
      action === "add"
        ? `Add a strike to ${userName}?`
        : `Remove a strike from ${userName}?`;

    if (window.confirm(confirmMsg)) {
      try {
        const reason =
          action === "add"
            ? window.prompt("Reason for strike:")
            : "Admin removal";
        if (action === "add" && !reason) return;

        await manageUserStrikes(userId, { action, reason });
        showSuccess(`Strikes updated for ${userName}`);
        fetchUsers();
      } catch (error) {
        showError(error || "Strike action failed");
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await deleteUser(userId);
        showSuccess("User deleted successfully");
        fetchUsers();
      } catch (error) {
        showError(error || "Failed to delete user");
      }
    }
  };

  // Filter out admins and apply search term
  const filteredUsers = users.filter(
    (user) =>
      user.userType !== "admin" &&
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.useremail?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Manage Users 👥</div>
        <div className="page-subtitle">
          View and manage all registered users
        </div>
      </div>

      <div className="card mb-20">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Search Users</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Books Issued</th>
                <th>Strikes</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    Syncing with database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td style={{ fontWeight: 600 }}>{user.username}</td>
                    <td>{user.useremail}</td>
                    <td>
                      <span className="badge badge-info">
                        {user.booksIssued || 0}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <span
                          className="badge badge-success"
                          style={{
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {user.strikes || 0}
                        </span>
                        {user.strikes > 0 && (
                          <span className="badge badge-danger">Strikes</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={
                          user.strikes >= 3
                            ? "badge badge-danger"
                            : "badge badge-success"
                        }
                      >
                        {user.strikes >= 3 ? "suspended" : "active"}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            handleStrikeAction(user._id, user.username, "add")
                          }
                          disabled={user.strikes >= 3}
                        >
                          ➕ Strike
                        </button>

                        {user.strikes > 0 && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              handleStrikeAction(
                                user._id,
                                user.username,
                                "remove",
                              )
                            }
                          >
                            ➖ Strike
                          </button>
                        )}

                        <button className="btn btn-sm btn-secondary">
                          {user.strikes >= 3 ? "✅ Activate" : "🚫 Suspend"}
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDeleteUser(user._id, user.username)
                          }
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="card mt-20"
        style={{ background: "#fadbd8", borderLeft: "4px solid #e74c3c" }}
      >
        <h3
          style={{ marginBottom: "10px", color: "#2c3e50", fontSize: "16px" }}
        >
          ⚠️ Strike System Information
        </h3>
        <ul
          style={{
            paddingLeft: "20px",
            color: "#34495e",
            fontSize: "14px",
            lineHeight: "1.8",
          }}
        >
          <li>Users get 1 strike for each overdue book</li>
          <li>Users get 2 strikes for returning damaged books</li>
          <li>Users with 3 strikes are automatically suspended</li>
          <li>Strikes can only be removed by admin</li>
          <li>Suspended users cannot borrow any books</li>
        </ul>
      </div>
    </div>
  );
}
