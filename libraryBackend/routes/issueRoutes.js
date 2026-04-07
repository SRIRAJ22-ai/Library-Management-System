const express = require("express");
const router = express.Router();
const {
  issueBook,
  returnBook,
  getAllIssuedBooks,
  borrowBook,
  getMyBooks,
  renewBook,
} = require("../controllers/issueController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Student routes
router.post("/borrow", protect, borrowBook);
router.get("/mybooks", protect, getMyBooks);
router.put("/:id/renew", protect, renewBook);

// Admin routes
router.get("/", protect, adminOnly, getAllIssuedBooks);
router.post("/issue", protect, adminOnly, issueBook);
router.put("/:id/return", protect, adminOnly, returnBook);

module.exports = router;
