const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;

  console.log('---AUTH CHECK---');
  console.log('Request URL:', req.originalUrl);
  console.log('Auth header:', auth);

  if (!auth) {
    console.log('No Authorization header found');
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = auth.split(' ')[1];
  if (!token) {
    console.log('Bearer token missing');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT payload:', payload);
    req.user = payload;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No user' });
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly };
