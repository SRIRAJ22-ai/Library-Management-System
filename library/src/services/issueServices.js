import API from './api';

// Admin: Manual Issue & Return
export const issueBookToStudent = async (issueData) => {
  const { data } = await API.post('/issues/issue', issueData);
  return data;
};

export const returnBook = async (issueId, returnData) => {
  const { data } = await API.put(`/issues/${issueId}/return`, returnData);
  return data;
};

export const getAllIssuedBooks = async () => {
  const { data } = await API.get('/issues');
  return data;
};

// Student: Borrow & My Books
export const studentBorrowBook = async (bookId) => {
  const { data } = await API.post('/issues/borrow', { bookId });
  return data;
};

export const getMyBorrowedBooks = async () => {
  const { data } = await API.get('/issues/mybooks');
  return data;
};

export const renewBook = async (issueId) => {
  const { data } = await API.put(`/issues/${issueId}/renew`);
  return data;
};