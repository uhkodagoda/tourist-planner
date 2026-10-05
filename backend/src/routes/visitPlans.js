const express = require('express');
const pool = require('../db');

const router = express.Router();

router.post('/', async (req, res) => {
  const { plan_name, planned_date, place_ids } = req.body;

  if (!Array.isArray(place_ids) || place_ids.length === 0) {
    return res.status(400).json({ error: 'At least one place must be included in the visit plan.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [placeRows] = await conn.query(
      `SELECT place_id, distance_km FROM places WHERE place_id IN (${place_ids.map(() => '?').join(',')})`,
      place_ids
    );

    if (placeRows.length !== place_ids.length) {
      await conn.rollback();
      return res.status(400).json({ error: 'One or more selected places could not be found.' });
    }

    const totalDistance = placeRows.reduce((sum, p) => sum + Number(p.distance_km), 0);

    const [planResult] = await conn.query(
      'INSERT INTO visit_plans (plan_name, planned_date, total_distance_km) VALUES (?, ?, ?)',
      [plan_name || 'My Day Visit Plan', planned_date || null, totalDistance]
    );

    const planId = planResult.insertId;
    const values = place_ids.map((placeId, index) => [planId, placeId, index + 1]);
    await conn.query(
      'INSERT INTO visit_plan_places (plan_id, place_id, visit_order) VALUES ?',
      [values]
    );

    await conn.commit();

    const [savedPlan] = await pool.query('SELECT * FROM visit_plans WHERE plan_id = ?', [planId]);
    res.status(201).json(savedPlan[0]);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to save visit plan.' });
  } finally {
    conn.release();
  }
});

// Admin dashboard stats: total plans saved + most-added places.
// Placed BEFORE /:id so "stats" is not swallowed as a plan id.
router.get('/stats', async (req, res) => {
  try {
    const [totalPlans] = await pool.query('SELECT COUNT(*) as count FROM visit_plans');
    const [popularPlaces] = await pool.query(`
      SELECT p.place_id, p.name, COUNT(vpp.place_id) as times_added
      FROM visit_plan_places vpp
      JOIN places p ON p.place_id = vpp.place_id
      GROUP BY vpp.place_id, p.name
      ORDER BY times_added DESC
      LIMIT 5
    `);
    res.json({ total_plans: totalPlans[0].count, popular_places: popularPlaces });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [planRows] = await pool.query('SELECT * FROM visit_plans WHERE plan_id = ?', [req.params.id]);
    if (planRows.length === 0) {
      return res.status(404).json({ error: 'Visit plan not found.' });
    }

    const [placeRows] = await pool.query(
      `SELECT p.*, vpp.visit_order
       FROM visit_plan_places vpp
       JOIN places p ON p.place_id = vpp.place_id
       WHERE vpp.plan_id = ?
       ORDER BY vpp.visit_order ASC`,
      [req.params.id]
    );

    res.json({ ...planRows[0], places: placeRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch visit plan.' });
  }
});

module.exports = router;