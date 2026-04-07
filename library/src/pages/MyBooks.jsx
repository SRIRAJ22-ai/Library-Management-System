import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getMyBorrowedBooks, renewBook as renewBookApi } from '../services/issueServices';

export default function MyBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchMyBooksReality();
  }, []);

  const fetchMyBooksReality = async () => {
    try {
      setLoading(true);
      const data = await getMyBorrowedBooks();
      // Only show books that are not yet returned
      setBorrowedBooks(data.filter(book => book.status !== 'returned'));
    } catch (error) {
      showError(error || 'Failed to fetch your books');
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

  const handleRenew = async (issueId) => {
    if (window.confirm('Renew this book for 7 more days?')) {
      try {
        await renewBookApi(issueId);
        showSuccess('Book renewed successfully!');
        fetchMyBooksReality(); // Refresh the list
      } catch (error) {
        showError(error || 'Failed to renew book');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '60px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📚</div>
        <p style={{ color: '#7f8c8d' }}>Syncing with library database...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Borrowed Books 📖</div>
        <div className="page-subtitle">Manage your currently borrowed books from reality</div>
      </div>

      {borrowedBooks.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📚</div>
          <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>No books borrowed</h3>
          <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
            Your shelf is empty! Visit the browse page to pick your next read.
          </p>
          <a href="/books" className="btn btn-primary" style={{ textDecoration: 'none' }}>Browse Books</a>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {borrowedBooks.map(item => {
                  const daysLeft = getDaysRemaining(item.dueDate);
                  const isOverdue = daysLeft < 0;
                  
                  return (
                    <tr key={item._id}>
                      <td style={{ fontWeight: 600 }}>{item.book?.title}</td>
                      <td>{item.book?.author}</td>
                      <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                      <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                      <td>
                        {isOverdue ? (
                          <span className="badge badge-danger">
                            Overdue by {Math.abs(daysLeft)} days
                          </span>
                        ) : daysLeft <= 3 ? (
                          <span className="badge badge-warning">
                            Due in {daysLeft} days
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            {daysLeft} days left
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ color: item.fine > 0 ? '#e74c3c' : '#27ae60', fontWeight: 600 }}>
                          ₹{item.fine || 0}
                        </span>
                      </td>
                      <td>
                        {!isOverdue && daysLeft <= 2 && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleRenew(item._id)}
                          >
                            Renew
                          </button>
                        )}
                        {isOverdue && (
                          <span style={{ fontSize: '12px', color: '#e74c3c', fontWeight: 500 }}>
                            Penalty Applied
                          </span>
                        )}
                        {!isOverdue && daysLeft > 2 && (
                          <span style={{ fontSize: '12px', color: '#95a5a6' }}>
                            Too early to renew
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="card mt-20" style={{ background: '#fff3cd', borderLeft: '4px solid #f39c12' }}>
        <h3 style={{ marginBottom: '10px', color: '#2c3e50', fontSize: '16px' }}>⏰ Important Reminders</h3>
        <ul style={{ paddingLeft: '20px', color: '#34495e', fontSize: '14px', lineHeight: '1.6' }}>
          <li>Books can be renewed once, starting 2 days before the due date.</li>
          <li>Late return penalty: ₹5 per day.</li>
          <li>Overdue books will result in 1 strike per book.</li>
          <li>Returning damaged books may result in 2 strikes.</li>
        </ul>
      </div>
    </div>
  );
}