const express = require('express');
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/:placeId/photos', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM place_photos WHERE place_id = ? ORDER BY uploaded_at ASC',
      [req.params.placeId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch photos.' });
  }
});

router.post('/:placeId/photos', requireAdmin, async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'A photo url is required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO place_photos (place_id, url) VALUES (?, ?)',
      [req.params.placeId, url]
    );
    const [rows] = await pool.query('SELECT * FROM place_photos WHERE photo_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add photo.' });
  }
});

router.delete('/:placeId/photos/:photoId', requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM place_photos WHERE photo_id = ? AND place_id = ?',
      [req.params.photoId, req.params.placeId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Photo not found.' });
    }
    res.json({ message: 'Photo removed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove photo.' });
  }
});

module.exports = router;