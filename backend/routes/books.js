const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/activity');

/** -------------------------------
 *  GET all books (with search + pagination)
 *  ------------------------------- */
router.get('/', authMiddleware, async (req, res) => {
  const q = req.query.q ? `%${req.query.q}%` : '%';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;

  try {
    // Count total
    const countSql = `
      SELECT COUNT(*) 
      FROM books 
      WHERE title ILIKE $1 OR author ILIKE $1
    `;
    const { rows: countRows } = await pool.query(countSql, [q]);
    const total = parseInt(countRows[0].count);

    // Fetch books
    const sql = `
      SELECT * 
      FROM books 
      WHERE title ILIKE $1 OR author ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const { rows } = await pool.query(sql, [q, limit, offset]);

    res.json({ data: rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** -------------------------------
 *  GET "My Books" (pending, borrowed, returned)
 *  ------------------------------- */
router.get('/my', authMiddleware, async (req, res) => {
  const uid = req.user.id;
  const q = req.query.q ? `%${req.query.q}%` : '%';
  const status = req.query.status || '%'; // pending | borrowed | returned
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;

  try {
    // Count total
    const countSql = `
      SELECT COUNT(*) 
      FROM borrowed_books b
      JOIN books bk ON b.book_id = bk.id
      WHERE b.user_id = $1
      AND (bk.title ILIKE $2 OR bk.author ILIKE $2)
      AND b.status::text ILIKE $3
    `;
    const { rows: countRows } = await pool.query(countSql, [uid, q, status]);
    const total = parseInt(countRows[0].count);

    // Fetch paginated results
    const sql = `
      SELECT 
        b.id AS borrow_id,
        b.status,
        b.requested_at,
        b.borrowed_at,
        b.due_date,
        b.returned_at,
        bk.id AS book_id,
        bk.title,
        bk.author,
        bk.description,
        bk.photo_url,
        bk.total_copies,
        bk.available_copies
      FROM borrowed_books b
      JOIN books bk ON b.book_id = bk.id
      WHERE b.user_id = $1
      AND (bk.title ILIKE $2 OR bk.author ILIKE $2)
      AND b.status::text ILIKE $3
      ORDER BY b.requested_at DESC
      LIMIT $4 OFFSET $5
    `;
    const { rows } = await pool.query(sql, [uid, q, status, limit, offset]);

    res.json({ data: rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** -------------------------------
 *  Request to borrow a book
 *  ------------------------------- */
router.post('/request/:id', authMiddleware, async (req, res) => {
  const uid = req.user.id;
  const bookId = req.params.id;

  try {
    // Check available copies
    const book = await pool.query('SELECT * FROM books WHERE id=$1', [bookId]);
    if (book.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    if (book.rows[0].available_copies < 1) return res.status(400).json({ error: 'No available copies' });

    // Check if already pending/borrowed
    const existing = await pool.query(
      'SELECT * FROM borrowed_books WHERE user_id=$1 AND book_id=$2 AND status IN (\'pending\', \'borrowed\')',
      [uid, bookId]
    );
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Already requested/borrowed' });

    // Insert borrow request
    await pool.query(
      'INSERT INTO borrowed_books (user_id, book_id, status, requested_at) VALUES ($1, $2, $3, NOW())',
      [uid, bookId, 'pending']
    );

    logActivity(uid, `Requested to borrow book ID ${bookId}`);
    res.json({ message: 'Borrow request submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** -------------------------------
 *  Admin: Approve borrow
 *  ------------------------------- */
router.put('/approve/:id', authMiddleware, adminOnly, async (req, res) => {
  const borrowId = req.params.id;

  try {
    // Get record
    const { rows } = await pool.query(
      'SELECT * FROM borrowed_books WHERE id=$1',
      [borrowId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });

    const record = rows[0];
    if (record.status !== 'pending') return res.status(400).json({ error: 'Not pending' });

    // Reduce available copies
    await pool.query('UPDATE books SET available_copies = available_copies - 1 WHERE id=$1', [record.book_id]);

    // Update record
    await pool.query(
      'UPDATE borrowed_books SET status=$1, borrowed_at=NOW(), due_date=NOW() + INTERVAL \'7 days\' WHERE id=$2',
      ['borrowed', borrowId]
    );

    logActivity(req.user.id, `Approved borrow ID ${borrowId}`);
    res.json({ message: 'Borrow approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** -------------------------------
 *  Admin: Mark book as returned
 *  ------------------------------- */
router.put('/return/:id', authMiddleware, adminOnly, async (req, res) => {
  const borrowId = req.params.id;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM borrowed_books WHERE id=$1',
      [borrowId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });

    const record = rows[0];
    if (record.status !== 'borrowed') return res.status(400).json({ error: 'Not borrowed' });

    // Increase available copies
    await pool.query('UPDATE books SET available_copies = available_copies + 1 WHERE id=$1', [record.book_id]);

    // Update record
    await pool.query(
      'UPDATE borrowed_books SET status=$1, returned_at=NOW() WHERE id=$2',
      ['returned', borrowId]
    );

    logActivity(req.user.id, `Returned borrow ID ${borrowId}`);
    res.json({ message: 'Book returned' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** -------------------------------
 *  Admin: Create new book
 *  ------------------------------- */
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { title, author, description, total_copies, photo_url } = req.body;
  try {
    const sql = `
      INSERT INTO books (title, author, description, total_copies, available_copies, photo_url, created_at)
      VALUES ($1, $2, $3, $4, $4, $5, NOW())
      RETURNING *
    `;
    const { rows } = await pool.query(sql, [title, author, description, total_copies, photo_url]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** -------------------------------
 *  Admin: Edit book
 *  ------------------------------- */
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { title, author, description, total_copies, available_copies, photo_url } = req.body;
  try {
    const sql = `
      UPDATE books
      SET title=$1, author=$2, description=$3, total_copies=$4, available_copies=$5, photo_url=$6
      WHERE id=$7
      RETURNING *
    `;
    const { rows } = await pool.query(sql, [title, author, description, total_copies, available_copies, photo_url, req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** -------------------------------
 *  Admin: Delete book
 *  ------------------------------- */
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM books WHERE id=$1', [req.params.id]);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
