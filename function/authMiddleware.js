const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'carimakan_super_secret_key_123';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { uid, role }
    next();
  } catch (error) {
    req.user = null;
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  next();
}

function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this resource' });
    }
    next();
  };
}

module.exports = {
  authMiddleware,
  requireAuth,
  requireRole,
  JWT_SECRET,
};
