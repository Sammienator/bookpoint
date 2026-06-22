const express = require('express');
const router = express.Router();
const CATEGORIES = require('../constants/categories');

// GET /api/categories — the single source of truth for book categories.
// Frontend fetches this instead of keeping its own hardcoded copy.
router.get('/', (req, res) => {
  res.json({ success: true, data: CATEGORIES });
});

module.exports = router;