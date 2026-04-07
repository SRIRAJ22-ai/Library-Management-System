import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getAllIssuedBooks, issueBookToStudent, returnBook } from '../services/issueServices';
import { getAllBooks } from '../services/bookServices';
import { getAllUsers } from '../services/adminServices';

export default function AdminIssued() {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [issueForm, setIssueForm] = useState({
    userId: '',
    bookId: '',
    dueDate: ''
  });
  const [returnForm, setReturnForm] = useState({
    condition: 'good',
    addStrike: false,
    strikeReason: ''
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [issuedData, booksData, usersData] = await Promise.all([
        getAllIssuedBooks(),
        getAllBooks(),
        getAllUsers()
      ]);
      setIssuedBooks(issuedData);
      setBooks(booksData.filter(b => b.availableCopies > 0));
      setUsers(usersData.filter(u => u.userType !== 'admin'));
    } catch (error) {
      showError(error || 'Failed to sync with reality');
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    try {
      await issueBookToStudent({
        bookId: issueForm.bookId,
        studentId: issueForm.userId,
        dueDate: issueForm.dueDate
      });
      showSuccess('Book issued successfully!');
      setShowIssueModal(false);
      setIssueForm({ userId: '', bookId: '', dueDate: '' });
      fetchInitialData();
    } catch (error) {
      showError(error || 'Failed to issue book');
    }
  };

  const handleReturnClick = (issue) => {
    setSelectedReturn(issue);
    setReturnForm({
      condition: 'good',
      addStrike: false,
      strikeReason: ''
    });
    setShowReturnModal(true);
  };

  const processReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      await returnBook(selectedReturn._id, returnForm);
      showSuccess('Book return processed successfully!');
      setShowReturnModal(false);
      fetchInitialData();
    } catch (error) {
      showError(error || 'Failed to process return');
    }
  };

  const filteredBooks = issuedBooks.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="page-title">Issued Books 📤</div>
          <div className="page-subtitle">Manage book borrowing and returns</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowIssueModal(true)}>
          ➕ Issue Book
        </button>
      </div>

      <div className="card mb-20">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Filter by Status</label>
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Records</option>
            <option value="issued">Currently Issued</option>
            <option value="overdue">Overdue</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Book</th>
                <th>User</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Fine</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading issued records...</td></tr>
              ) : filteredBooks.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No records found.</td></tr>
              ) : (
                filteredBooks.map(issue => {
                  const daysLeft = getDaysRemaining(issue.dueDate);
                  const isOverdue = daysLeft < 0 && issue.status === 'issued';

                  return (
                    <tr key={issue._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{issue.book?.title}</div>
                        <div style={{ fontSize: '12px', color: '#7f8c8d' }}>{issue.book?.author}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{issue.student?.username}</div>
                        <div style={{ fontSize: '12px', color: '#7f8c8d' }}>{issue.student?.useremail}</div>
                      </td>
                      <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                      <td>{new Date(issue.dueDate).toLocaleDateString()}</td>
                      <td>
                        {issue.status === 'returned' ? (
                          <span className="badge badge-success">Returned</span>
                        ) : isOverdue ? (
                          <span className="badge badge-danger">Overdue ({Math.abs(daysLeft)} days)</span>
                        ) : (
                          <span className="badge badge-warning">{daysLeft} days left</span>
                        )}
                      </td>
                      <td><span style={{ color: issue.fine > 0 ? '#e74c3c' : '#27ae60', fontWeight: 600 }}>₹{issue.fine || 0}</span></td>
                      <td>
                        {issue.status !== 'returned' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleReturnClick(issue)}>
                            📥 Return
                          </button>
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

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="modal-overlay" onClick={() => setShowIssueModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Issue Book</div>
            <form onSubmit={handleIssueSubmit}>
              <div className="form-group">
                <label className="form-label">Select Student</label>
                <select 
                  className="form-select" 
                  required 
                  value={issueForm.userId}
                  onChange={(e) => setIssueForm({...issueForm, userId: e.target.value})}
                >
                  <option value="">Choose a student...</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.useremail})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Select Book</label>
                <select 
                  className="form-select" 
                  required
                  value={issueForm.bookId}
                  onChange={(e) => setIssueForm({...issueForm, bookId: e.target.value})}
                >
                  <option value="">Choose a book...</option>
                  {books.map(b => <option key={b._id} value={b._id}>{b.title} (Available: {b.availableCopies})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={issueForm.dueDate}
                  onChange={(e) => setIssueForm({...issueForm, dueDate: e.target.value})}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowIssueModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Issue Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Book Modal */}
      {showReturnModal && selectedReturn && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Process Return</div>
            <form onSubmit={processReturnSubmit}>
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
                <div style={{ fontWeight: 600 }}>{selectedReturn.book?.title}</div>
                <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Student: {selectedReturn.student?.username}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Book Condition</label>
                <select
                  className="form-select"
                  value={returnForm.condition}
                  onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
                >
                  <option value="good">Good Condition</option>
                  <option value="damaged">Damaged (2 strikes)</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={returnForm.addStrike}
                    onChange={(e) => setReturnForm({ ...returnForm, addStrike: e.target.checked })}
                  />
                  <span>Add Manual Strike</span>
                </label>
              </div>
              {returnForm.addStrike && (
                <div className="form-group">
                  <textarea
                    className="form-input"
                    placeholder="Reason for manual strike..."
                    value={returnForm.strikeReason}
                    onChange={(e) => setReturnForm({ ...returnForm, strikeReason: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Complete Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}