import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
} from "../services/bookServices";

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
    totalCopies: 1,
    description: "",
    location: "",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await getAllBooks();
      setBooks(data);
    } catch (error) {
      showError(error || "Failed to load books from reality");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Map 'category' field to the backend 'tags' array
      const bookPayload = {
        ...formData,
        tags: [formData.category],
      };

      if (editingBook) {
        await updateBook(editingBook._id, bookPayload);
        showSuccess("Book updated successfully!");
      } else {
        await addBook(bookPayload);
        showSuccess("Book added successfully!");
      }
      setShowModal(false);
      resetForm();
      fetchBooks();
    } catch (error) {
      showError(error || "Operation failed");
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.tags?.[0] || "", // Pull first tag as category
      isbn: book.isbn,
      totalCopies: book.totalCopies,
      description: book.description || "",
      location: book.location || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await deleteBook(bookId);
        showSuccess("Book deleted successfully!");
        fetchBooks();
      } catch (error) {
        showError(error || "Failed to delete book");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      category: "",
      isbn: "",
      totalCopies: 1,
      description: "",
      location: "",
    });
    setEditingBook(null);
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="page-title">Manage Books 📚</div>
          <div className="page-subtitle">
            Add, edit, or remove books from the library
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          ➕ Add New Book
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            Loading books...
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>ISBN</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No books found in the database.
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book._id}>
                      <td style={{ fontWeight: 600 }}>{book.title}</td>
                      <td>{book.author}</td>
                      <td>
                        <span className="badge badge-info">
                          {book.tags?.[0] || "N/A"}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "12px" }}>
                        {book.isbn}
                      </td>
                      <td>{book.totalCopies}</td>
                      <td>
                        <span
                          className={
                            book.availableCopies > 0
                              ? "badge badge-success"
                              : "badge badge-danger"
                          }
                        >
                          {book.availableCopies}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(book)}
                          style={{ marginRight: "5px" }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(book._id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {editingBook ? "Edit Book" : "Add New Book"}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Book Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Author</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ISBN</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.isbn}
                    onChange={(e) =>
                      setFormData({ ...formData, isbn: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Total Copies</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.totalCopies}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalCopies: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Shelf Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. A-101"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBook ? "Update Book" : "Add Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
