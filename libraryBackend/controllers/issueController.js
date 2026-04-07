const Issue = require('../models/Issue');
const Book = require('../models/Book');
const User = require('../models/User');

// --- ADMIN ACTIONS ---

// @desc    Admin issues a book to a student manually
exports.issueBook = async (req, res) => {
  const { bookId, studentId, dueDate } = req.body;
  try {
    const book = await Book.findById(bookId);
    const student = await User.findById(studentId);

    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book not available' });
    }

    if (!student || student.strikes >= 3) {
      return res.status(400).json({ message: 'Student is suspended due to strikes' });
    }

    const issue = await Issue.create({
      book: bookId,
      student: studentId,
      dueDate: dueDate || undefined 
    });

    book.availableCopies -= 1;
    await book.save();

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin processes a return (Handles Strikes & Fines)
exports.returnBook = async (req, res) => {
  const { condition, addStrike, strikeReason } = req.body; 
  try {
    const issue = await Issue.findById(req.params.id).populate('book student');
    if (!issue || issue.status === 'returned') {
      return res.status(404).json({ message: 'Issue record not found or already returned' });
    }

    const student = await User.findById(issue.student._id);
    const book = await Book.findById(issue.book._id);

    issue.returnDate = Date.now();
    issue.status = 'returned';

    // Strike Logic
    if (issue.isLate) {
      student.strikes += 1;
      student.strikeReasons.push({ reason: `Late return: ${book.title}` });
    }
    if (condition === 'damaged') {
      student.strikes += 2;
      student.strikeReasons.push({ reason: `Damaged book: ${book.title}` });
    }
    if (addStrike) {
      student.strikes += 1;
      student.strikeReasons.push({ reason: strikeReason || 'Admin discretion' });
    }

    book.availableCopies += 1;

    await issue.save();
    await student.save();
    await book.save();

    res.json({ message: 'Book returned and penalties processed', strikes: student.strikes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin gets all issued books
exports.getAllIssuedBooks = async (req, res) => {
  try {
    const issues = await Issue.find().populate('book student', 'title author username useremail');
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// --- STUDENT ACTIONS ---

// @desc    Student borrows a book themselves from Browse page
exports.borrowBook = async (req, res) => {
  try {
    const book = await Book.findById(req.body.bookId);
    const student = await User.findById(req.user._id);

    if (!book || book.availableCopies <= 0) 
      return res.status(400).json({ message: 'Book not available' });

    if (student.strikes >= 3)
      return res.status(400).json({ message: 'You are suspended from borrowing' });

    const activeIssues = await Issue.countDocuments({ student: req.user._id, status: 'issued' });
    if (activeIssues >= 3) 
      return res.status(400).json({ message: 'Limit reached: You can only borrow 3 books at a time' });

    const issue = await Issue.create({
      book: req.body.bookId,
      student: req.user._id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Default 14 days
    });

    book.availableCopies -= 1;
    await book.save();
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Student gets their own borrowing history
exports.getMyBooks = async (req, res) => {
  try {
    const myBooks = await Issue.find({ student: req.user._id })
      .populate('book', 'title author isbn')
      .sort({ createdAt: -1 });
    res.json(myBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Student renews a book for 7 more days
exports.renewBook = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue || issue.status !== 'issued') 
      return res.status(400).json({ message: 'Cannot renew this book' });

    if (new Date() > issue.dueDate)
      return res.status(400).json({ message: 'Overdue books cannot be renewed' });

    // Add 7 days to current due date
    issue.dueDate = new Date(issue.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    await issue.save();
    res.json({ message: 'Renewed successfully', newDueDate: issue.dueDate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};