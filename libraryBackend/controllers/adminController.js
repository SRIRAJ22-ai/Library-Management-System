const Book = require('../models/Book');
const User = require('../models/User');
const Issue = require('../models/Issue');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments({ userType: 'student' });
    const booksIssued = await Issue.countDocuments({ status: 'issued' });
    const overdueBooks = await Issue.countDocuments({ status: 'overdue' });
    
    // Calculate total strikes across all users
    const usersWithStrikes = await User.find({ strikes: { $gt: 0 } });
    const totalStrikes = usersWithStrikes.reduce((acc, user) => acc + user.strikes, 0);

    // Get Recent Activity (Latest 5 issues/returns)
    const recentActivity = await Issue.find()
      .populate('book', 'title')
      .populate('student', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: { totalBooks, totalUsers, booksIssued, overdueBooks, totalStrikes },
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};