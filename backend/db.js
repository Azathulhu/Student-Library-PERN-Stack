// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // use the full Neon URL
  ssl: { rejectUnauthorized: false }         // required for Render + Neon
});

pool.on('error', (err) => {
  console.error('Unexpected PG error', err);
  process.exit(-1);
});

module.exports = pool;
