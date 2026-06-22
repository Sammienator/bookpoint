const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');
const upload = require('../middleware/upload');

// GET /api/books — fetch all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json({ success: true, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/books/:id — fetch single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/books — create a new book (with optional image upload)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, author, description, price, stock, genre } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const book = new Book({
      title,
      author,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      genre,
      image: imageUrl,
    });

    const saved = await book.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/books/:id — update a book
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, author, description, price, stock, genre } = req.body;

    const existing = await Book.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Book not found' });

    // If a new image is uploaded, delete the old one
    let imageUrl = existing.image;
    if (req.file) {
      if (existing.image) {
        const oldPath = path.join(__dirname, '..', existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        genre,
        image: imageUrl,
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/books/:id — delete a book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    // Delete associated image file
    if (book.image) {
      const imgPath = path.join(__dirname, '..', book.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;