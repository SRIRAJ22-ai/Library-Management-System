const Book = require('../models/Book');

// @desc    Get all books (with search and category filter)
exports.getBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    // Search by title or author (matches your frontend search logic)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter - looks into the 'tags' array in MongoDB
    if (category && category !== 'all') {
      query.tags = { $in: [category] };
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new book (Admin Only)
exports.addBook = async (req, res) => {
  const { title, author, isbn, tags, totalCopies, location } = req.body;
  try {
    const bookExists = await Book.findOne({ isbn });
    if (bookExists) return res.status(400).json({ message: 'Book with this ISBN already exists' });

    // Handle tags: if it's a string from the frontend, split it into an array
    const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());

    const book = await Book.create({
      title,
      author,
      isbn,
      tags: tagArray,
      totalCopies,
      availableCopies: totalCopies, // New books start fully available
      location
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update book details (Admin Only)
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Update basic fields
    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.location = req.body.location || book.location;
    book.isbn = req.body.isbn || book.isbn;

    // Handle Tag updates
    if (req.body.tags) {
      book.tags = Array.isArray(req.body.tags) 
        ? req.body.tags 
        : req.body.tags.split(',').map(tag => tag.trim());
    }

    // Handle Copies logic: Adjust available copies if total changes
    if (req.body.totalCopies) {
      const diff = req.body.totalCopies - book.totalCopies;
      book.totalCopies = req.body.totalCopies;
      book.availableCopies += diff; // Adjust availability by the difference
    }

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete book (Admin Only)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Prevent deletion if books are currently out with students
    if (book.availableCopies !== book.totalCopies) {
      return res.status(400).json({ 
        message: 'Cannot delete book: Some copies are currently issued to students.' 
      });
    }

    await book.deleteOne();
    res.json({ message: 'Book removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};