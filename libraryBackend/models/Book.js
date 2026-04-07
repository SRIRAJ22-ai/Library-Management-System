const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    index: true 
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  // Tags for filtering (Science, Educational, etc.)
  tags: {
    type: [String], 
    default: [],
    index: true 
  },
  status: {
    type: String,
    enum: ['available', 'out_of_stock', 'maintenance'],
    default: 'available'
  },
  totalCopies: {
    type: Number,
    required: true,
    default: 1
  },
  availableCopies: {
    type: Number,
    required: true,
    default: 1
  },
  location: {
    type: String, // e.g., "Shelf B-4"
    trim: true
  }
}, { 
  timestamps: true 
});

// Auto-update status based on available copies
bookSchema.pre('save', function(next) {
  if (this.availableCopies <= 0) {
    this.status = 'out_of_stock';
  } else {
    this.status = 'available';
  }
  next();
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;