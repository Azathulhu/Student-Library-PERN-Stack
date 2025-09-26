// backend/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const pool = require('./db');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// --------- API ROUTES ---------
app.get('/api/ping', (req, res) => res.json({ ok: true }));

app.get('/api/db-test', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.json({ ok: true, now: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);

// --------- SERVE REACT BUILD ---------
const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));

// For any route not handled by API, send back index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// --------- START SERVER ---------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
