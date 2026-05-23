const express = require('express');
const { db } = require('../db/client');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// POST /api/issues - Submit a new issue
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  const { title, description, category, lat, lng } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !category || !lat || !lng) {
    return res.status(400).json({ 
      error: 'Title, category, latitude and longitude are required' 
    });
  }

  const validCategories = ['pothole', 'water', 'power', 'sewage', 'other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ 
      error: 'Category must be one of: pothole, water, power, sewage, other' 
    });
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  try {
    const result = await db.query(
      `INSERT INTO issues 
        (title, description, category, location, reporter_id, photo_url)
       VALUES 
        ($1, $2, $3, ST_GeogFromText($4), $5, $6)
       RETURNING 
        id, title, description, category, status, 
        upvote_count, created_at, location, photo_url`,
      [title, description, category, `POINT(${lng} ${lat})`, req.user.userId, photo_url]
    );

    const newIssue = result.rows[0];

    // Find ward officer whose coverage area contains this location
    const assigneeResult = await db.query(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN area_assignments aa ON aa.user_id = u.id
       WHERE u.role = 'official'
         AND ST_Within(ST_GeogFromText($1)::geometry, aa.coverage_area)
       LIMIT 1`,
      [`POINT(${lng} ${lat})`]
    );

    if (assigneeResult.rows.length > 0) {
      await db.query(
        `UPDATE issues SET assigned_to = $1 WHERE id = $2`,
        [assigneeResult.rows[0].id, newIssue.id]
      );
      console.log(`Issue assigned to ward officer: ${assigneeResult.rows[0].name}`);
    }

    // Log the submission event
    await db.query(
      `INSERT INTO issue_events 
        (issue_id, event_type, new_status, triggered_by)
       VALUES ($1, 'submitted', 'submitted', $2)`,
      [newIssue.id, req.user.userId]
    );

    res.status(201).json(newIssue);

  } catch (err) {
    console.error('Create issue error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/issues - Get all issues
router.get('/', async (req, res) => {
  const { west, south, east, north } = req.query;

  try {
    let query;
    let params;

    if (west && south && east && north) {
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

// GET /api/issues/clusters - MUST be before /:id route
router.get('/clusters', async (req, res) => {
  const { west, south, east, north } = req.query;

  if (!west || !south || !east || !north) {
    return res.status(400).json({ error: 'Bounding box parameters required: west, south, east, north' });
  }

  try {
    const result = await db.query(
      `SELECT
        cluster_id,
        COUNT(*)                                                    AS report_count,
        ST_Y(ST_Centroid(ST_Collect(location::geometry)))           AS lat,
        ST_X(ST_Centroid(ST_Collect(location::geometry)))           AS lng,
        MODE() WITHIN GROUP (ORDER BY category)                     AS dominant_category,
        MAX(created_at)                                             AS latest_report,
        SUM(upvote_count)                                           AS total_upvotes
       FROM (
         SELECT
           id, category, location, created_at, upvote_count,
           ST_ClusterDBSCAN(location::geometry, eps := 0.0005, minpoints := 2)
             OVER () AS cluster_id
         FROM issues
         WHERE status != 'resolved'
           AND location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
       ) clustered
       WHERE cluster_id IS NOT NULL
       GROUP BY cluster_id
       ORDER BY total_upvotes DESC`,
      [west, south, east, north]
    );

    res.json(result.rows);

  } catch (err) {
    console.error('Clusters error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/issues/:id - Get single issue with full details
router.get('/:id', async (req, res) => {
  // GET /api/issues/:id - Get single issue with full details
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const issueResult = await db.query(
      `SELECT 
        i.id, i.title, i.description, i.category, 
        i.status, i.upvote_count, i.escalation_level,
        i.is_publicly_flagged, i.created_at,
        i.photo_url,
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
// POST /api/issues/:id/upvote
router.post('/:id/upvote', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const issueResult = await db.query(
      'SELECT id, upvote_count FROM issues WHERE id = $1', [id]
    );

    if (issueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const existingUpvote = await db.query(
      `SELECT id FROM issue_events WHERE issue_id = $1 AND triggered_by = $2 AND event_type = 'upvote'`,
      [id, userId]
    );

    if (existingUpvote.rows.length > 0) {
      await db.query(
        `DELETE FROM issue_events WHERE issue_id = $1 AND triggered_by = $2 AND event_type = 'upvote'`,
        [id, userId]
      );
      await db.query(`UPDATE issues SET upvote_count = upvote_count - 1 WHERE id = $1`, [id]);
      return res.json({ upvoted: false, message: 'Upvote removed' });
    }

    await db.query(
      `INSERT INTO issue_events (issue_id, event_type, triggered_by, note) VALUES ($1, 'upvote', $2, 'User upvoted this issue')`,
      [id, userId]
    );
    await db.query(`UPDATE issues SET upvote_count = upvote_count + 1 WHERE id = $1`, [id]);

    res.json({ upvoted: true, message: 'Upvote added' });

  } catch (err) {
    console.error('Upvote error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;