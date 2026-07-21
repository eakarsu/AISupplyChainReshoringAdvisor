const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const secret = process.env.JWT_SECRET;
  if ((secret || '').length < 32) return res.status(503).json({ error: 'Secure authentication is not configured' });
  jwt.verify(token, secret, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    if (!decoded.tenantId || !decoded.role || !decoded.subjectIds) return res.status(403).json({ error: 'Token lacks authorization context' });
    req.user = decoded;
    next();
  });
}

module.exports = authMiddleware;
