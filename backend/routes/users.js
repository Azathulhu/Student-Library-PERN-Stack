const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/activity');

/** Get my profile */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, lrn, email, grade_level_strand, contact_number, role, twofa_enabled, created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Update profile */
router.put('/me', authMiddleware, async (req, res) => {
  const { name, grade_level_strand, contact_number } = req.body;
  try {
    await pool.query(
      'UPDATE users SET name=$1, grade_level_strand=$2, contact_number=$3 WHERE id=$4',
      [name, grade_level_strand, contact_number, req.user.id]
    );
    await logActivity(req.user.id, 'update_profile', {});
    const { rows } = await pool.query(
      'SELECT id, name, lrn, email, grade_level_strand, contact_number, role FROM users WHERE id=$1',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Notifications - get */
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, message, created_at, read FROM notifications WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Admin: send notification to user */
/*router.post('/:id/notify', authMiddleware, async (req, res) => {
  // only admin/librarian can send - check role in token
  if (req.user.role !== 'admin' && req.user.role !== 'librarian')
    return res.status(403).json({ error: 'Forbidden' });

  const targetUser = req.params.id;
  const { title, message } = req.body;

  try {
    await pool.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [targetUser, title, message]
    );
    await logActivity(req.user.id, 'send_notification', { user: targetUser });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});*/
/** Admin: send notification to user by LRN */
router.post('/notify', authMiddleware, async (req, res) => {
  // only admin/librarian can send
  if (req.user.role !== 'admin' && req.user.role !== 'librarian')
    return res.status(403).json({ error: 'Forbidden' });

  const { lrn, title, message } = req.body;
  if (!lrn) return res.status(400).json({ error: 'LRN is required' });

  try {
    // find user by LRN
    const { rows: users } = await pool.query('SELECT id FROM users WHERE lrn=$1', [lrn]);
    if (!users.length) return res.status(404).json({ error: 'User with this LRN not found' });

    const user_id = users[0].id;

    // insert notification
    await pool.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [user_id, title, message]
    );
    await logActivity(req.user.id, 'send_notification', { user: user_id });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Admin: search users with pagination */
router.get('/admin-search', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'librarian')
    return res.status(403).json({ error: 'Forbidden' });

  const q = req.query.q ? `%${req.query.q}%` : '%';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const countSql =
      'SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR lrn ILIKE $1 OR email ILIKE $1';
    const { rows: countRows } = await pool.query(countSql, [q]);
    const total = parseInt(countRows[0].count);

    const sql =
      'SELECT id, name, lrn, email, grade_level_strand, contact_number, role FROM users WHERE name ILIKE $1 OR lrn ILIKE $1 OR email ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3';
    const { rows } = await pool.query(sql, [q, limit, offset]);

    res.json({ data: rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Get notifications with search & pagination */
router.get('/notifications/search', authMiddleware, async (req, res) => {
  const q = req.query.q ? `%${req.query.q}%` : '%';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const countSql =
      'SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND (title ILIKE $2 OR message ILIKE $2)';
    const { rows: countRows } = await pool.query(countSql, [req.user.id, q]);
    const total = parseInt(countRows[0].count);

    const sql =
      'SELECT id, title, message, created_at, read FROM notifications WHERE user_id=$1 AND (title ILIKE $2 OR message ILIKE $2) ORDER BY created_at DESC LIMIT $3 OFFSET $4';
    const { rows } = await pool.query(sql, [req.user.id, q, limit, offset]);

    res.json({ data: rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Delete a notification */
router.delete('/notifications/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM notifications WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    await logActivity(req.user.id, 'delete_notification', { notification_id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Mark all notifications as read */
router.patch('/notifications/mark-read', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET read = true WHERE user_id = $1', [req.user.id]);
    await logActivity(req.user.id, 'mark_notifications_read', {});
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Optional: Mark a single notification as read */
router.patch('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    await logActivity(req.user.id, 'mark_notification_read', { notification_id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
