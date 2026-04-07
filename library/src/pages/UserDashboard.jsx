import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyBorrowedBooks } from "../services/issueServices";
import { useToast } from "../context/ToastContext";

export default function UserDashboard() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    currentlyBorrowed: 0,
    strikes: 0,
    booksRead: 0,
  });
  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    fetchDashboardReality();
  }, []);

  const fetchDashboardReality = async () => {
    try {
      setLoading(true);
      const allMyIssues = await getMyBorrowedBooks();

      // 1. Calculate Stats from real data
      const currentlyBorrowed = allMyIssues.filter(
        (i) => i.status === "issued" || i.status === "overdue",
      ).length;
      const booksRead = allMyIssues.filter(
        (i) => i.status === "returned",
      ).length;

      setStats({
        totalBorrowed: allMyIssues.length,
        currentlyBorrowed: currentlyBorrowed,
        strikes: user?.strikes || 0,
        booksRead: booksRead,
      });

      // 2. Format Recent Books for the table
      const formattedBooks = allMyIssues.slice(0, 5).map((issue) => ({
        id: issue._id,
        title: issue.book?.title || "Unknown Title",
        author: issue.book?.author || "Unknown Author",
        dueDate: new Date(issue.dueDate).toLocaleDateString(),
        returnedDate: issue.returnDate
          ? new Date(issue.returnDate).toLocaleDateString()
          : null,
        status: issue.status === "issued" ? "borrowed" : issue.status,
        rawDueDate: issue.dueDate, // kept for the daysLeft calculation
      }));

      setRecentBooks(formattedBooks);
    } catch (err) {
      showError(err || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h3>Loading your library profile... 📚</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Welcome back, {user?.username}! 👋</div>
        <div className="page-subtitle">
          Here's your library activity overview
        </div>
      </div>

      {/* Strike Warning */}
      {stats.strikes > 0 && (
        <div className="alert alert-warning mb-20">
          <div className="flex items-center gap-15">
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <div>
              <strong>Warning: You have {stats.strikes} strike(s)</strong>
              <p style={{ marginTop: "5px", fontSize: "13px" }}>
                {stats.strikes >= 3
                  ? "Your borrowing privileges have been suspended. Please contact the admin."
                  : `${3 - stats.strikes} more strike(s) and your account will be suspended.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.currentlyBorrowed}</div>
          <div className="stat-label">Currently Borrowed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalBorrowed}</div>
          <div className="stat-label">Total History</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.booksRead}</div>
          <div className="stat-label">Books Returned</div>
        </div>
        <div className="stat-card">
          <div
            className="stat-value"
            style={{ color: stats.strikes > 0 ? "#e74c3c" : "#27ae60" }}
          >
            {stats.strikes}
          </div>
          <div className="stat-label">Strikes</div>
        </div>
      </div>

      {/* Recent Books */}
      <div className="card">
        <div className="card-header">Latest Transactions</div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Due Date / Returned</th>
                <th>Days Left</th>
              </tr>
            </thead>
            <tbody>
              {recentBooks.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No recent books found.
                  </td>
                </tr>
              ) : (
                recentBooks.map((book) => {
                  const daysLeft =
                    book.status === "borrowed" || book.status === "overdue"
                      ? getDaysRemaining(book.rawDueDate)
                      : null;
                  return (
                    <tr key={book.id}>
                      <td style={{ fontWeight: 600 }}>{book.title}</td>
                      <td>{book.author}</td>
                      <td>
                        <span
                          className={
                            book.status === "borrowed" ||
                            book.status === "issued"
                              ? "badge badge-info"
                              : book.status === "returned"
                                ? "badge badge-success"
                                : "badge badge-danger"
                          }
                        >
                          {book.status}
                        </span>
                      </td>
                      <td>
                        {book.returnedDate ? book.returnedDate : book.dueDate}
                      </td>
                      <td>
                        {daysLeft !== null && (
                          <span
                            className={
                              daysLeft < 0
                                ? "badge badge-danger"
                                : daysLeft <= 3
                                  ? "badge badge-warning"
                                  : "badge badge-success"
                            }
                          >
                            {daysLeft < 0
                              ? `${Math.abs(daysLeft)} days overdue`
                              : `${daysLeft} days left`}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div
        className="card mt-20"
        style={{ background: "#d6eaf8", borderLeft: "4px solid #3498db" }}
      >
        <h3 style={{ marginBottom: "10px", color: "#2c3e50" }}>
          📖 Borrowing Guidelines
        </h3>
        <ul style={{ paddingLeft: "20px", color: "#34495e" }}>
          <li>Maximum 3 books can be borrowed at a time</li>
          <li>Books must be returned within 14 days</li>
          <li>Late returns result in strikes (1 strike per overdue book)</li>
          <li>Damaged books result in 2 strikes</li>
          <li>3 strikes will suspend your borrowing privileges</li>
        </ul>
      </div>
    </div>
  );
}
