const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/:placeId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM reviews WHERE place_id = ? ORDER BY created_at DESC',
      [req.params.placeId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

router.post('/', async (req, res) => {
  const { place_id, reviewer_name, rating, comment } = req.body;

  if (!place_id || !reviewer_name || !comment) {
    return res.status(400).json({ error: 'place_id, reviewer_name and comment are required.' });
  }
  const numRating = Number(rating);
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be a whole number from 1 to 5.' });
  }
  if (reviewer_name.length > 100) {
    return res.status(400).json({ error: 'Name is too long.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO reviews (place_id, reviewer_name, rating, comment) VALUES (?, ?, ?, ?)',
      [place_id, reviewer_name.trim(), numRating, comment.trim()]
    );
    const [rows] = await pool.query('SELECT * FROM reviews WHERE review_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

module.exports = router;