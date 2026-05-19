const express = require('express');
const { db } = require('../db/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/issues - Submit a new issue
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, category, lat, lng } = req.body;

  // Validate inputs
  if (!title || !category || !lat || !lng) {
    return res.status(400).json({ 
      error: 'Title, category, latitude and longitude are required' 
    });
  }

  // Validate category
  const validCategories = ['pothole', 'water', 'power', 'sewage', 'other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ 
      error: 'Category must be one of: pothole, water, power, sewage, other' 
    });
  }

  // Validate coordinates
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ 
      error: 'Invalid coordinates' 
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO issues 
        (title, description, category, location, reporter_id)
       VALUES 
        ($1, $2, $3, ST_GeogFromText($4), $5)
       RETURNING 
        id, title, description, category, status, 
        upvote_count, created_at`,
      [
        title,
        description,
        category,
        `POINT(${lng} ${lat})`,
        req.user.userId
      ]
    );

    // Log the submission event
    await db.query(
      `INSERT INTO issue_events 
        (issue_id, event_type, new_status, triggered_by)
       VALUES ($1, 'submitted', 'submitted', $2)`,
      [result.rows[0].id, req.user.userId]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Create issue error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/issues - Get all issues (with optional bbox filter)
router.get('/', async (req, res) => {
  const { west, south, east, north } = req.query;

  try {
    let query;
    let params;

    if (west && south && east && north) {
      // Return only issues within the map viewport
      query = `
        SELECT 
          id, title, category, status, upvote_count,
          ST_Y(location::geometry) AS lat,
          ST_X(location::geometry) AS lng,
          created_at
        FROM issues
        WHERE location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        AND is_resolved = false
        ORDER BY created_at DESC
      `;
      params = [west, south, east, north];
    } else {
      // Return all unresolved issues
      query = `
        SELECT 
          id, title, category, status, upvote_count,
          ST_Y(location::geometry) AS lat,
          ST_X(location::geometry) AS lng,
          created_at
        FROM issues
        WHERE is_resolved = false
        ORDER BY created_at DESC
      `;
      params = [];
    }

    const result = await db.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.error('Get issues error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/issues/:id - Get single issue with full details
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Get the issue
    const issueResult = await db.query(
      `SELECT 
        i.id, i.title, i.description, i.category, 
        i.status, i.upvote_count, i.escalation_level,
        i.is_publicly_flagged, i.created_at,
        ST_Y(i.location::geometry) AS lat,
        ST_X(i.location::geometry) AS lng,
        u.name AS reporter_name
       FROM issues i
       JOIN users u ON u.id = i.reporter_id
       WHERE i.id = $1`,
      [id]
    );

    if (issueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Get the issue timeline events
    const eventsResult = await db.query(
      `SELECT event_type, old_status, new_status, triggered_by, note, created_at
       FROM issue_events
       WHERE issue_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      ...issueResult.rows[0],
      timeline: eventsResult.rows
    });

  } catch (err) {
    console.error('Get issue error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;