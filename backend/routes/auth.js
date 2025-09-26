// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/activity');

require('dotenv').config();

// =====================
// REGISTER
// =====================
router.post('/register', async (req, res) => {
  const { name, lrn, email, password, grade_level_strand, contact_number } = req.body;

  if (!name || !lrn || !email || !password) 
    return res.status(400).json({ error: 'Missing required fields' });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const q = `
      INSERT INTO users (name, lrn, email, password, grade_level_strand, contact_number)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id, name, lrn, email, role, grade_level_strand, contact_number
    `;
    const vals = [name, lrn, email, hashed, grade_level_strand || null, contact_number || null];

    const { rows } = await pool.query(q, vals);
    const user = rows[0];

    await logActivity(user.id, 'register', { lrn: user.lrn });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user });

  } catch (err) {
    console.error(err);
    if (err.code === '23505') // unique violation
      return res.status(400).json({ error: 'LRN or email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// LOGIN
// =====================
router.post('/login', async (req, res) => {
  const { lrn, password } = req.body;

  if (!lrn || !password) 
    return res.status(400).json({ error: 'Missing fields' });

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE lrn = $1', [lrn]);
    if (!rows.length) return res.status(400).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });

    await logActivity(user.id, 'login', {});

    // Return all necessary fields
    res.json({ 
      token, 
      user: {
        id: user.id,
        name: user.name,
        lrn: user.lrn,
        email: user.email,
        role: user.role,
        grade_level_strand: user.grade_level_strand,
        contact_number: user.contact_number
      } 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
