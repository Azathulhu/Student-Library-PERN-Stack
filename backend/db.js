// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || (
  process.env.DB_USER && process.env.DB_PASS && process.env.DB_HOST
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`
    : undefined
);

const pool = new Pool({
  connectionString,
  // In production we set an SSL object to avoid certificate verification failures on some hosts.
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected PG error', err);
});

module.exports = pool;
