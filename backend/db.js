// backend/db-pg.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // or build from PGHOST etc
  ssl: { rejectUnauthorized: false } // use for many cloud providers — Neon handles TLS
});

module.exports = { pool };
