import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getAllBooks } from "../services/bookServices";
import { studentBorrowBook } from "../services/issueServices";

export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchBooksReality();
  }, [searchTerm, categoryFilter]); // Refetch when filters change

  const fetchBooksReality = async () => {
    try {
      setLoading(true);
      // Using the service that talks to your real Node.js backend
      const data = await getAllBooks(searchTerm, categoryFilter);
      setBooks(data);
    } catch (error) {
      showError(error || "Failed to fetch the catalog, dude!");
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async (bookId) => {
    // 1. Reality Check: Strikes
    if (user?.strikes >= 3) {
      showError(
        "Your account is suspended due to 3+ strikes. Please contact admin.",
      );
      return;
    }

    if (window.confirm("Do you want to borrow this book for 14 days?")) {
      try {
        await studentBorrowBook(bookId);
        showSuccess(
          'Book borrowed successfully! Check "My Books" for the due date.',
        );
        fetchBooksReality(); // Refresh availability counts
      } catch (error) {
        showError(error || "Failed to borrow book");
      }
    }
  };

  // Dynamically get unique categories from the real book tags
  const categories = [
    "all",
    ...new Set(books.flatMap((book) => book.tags || [])),
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Browse Books 📚</div>
        <div className="page-subtitle">
          Find and borrow books from our live collection
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card mb-20">
        <div className="grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Books</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          Loading the library...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {books.map((book) => (
            <div key={book._id} className="card">
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  height: "150px",
                  marginBottom: "15px",
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                }}
              >
                📖
              </div>

              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  marginBottom: "5px",
                  color: "#2c3e50",
                }}
              >
                {book.title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#7f8c8d",
                  marginBottom: "10px",
                }}
              >
                by {book.author}
              </p>

              <div style={{ marginBottom: "15px" }}>
                {book.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-info"
                    style={{ marginRight: "5px" }}
                  >
                    {tag}
                  </span>
                ))}
                <span
                  className={
                    book.availableCopies > 0
                      ? "badge badge-success"
                      : "badge badge-danger"
                  }
                >
                  {book.availableCopies} / {book.totalCopies} available
                </span>
              </div>

              <p
                style={{
                  fontSize: "13px",
                  color: "#7f8c8d",
                  marginBottom: "15px",
                  lineHeight: "1.5",
                  height: "40px",
                  overflow: "hidden",
                }}
              >
                {book.description || "No description available for this book."}
              </p>

              <div
                style={{
                  fontSize: "12px",
                  color: "#95a5a6",
                  marginBottom: "15px",
                }}
              >
                ISBN: {book.isbn}
              </div>

              <button
                className={
                  book.availableCopies > 0
                    ? "btn btn-primary"
                    : "btn btn-secondary"
                }
                style={{ width: "100%" }}
                disabled={book.availableCopies === 0 || user?.strikes >= 3}
                onClick={() => handleBorrowBook(book._id)}
              >
                {book.availableCopies === 0 ? "Not Available" : "Borrow Book"}
              </button>

              {user?.strikes >= 3 && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#e74c3c",
                    marginTop: "10px",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  ⚠️ Borrowing disabled (3+ Strikes)
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && books.length === 0 && (
        <div className="card text-center" style={{ padding: "60px 20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>📭</div>
          <h3 style={{ color: "#7f8c8d" }}>No books found in the reality</h3>
          <p style={{ color: "#95a5a6", marginTop: "10px" }}>
            Try adjusting your search or check back later!
          </p>
        </div>
      )}
    </div>
  );
}
