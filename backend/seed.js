// backend/seed.js
const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seed(){
  try {
    const pw = await bcrypt.hash('adminpass', 10);
    await pool.query(`
      INSERT INTO users (name, lrn, email, password, role, grade_level_strand, contact_number)
      VALUES ('Admin Librarian', '000000', 'admin@school.local', $1, 'admin', 'N/A', '09171234567')
      ON CONFLICT (lrn) DO NOTHING;
    `, [pw]);

    await pool.query(`
      INSERT INTO books (title, author, description, total_copies, available_copies)
      VALUES
      ('Physics for STEM', 'A. Physicist', 'Physics basics', 3, 3),
      ('General Chemistry', 'B. Chemist', 'Chem fundamentals', 2, 2),
      ('Algebra Essentials', 'C. Mathematician', 'Algebra book', 5, 5)
      ON CONFLICT DO NOTHING;
    `);

    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();