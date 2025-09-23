const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/activity');

/** GET all books or search via ?q= */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const q = req.query.q ? `%${req.query.q}%` : '%';
    const sql = `SELECT id,title,author,photo_url,description,total_copies,available_copies FROM books
                 WHERE title ILIKE $1 OR author ILIKE $1 ORDER BY id DESC`;
    const { rows } = await pool.query(sql, [q]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Admin: add book */
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { title, author, description, photo_url, total_copies } = req.body;
  try {
    const available = total_copies || 1;
    const sql = `INSERT INTO books (title,author,description,photo_url,total_copies,available_copies)
                 VALUES ($1,$2,$3,$4,$5,$5) RETURNING *`;
    const { rows } = await pool.query(sql, [title, author, description, photo_url, available]);
    await logActivity(req.user.id, 'add_book', { book_id: rows[0].id });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Admin: edit book */
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const id = req.params.id;
  const { title, author, description, photo_url, total_copies } = req.body;
  try {
    // adjust available copies if total changed
    const { rows: oldRows } = await pool.query('SELECT total_copies,available_copies FROM books WHERE id=$1', [id]);
    if (!oldRows.length) return res.status(404).json({ error: 'Not found' });
    const old = oldRows[0];
    let available = old.available_copies + ((total_copies || old.total_copies) - old.total_copies);
    if (available < 0) available = 0;
    const sql = `UPDATE books SET title=$1,author=$2,description=$3,photo_url=$4,total_copies=$5,available_copies=$6 WHERE id=$7 RETURNING *`;
    const { rows } = await pool.query(sql, [title, author, description, photo_url, total_copies, available, id]);
    await logActivity(req.user.id, 'edit_book', { book_id: id });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Admin: delete book (deletes borrowed_books first) */
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const id = req.params.id;
  try {
    // Delete all borrowed_books records for this book
    await pool.query('DELETE FROM borrowed_books WHERE book_id=$1', [id]);
    // Now delete the book
    await pool.query('DELETE FROM books WHERE id=$1', [id]);
    await logActivity(req.user.id, 'delete_book', { book_id: id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Student requests to borrow (creates pending request) */
router.post('/request/:id', authMiddleware, async (req, res) => {
  const book_id = req.params.id;
  const user_id = req.user.id;
  try {
    // create pending record
    const sql = `INSERT INTO borrowed_books (user_id, book_id, status, requested_at) VALUES ($1,$2,'pending',CURRENT_TIMESTAMP) RETURNING *`;
    const { rows } = await pool.query(sql, [user_id, book_id]);
    await logActivity(user_id, 'request_borrow', { book_id });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Admin approves a pending request => borrow */
router.post('/approve/:borrowId', authMiddleware, adminOnly, async (req, res) => {
  const bid = req.params.borrowId;
  const { due_days = 7, admin_note } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM borrowed_books WHERE id=$1', [bid]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const rec = rows[0];
    if (rec.status !== 'pending') return res.status(400).json({ error: 'Not pending' });

    // check availability
    const { rows: bookRows } = await pool.query('SELECT available_copies FROM books WHERE id=$1', [rec.book_id]);
    if (!bookRows.length || bookRows[0].available_copies < 1) return res.status(400).json({ error: 'No copies available' });

    // decrement available
    await pool.query('UPDATE books SET available_copies = available_copies - 1 WHERE id=$1', [rec.book_id]);
    const now = new Date();
    const due = new Date(now.getTime() + due_days * 24*60*60*1000);
    const updateSql = `UPDATE borrowed_books SET status='borrowed', borrowed_at=CURRENT_TIMESTAMP, due_date=$1, admin_note=$2 WHERE id=$3 RETURNING *`;
    const { rows: updated } = await pool.query(updateSql, [due, admin_note || null, bid]);
    await logActivity(req.user.id, 'approve_request', { borrowId: bid });
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Student returns book (creates returned_at and increments available) */
router.post('/return/:borrowId', authMiddleware, async (req, res) => {
  const bid = req.params.borrowId;
  const user_id = req.user.id;
  try {
    const { rows } = await pool.query('SELECT * FROM borrowed_books WHERE id=$1', [bid]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const rec = rows[0];
    if (rec.user_id !== user_id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not allowed' });
    if (rec.status !== 'borrowed') return res.status(400).json({ error: 'Not currently borrowed' });

    await pool.query('UPDATE borrowed_books SET status=$1, returned_at=CURRENT_TIMESTAMP WHERE id=$2', ['returned', bid]);
    await pool.query('UPDATE books SET available_copies = available_copies + 1 WHERE id=$1', [rec.book_id]);
    await logActivity(user_id, 'return_book', { borrowId: bid });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Get user's borrowed/pending/returned */
router.get('/my', authMiddleware, async (req, res) => {
  const uid = req.user.id;
  try {
    const sql = `SELECT b.id as borrow_id, bk.id as book_id, bk.title, bk.author, b.status, b.requested_at, b.borrowed_at, b.due_date, b.returned_at
                 FROM borrowed_books b JOIN books bk ON b.book_id = bk.id
                 WHERE b.user_id = $1 ORDER BY b.requested_at DESC`;
    const { rows } = await pool.query(sql, [uid]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Admin get all pending requests */
router.get('/pending', authMiddleware, adminOnly, async (req, res) => {
  try {
    const sql = `SELECT b.id as borrow_id, bk.title, u.id as user_id, u.name, u.lrn, b.requested_at
                 FROM borrowed_books b
                 JOIN books bk ON b.book_id = bk.id
                 JOIN users u ON b.user_id = u.id
                 WHERE b.status='pending' ORDER BY b.requested_at ASC`;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Admin: force return a borrowed book */
router.post('/force-return/:borrowId', authMiddleware, adminOnly, async (req, res) => {
  const bid = req.params.borrowId;
  try {
    const { rows } = await pool.query('SELECT * FROM borrowed_books WHERE id=$1', [bid]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const rec = rows[0];
    if (rec.status !== 'borrowed') return res.status(400).json({ error: 'Not currently borrowed' });

    await pool.query('UPDATE borrowed_books SET status=$1, returned_at=CURRENT_TIMESTAMP WHERE id=$2', ['returned', bid]);
    await pool.query('UPDATE books SET available_copies = available_copies + 1 WHERE id=$1', [rec.book_id]);
    await logActivity(req.user.id, 'force_return_book', { borrowId: bid });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Admin: get all currently borrowed books */
router.get('/borrowed', authMiddleware, adminOnly, async (req, res) => {
  try {
    const sql = `SELECT b.id as borrow_id, bk.title, u.name, u.lrn, b.borrowed_at, b.due_date
                 FROM borrowed_books b
                 JOIN books bk ON b.book_id = bk.id
                 JOIN users u ON b.user_id = u.id
                 WHERE b.status='borrowed'
                 ORDER BY b.borrowed_at ASC`;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Admin: search books with pagination */
router.get('/admin-search', authMiddleware, adminOnly, async (req, res) => {
  const q = req.query.q ? `%${req.query.q}%` : '%';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const countSql = `SELECT COUNT(*) FROM books WHERE title ILIKE $1 OR author ILIKE $1`;
    const { rows: countRows } = await pool.query(countSql, [q]);
    const total = parseInt(countRows[0].count);

    const sql = `SELECT * FROM books WHERE title ILIKE $1 OR author ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3`;
    const { rows } = await pool.query(sql, [q, limit, offset]);
    res.json({ data: rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Admin: search borrowed/returned books with pagination */
router.get('/admin-borrowed-search', authMiddleware, adminOnly, async (req, res) => {
  const q = req.query.q ? `%${req.query.q}%` : '%';
  const status = req.query.status || '%'; // 'borrowed', 'returned', 'pending'
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const countSql = `
      SELECT COUNT(*) FROM borrowed_books b
      JOIN books bk ON b.book_id = bk.id
      JOIN users u ON b.user_id = u.id
      WHERE (bk.title ILIKE $1 OR u.name ILIKE $1 OR u.lrn ILIKE $1)
      AND b.status::text ILIKE $2
    `;
    const { rows: countRows } = await pool.query(countSql, [q, status]);
    const total = parseInt(countRows[0].count);

    const sql = `
      SELECT b.id as borrow_id, bk.title, u.name, u.lrn, b.status, b.borrowed_at, b.due_date, b.returned_at, b.requested_at
      FROM borrowed_books b
      JOIN books bk ON b.book_id = bk.id
      JOIN users u ON b.user_id = u.id
      WHERE (bk.title ILIKE $1 OR u.name ILIKE $1 OR u.lrn ILIKE $1)
      AND b.status::text ILIKE $2
      ORDER BY b.borrowed_at DESC
      LIMIT $3 OFFSET $4
    `;
    const { rows } = await pool.query(sql, [q, status, limit, offset]);
    res.json({ data: rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/** Public: paginated book list for users */
router.get('/search', authMiddleware, async (req, res) => {
  const q = req.query.q ? `%${req.query.q}%` : '%';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;

  try {
    const countSql = `SELECT COUNT(*) FROM books WHERE title ILIKE $1 OR author ILIKE $1`;
    const { rows: countRows } = await pool.query(countSql, [q]);
    const total = parseInt(countRows[0].count);

    const sql = `
      SELECT id, title, author, photo_url, description, total_copies, available_copies
      FROM books
      WHERE title ILIKE $1 OR author ILIKE $1
      ORDER BY id DESC
      LIMIT $2 OFFSET $3
    `;
    const { rows } = await pool.query(sql, [q, limit, offset]);

    res.json({ data: rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel pending request
router.delete('/cancel-pending/:borrowId', authMiddleware, async (req, res) => {
  const bid = req.params.borrowId;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM borrowed_books WHERE id=$1 AND status=$2',
      [bid, 'pending']
    );
    if (!rows.length) return res.status(400).json({ error: 'Not a pending request' });

    await pool.query('DELETE FROM borrowed_books WHERE id=$1', [bid]);
    await logActivity(req.user.id, 'cancel_pending', { borrowId: bid });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete returned record
router.delete('/delete-returned/:borrowId', authMiddleware, async (req, res) => {
  const bid = req.params.borrowId;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM borrowed_books WHERE id=$1 AND status=$2',
      [bid, 'returned']
    );
    if (!rows.length) return res.status(400).json({ error: 'Not a returned book' });

    await pool.query('DELETE FROM borrowed_books WHERE id=$1', [bid]);
    await logActivity(req.user.id, 'delete_returned', { borrowId: bid });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;