const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'honeygold-secret-2024';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'Access token required' });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};
