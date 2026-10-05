const express = require('express');
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const VALID_CATEGORIES = ['Religious', 'Nature', 'Heritage', 'Cultural', 'Recreational'];

// FR-01, FR-02, FR-03: list all places, ordered by distance ascending by default
// FR-04, FR-05, FR-06: optional ?category= filter, applied server-side
router.get('/', async (req, res) => {
  const { category } = req.query;

  try {
    let sql = 'SELECT * FROM places';
    const params = [];

    if (category && category !== 'All') {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
      }
      sql += ' WHERE category = ?';
      params.push(category);
    }

    sql += ' ORDER BY distance_km ASC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch places.' });
  }
});

// FR-07: full detail of a single place
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM places WHERE place_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Place not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch place.' });
  }
});

// ---- Admin-only routes below (FR-17 to FR-21) ----

function validatePlacePayload(body, { partial = false } = {}) {
  const required = ['name', 'category', 'description', 'distance_km', 'latitude', 'longitude'];
  const errors = [];

  if (!partial) {
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        errors.push(`Field "${field}" is required.`);
      }
    }
  }

  if (body.category !== undefined && !VALID_CATEGORIES.includes(body.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  return errors;
}

// FR-18: add a new place
router.post('/', requireAdmin, async (req, res) => {
  const errors = validatePlacePayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  const {
    name, category, description, opening_times, travel_tips,
    distance_km, latitude, longitude, is_verified, image_url
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO places
        (name, category, description, opening_times, travel_tips, distance_km, latitude, longitude, is_verified, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, category, description,
        opening_times || 'Not specified',
        travel_tips || null,
        distance_km, latitude, longitude,
        is_verified ? 1 : 0,
        image_url || null
      ]
    );

    const [rows] = await pool.query('SELECT * FROM places WHERE place_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create place.' });
  }
});

// FR-19: edit any field of an existing place
router.put('/:id', requireAdmin, async (req, res) => {
  const errors = validatePlacePayload(req.body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  const fields = [
    'name', 'category', 'description', 'opening_times', 'travel_tips',
    'distance_km', 'latitude', 'longitude', 'is_verified', 'image_url'
  ];

  const updates = [];
  const params = [];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(field === 'is_verified' ? (req.body[field] ? 1 : 0) : req.body[field]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields provided to update.' });
  }

  params.push(req.params.id);

  try {
    const [result] = await pool.query(
      `UPDATE places SET ${updates.join(', ')} WHERE place_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Place not found.' });
    }

    const [rows] = await pool.query('SELECT * FROM places WHERE place_id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update place.' });
  }
});

// FR-20: delete an existing place (frontend asks for confirmation before calling this)
// BR-03: the system must always keep at least ten place records
const MIN_PLACES = 10;

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM places');
    if (total <= MIN_PLACES) {
      return res.status(400).json({
        error: `At least ${MIN_PLACES} places must remain in the system, so this place cannot be deleted. Add another place first.`
      });
    }

    const [result] = await pool.query('DELETE FROM places WHERE place_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Place not found.' });
    }
    res.json({ message: 'Place deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete place.' });
  }
});

module.exports = router;
