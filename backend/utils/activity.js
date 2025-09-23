// backend/utils/activity.js
const pool = require('../db');

async function logActivity(user_id, action, meta = {}) {
  try {
    await pool.query('INSERT INTO activity_log (user_id, action, meta) VALUES ($1,$2,$3)', [user_id || null, action, JSON.stringify(meta)]);
  } catch (err) {
    console.error('Activity log failed', err);
  }
}

module.exports = { logActivity };