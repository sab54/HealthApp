const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecret';

function authMiddleware(requiredRole = null) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, SECRET);
      req.user = decoded;
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };
}

module.exports = authMiddleware;
